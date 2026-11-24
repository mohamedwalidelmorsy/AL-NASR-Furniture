import { describe, expect, it, vi } from 'vitest';
import { emptyRfqForm, rfqFormSchema, rfqPayloadSchema, type RfqFormValues } from '@/features/rfq/schema';
import { availablePrefs, buildRfqPayload, effectivePref } from '@/features/rfq/payload';
import { RfqSubmitError, submitRfq } from '@/features/rfq/client';
import { handleRfq } from '@/features/rfq/server/handler';
import { DeliveryError, ResendDelivery, formatRfqText, getDelivery, type RfqDelivery } from '@/features/rfq/server/delivery';
import { createRateLimiter } from '@/lib/rate-limit';

const valid = (over: Partial<RfqFormValues> = {}): RfqFormValues => ({ ...emptyRfqForm(), name: 'Ahmed', country: 'SA', email: 'a@b.co', message: 'Need 3 sets', consent: true, ...over });
const issues = (v: RfqFormValues, hasItems = false) => {
  const r = rfqFormSchema(hasItems).safeParse(v);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}:${i.message}`).sort();
};

describe('RFQ form validation (shared zod schema)', () => {
  it('accepts a minimal valid request', () => expect(issues(valid())).toEqual([]));
  it('requires name, country and consent', () => {
    expect(issues(valid({ name: ' ', country: '', consent: false }))).toEqual(['consent:consent', 'country:country', 'name:name']);
  });
  it('requires an email or a phone', () => {
    expect(issues(valid({ email: '', phone: '' }))).toEqual(['email:contact', 'phone:contact']);
    expect(issues(valid({ email: '', phone: '+971 50 123 4567' }))).toEqual([]);
  });
  it('validates email and phone formats', () => {
    expect(issues(valid({ email: 'nope' }))).toEqual(['email:email']);
    expect(issues(valid({ phone: '12' }))).toEqual(['phone:phone']);
    expect(issues(valid({ phone: '+20 (100) 123-4567' }))).toEqual([]);
  });
  it('requires a message only when the inquiry list is empty', () => {
    expect(issues(valid({ message: '' }), false)).toEqual(['message:message']);
    expect(issues(valid({ message: '' }), true)).toEqual([]);
  });
  it('rejects unknown countries and enum values', () => {
    expect(issues(valid({ country: 'ZZ' }))).toEqual(['country:country']);
    expect(rfqFormSchema(false).safeParse({ ...valid(), shipTerm: 'DDP' }).success).toBe(false);
  });
});

describe('payload builder', () => {
  const items = [{ id: 'pv-br-01', qty: 3, note: ' extra ' }, { id: 'SAMPLE-OLD', qty: 1, note: '' }];
  it('drops stale catalog ids, trims and nulls empty optionals', () => {
    const p = buildRfqPayload(valid({ phone: '', pref: '' }), items, 'ar', 'https://x/ar/contact', new Date('2026-01-02T03:04:05Z'));
    expect(p.items).toEqual([{ collection_id: 'pv-br-01', code: 'PV-BR-01', quantity: 3, unit: 'set', notes: 'extra' }]);
    expect(p.contact).toMatchObject({ name: 'Ahmed', company: null, phone: null, preferred_method: 'email' });
    expect(p.locale).toBe('ar');
    expect(p.consent.given).toBe(true);
    expect(p.created_at).toBe('2026-01-02T03:04:05.000Z');
    expect(rfqPayloadSchema.safeParse(p).success).toBe(true);
  });
  it('limits preferred contact methods to the channels provided', () => {
    expect(availablePrefs({ email: '', phone: '' })).toEqual([]);
    expect(availablePrefs({ email: 'a@b.co', phone: '' })).toEqual(['email']);
    expect(availablePrefs({ email: '', phone: '+9715' })).toEqual(['whatsapp', 'phone']);
    expect(effectivePref({ email: 'a@b.co', phone: '', pref: 'phone' })).toBe('email');
  });
});

const body = (over: Record<string, unknown> = {}) => ({ ...buildRfqPayload(valid(), [{ id: 'pv-br-01', qty: 2, note: '' }], 'en', 'https://x/en/contact'), ...over });
const req = (b: unknown, headers: Record<string, string> = {}) =>
  new Request('http://localhost:3000/api/rfq', { method: 'POST', headers: { 'content-type': 'application/json', host: 'localhost:3000', 'x-forwarded-for': '1.2.3.4', ...headers }, body: typeof b === 'string' ? b : JSON.stringify(b) });
const okDelivery = (): RfqDelivery & { send: ReturnType<typeof vi.fn> } => ({ isConfigured: () => true, send: vi.fn(async () => {}) });
const fresh = () => createRateLimiter(100, 60);

describe('POST /api/rfq handler', () => {
  it('delivers a valid request and returns a reference', async () => {
    const d = okDelivery();
    const res = await handleRfq(req(body()), { delivery: d, limiter: fresh() });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { reference: string };
    expect(json.reference).toMatch(/^RFQ-\d{8}-[0-9A-F]{6}$/);
    expect(d.send).toHaveBeenCalledOnce();
  });
  it('never fakes success when delivery is not configured (503) and logs it', async () => {
    const log = vi.fn();
    const res = await handleRfq(req(body()), { delivery: getDelivery({}), limiter: fresh(), log });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'not_configured' });
    expect(log).toHaveBeenCalledWith('rfq.not_configured', {});
  });
  it('logs a sent RFQ with its reference only (no personal data)', async () => {
    const log = vi.fn();
    const res = await handleRfq(req(body()), { delivery: okDelivery(), limiter: fresh(), log });
    const { reference } = (await res.json()) as { reference: string };
    expect(log).toHaveBeenCalledWith('rfq.sent', { reference, items: expect.any(Number) });
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/Ahmed|a@b\.co|Need 3 sets|1\.2\.3\.4/);
  });
  it('reports delivery failure as 502 and logs no personal data', async () => {
    const log = vi.fn();
    const d: RfqDelivery = { isConfigured: () => true, send: async () => { throw new DeliveryError(500); } };
    const res = await handleRfq(req(body()), { delivery: d, limiter: fresh(), log });
    expect(res.status).toBe(502);
    const logged = JSON.stringify(log.mock.calls);
    expect(logged).toContain('rfq.delivery_failed');
    expect(logged).not.toMatch(/Ahmed|a@b\.co|Need 3 sets/);
  });
  it('returns 422 with issue codes for invalid payloads', async () => {
    const res = await handleRfq(req(body({ destination_country: 'ZZ' })), { delivery: okDelivery(), limiter: fresh() });
    expect(res.status).toBe(422);
  });
  it('rejects unknown catalog items', async () => {
    const b = body();
    (b as { items: unknown[] }).items = [{ collection_id: 'nope', code: 'X', quantity: 1, unit: 'set', notes: null }];
    expect((await handleRfq(req(b), { delivery: okDelivery(), limiter: fresh() })).status).toBe(422);
  });
  it('rejects filled honeypots without sending', async () => {
    const d = okDelivery();
    const res = await handleRfq(req(body({ website: 'http://spam' })), { delivery: d, limiter: fresh() });
    expect(res.status).toBe(400);
    expect(d.send).not.toHaveBeenCalled();
  });
  it('rate-limits repeated submissions per IP', async () => {
    const limiter = createRateLimiter(2, 60);
    const d = okDelivery();
    const codes: number[] = [];
    for (let i = 0; i < 4; i++) codes.push((await handleRfq(req(body()), { delivery: d, limiter })).status);
    expect(codes).toEqual([200, 200, 429, 429]);
    expect((await handleRfq(req(body()), { delivery: d, limiter })).headers.get('retry-after')).toBeTruthy();
  });
  it('rejects bad JSON, wrong content type, oversize bodies and cross-origin posts', async () => {
    const o = { delivery: okDelivery(), limiter: fresh() };
    expect((await handleRfq(req('{oops'), o)).status).toBe(400);
    expect((await handleRfq(req(body(), { 'content-type': 'text/plain' }), o)).status).toBe(415);
    expect((await handleRfq(req('x'.repeat(70_000)), o)).status).toBe(413);
    expect((await handleRfq(req(body(), { origin: 'https://evil.example' }), o)).status).toBe(403);
    expect((await handleRfq(req(body(), { origin: 'http://localhost:3000' }), o)).status).toBe(200);
  });
});

describe('delivery adapter', () => {
  const payload = buildRfqPayload(valid({ name: 'Evil\r\nBcc: x@y.z' }), [], 'en', 'https://x');
  it('selects Resend only when fully configured', () => {
    expect(getDelivery({}).isConfigured()).toBe(false);
    expect(getDelivery({ RESEND_API_KEY: 'k', RFQ_TO_EMAIL: 'to@x.co' }).isConfigured()).toBe(false);
    expect(getDelivery({ RESEND_API_KEY: 'k', RFQ_TO_EMAIL: 'to@x.co', RFQ_FROM_EMAIL: 'f@x.co' }).isConfigured()).toBe(true);
  });
  it('flattens user text so it cannot inject lines into headers/body fields', () => {
    expect(formatRfqText(payload, 'RFQ-1').split('\n').find((l) => l.startsWith('Name:'))).toBe('Name: Evil Bcc: x@y.z');
  });
  it('posts to Resend with bearer auth and the key never leaves the server', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await new ResendDelivery('secret-key', 'to@x.co', 'from@x.co').send(payload, 'RFQ-9');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret-key');
    expect(JSON.parse(init.body as string).subject).toBe('New RFQ RFQ-9 — SA');
    vi.unstubAllGlobals();
  });
  it('maps provider errors to DeliveryError', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 422 })));
    await expect(new ResendDelivery('k', 't@x.co', 'f@x.co').send(payload, 'R')).rejects.toMatchObject({ status: 422 });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down'); }));
    await expect(new ResendDelivery('k', 't@x.co', 'f@x.co').send(payload, 'R')).rejects.toMatchObject({ status: 'network' });
    vi.unstubAllGlobals();
  });
});

describe('browser submit client — success only on a real 2xx', () => {
  const p = buildRfqPayload(valid(), [], 'en', 'https://x');
  const resp = (status: number, json?: unknown, headers?: Record<string, string>) => (async () => new Response(json === undefined ? 'oops' : JSON.stringify(json), { status, headers })) as unknown as typeof fetch;
  it('returns the reference on 200', async () => expect(await submitRfq(p, resp(200, { reference: 'RFQ-1' }))).toEqual({ reference: 'RFQ-1' }));
  it('succeeds without a reference', async () => expect(await submitRfq(p, resp(200, {}))).toEqual({ reference: null }));
  it('maps 503 not_configured', async () => {
    await expect(submitRfq(p, resp(503, { error: 'not_configured' }))).rejects.toMatchObject({ code: 'not_configured' });
  });
  it('maps 429 to rate_limited with the Retry-After seconds', async () => {
    await expect(submitRfq(p, resp(429, { error: 'rate_limited' }, { 'Retry-After': '540' }))).rejects.toMatchObject({ code: 'rate_limited', retryAfterSeconds: 540 });
    await expect(submitRfq(p, resp(429))).rejects.toMatchObject({ code: 'rate_limited', retryAfterSeconds: null });
  });
  it('maps any other 503 (limiter fail-closed) to unavailable', async () => {
    await expect(submitRfq(p, resp(503, { error: 'rfq_unavailable' }, { 'Retry-After': '120' }))).rejects.toMatchObject({ code: 'unavailable', retryAfterSeconds: 120 });
    await expect(submitRfq(p, resp(503))).rejects.toMatchObject({ code: 'unavailable' });
  });
  it('maps other failures to server, and transport errors to network', async () => {
    await expect(submitRfq(p, resp(500))).rejects.toBeInstanceOf(RfqSubmitError);
    await expect(submitRfq(p, resp(502, { error: 'delivery_failed' }))).rejects.toMatchObject({ code: 'server' });
    await expect(submitRfq(p, (async () => { throw new TypeError('fail'); }) as unknown as typeof fetch)).rejects.toMatchObject({ code: 'network' });
  });
});

describe('rate limiter', () => {
  it('resets after the window', () => {
    let now = 0;
    const l = createRateLimiter(1, 10, () => now);
    expect(l.check('a').ok).toBe(true);
    expect(l.check('a').ok).toBe(false);
    expect(l.check('b').ok).toBe(true);
    now = 11_000;
    expect(l.check('a').ok).toBe(true);
  });
});
