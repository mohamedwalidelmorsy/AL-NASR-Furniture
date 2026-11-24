/**
 * Edge guard for POST /api/rfq, shared by the staging and production Worker entries.
 *
 * - Global per-IP rate limit kept in one SQLite-backed Durable Object per client IP (see rfq-limiter-do.mjs).
 *   Only requests the app itself counts are counted (same-origin, JSON); the app's in-memory limiter still runs.
 * - FAIL-CLOSED (owner decision, 2026-11-25): if the limiter binding is missing or the Durable Object call fails,
 *   the request is refused with 503 `rfq_unavailable` + Retry-After. The form shows a localized message with
 *   WhatsApp / e-mail alternatives and keeps the buyer's details in the browser.
 *
 * Logs are one JSON line per event with the Cloudflare Ray ID for correlation. They never contain the client IP,
 * names, e-mail addresses, phone numbers or message text.
 */
import { positiveInt } from './rate-window.ts';

export interface LimiterStub { hit(max: number, windowSeconds: number): Promise<{ ok: boolean; retryAfterSeconds: number }> }
export interface LimiterNamespace { idFromName(name: string): unknown; get(id: unknown): LimiterStub }
export interface RfqGuardEnv { RFQ_LIMITER?: LimiterNamespace; RFQ_RATE_LIMIT_MAX?: string; RFQ_RATE_LIMIT_WINDOW_SECONDS?: string }
export type EdgeLog = (level: 'info' | 'warn' | 'error', evt: string, data: Record<string, unknown>) => void;

/** Seconds a client is asked to wait when the limiter is unavailable. */
export const UNAVAILABLE_RETRY_AFTER_SECONDS = 120;

export const edgeLog: EdgeLog = (level, evt, data) => {
  const line = JSON.stringify({ evt, ...data });
  if (level === 'error') console.error(line); else if (level === 'warn') console.warn(line); else console.info(line);
};

/** Mirrors the app's early rejections (403 cross-origin, 415 non-JSON), which it never counts. */
export function countedByApp(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (origin) {
    try { if (new URL(origin).host !== new URL(request.url).host) return false; } catch { return false; }
  }
  return (request.headers.get('content-type') ?? '').toLowerCase().includes('application/json');
}

export function isRfqPost(request: Request): boolean {
  return request.method === 'POST' && new URL(request.url).pathname === '/api/rfq';
}

const jsonError = (status: number, error: string, retryAfterSeconds: number, extraHeaders: Record<string, string>) =>
  Response.json({ error }, {
    status,
    headers: { 'Cache-Control': 'no-store', 'Retry-After': String(retryAfterSeconds), ...extraHeaders },
  });

/**
 * Returns a 429 (limit reached) or 503 (limiter unavailable, fail-closed) Response for a counted RFQ POST,
 * or null when the request may continue to the app.
 */
export async function rfqGuard(
  request: Request,
  env: RfqGuardEnv,
  ip: string | null,
  log: EdgeLog = edgeLog,
  extraHeaders: Record<string, string> = {},
): Promise<Response | null> {
  if (!isRfqPost(request) || !countedByApp(request)) return null;
  const ray = request.headers.get('cf-ray') ?? undefined;
  try {
    if (!env.RFQ_LIMITER) throw new Error('RFQ_LIMITER binding missing');
    const stub = env.RFQ_LIMITER.get(env.RFQ_LIMITER.idFromName(ip ?? 'unknown'));
    const { ok, retryAfterSeconds } = await stub.hit(
      positiveInt(env.RFQ_RATE_LIMIT_MAX, 5),
      positiveInt(env.RFQ_RATE_LIMIT_WINDOW_SECONDS, 600),
    );
    if (ok) return null;
    log('warn', 'rfq.rate_limited', { ray, retryAfterSeconds });
    return jsonError(429, 'rate_limited', retryAfterSeconds, extraHeaders);
  } catch (e) {
    log('error', 'rfq.limiter_unavailable', { ray, error: e instanceof Error ? e.name : 'Error', policy: 'fail_closed' });
    return jsonError(503, 'rfq_unavailable', UNAVAILABLE_RETRY_AFTER_SECONDS, extraHeaders);
  }
}

/** Overwrites client-IP headers with Cloudflare's CF-Connecting-IP so they cannot be spoofed. */
export function normalizeClientIp(headers: Headers, ip: string | null): void {
  if (!ip) return;
  headers.set('x-forwarded-for', ip);
  headers.set('x-real-ip', ip);
}
