import { describe, expect, it, vi } from 'vitest';
import { normalizeClientIp, rfqGuard, UNAVAILABLE_RETRY_AFTER_SECONDS, type LimiterNamespace, type LimiterStub } from '../cloudflare/shared/rfq-guard.ts';

const BASE = 'https://staging.example';
const IP = '203.0.113.7';
const rfq = (headers: Record<string, string> = {}, method = 'POST', path = '/api/rfq') =>
  new Request(BASE + path, { method, headers: { 'content-type': 'application/json', origin: BASE, 'cf-ray': 'ray-1', ...headers }, body: method === 'POST' ? '{}' : undefined });

const ns = (hit: LimiterStub['hit']) => {
  const names: string[] = [];
  const namespace: LimiterNamespace = { idFromName: (n) => { names.push(n); return n; }, get: () => ({ hit }) };
  return { namespace, names };
};

describe('edge RFQ guard', () => {
  it('lets a request under the limit through and keys the limiter by client IP', async () => {
    const { namespace, names } = ns(async () => ({ ok: true, retryAfterSeconds: 0 }));
    expect(await rfqGuard(rfq(), { RFQ_LIMITER: namespace }, IP, vi.fn())).toBeNull();
    expect(names).toEqual([IP]);
  });

  it('answers 429 rate_limited with Retry-After when the limit is reached', async () => {
    const log = vi.fn();
    const { namespace } = ns(async () => ({ ok: false, retryAfterSeconds: 540 }));
    const res = await rfqGuard(rfq(), { RFQ_LIMITER: namespace }, IP, log, { 'X-Robots-Tag': 'noindex' });
    expect(res?.status).toBe(429);
    expect(res?.headers.get('retry-after')).toBe('540');
    expect(res?.headers.get('cache-control')).toBe('no-store');
    expect(res?.headers.get('x-robots-tag')).toBe('noindex');
    expect(await res?.json()).toEqual({ error: 'rate_limited' });
    expect(log).toHaveBeenCalledWith('warn', 'rfq.rate_limited', { ray: 'ray-1', retryAfterSeconds: 540 });
  });

  it('FAILS CLOSED with 503 rfq_unavailable when the Durable Object call throws', async () => {
    const log = vi.fn();
    const { namespace } = ns(async () => { throw new TypeError('DO overloaded'); });
    const res = await rfqGuard(rfq(), { RFQ_LIMITER: namespace }, IP, log);
    expect(res?.status).toBe(503);
    expect(res?.headers.get('retry-after')).toBe(String(UNAVAILABLE_RETRY_AFTER_SECONDS));
    expect(await res?.json()).toEqual({ error: 'rfq_unavailable' });
    expect(log).toHaveBeenCalledWith('error', 'rfq.limiter_unavailable', { ray: 'ray-1', error: 'TypeError', policy: 'fail_closed' });
  });

  it('fails closed when the limiter binding is missing (misconfigured Worker)', async () => {
    const res = await rfqGuard(rfq(), {}, IP, vi.fn());
    expect(res?.status).toBe(503);
  });

  it('never logs the client IP', async () => {
    const log = vi.fn();
    await rfqGuard(rfq(), {}, IP, log);
    const { namespace } = ns(async () => ({ ok: false, retryAfterSeconds: 9 }));
    await rfqGuard(rfq(), { RFQ_LIMITER: namespace }, IP, log);
    expect(JSON.stringify(log.mock.calls)).not.toContain(IP);
  });

  it('does not count requests the app rejects first (cross-origin, non-JSON) or other routes', async () => {
    const hit = vi.fn(async () => ({ ok: false, retryAfterSeconds: 1 }));
    const { namespace } = ns(hit);
    const env = { RFQ_LIMITER: namespace };
    expect(await rfqGuard(rfq({ origin: 'https://evil.example' }), env, IP, vi.fn())).toBeNull();
    expect(await rfqGuard(rfq({ 'content-type': 'text/plain' }), env, IP, vi.fn())).toBeNull();
    expect(await rfqGuard(rfq({}, 'GET', '/en'), env, IP, vi.fn())).toBeNull();
    expect(await rfqGuard(rfq({}, 'POST', '/api/other'), env, IP, vi.fn())).toBeNull();
    expect(hit).not.toHaveBeenCalled();
  });

  it('passes the configured limits to the Durable Object', async () => {
    const hit = vi.fn(async () => ({ ok: true, retryAfterSeconds: 0 }));
    const { namespace } = ns(hit);
    await rfqGuard(rfq(), { RFQ_LIMITER: namespace, RFQ_RATE_LIMIT_MAX: '7', RFQ_RATE_LIMIT_WINDOW_SECONDS: '300' }, IP, vi.fn());
    expect(hit).toHaveBeenCalledWith(7, 300);
  });

  it('overwrites spoofable client-IP headers with CF-Connecting-IP', () => {
    const h = new Headers({ 'x-forwarded-for': '198.51.100.1', 'x-real-ip': '198.51.100.1' });
    normalizeClientIp(h, IP);
    expect(h.get('x-forwarded-for')).toBe(IP);
    expect(h.get('x-real-ip')).toBe(IP);
  });
});
