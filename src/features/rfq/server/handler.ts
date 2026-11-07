import 'server-only';
import { randomBytes } from 'node:crypto';
import { rfqPayloadSchema } from '../schema';
import { DeliveryError, getDelivery, type RfqDelivery } from './delivery';
import { createRateLimiter } from '@/lib/rate-limit';
import { allProducts } from '@/lib/catalog';

const MAX_BODY_BYTES = 64 * 1024;

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

export const newReference = (now = new Date()) =>
  `RFQ-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${randomBytes(3).toString('hex').toUpperCase()}`;

export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'unknown').trim();
}

export interface RfqHandlerDeps {
  delivery?: RfqDelivery;
  limiter?: ReturnType<typeof createRateLimiter>;
  log?: (evt: string, data: Record<string, unknown>) => void;
}

const defaultLimiter = createRateLimiter(
  Number(process.env.RFQ_RATE_LIMIT_MAX) || 5,
  Number(process.env.RFQ_RATE_LIMIT_WINDOW_SECONDS) || 600,
);
// Structured logs carry only IDs / status codes — never names, e-mails, phones or message text.
const defaultLog = (evt: string, data: Record<string, unknown>) => console.error(JSON.stringify({ evt, ...data }));

export async function handleRfq(req: Request, deps: RfqHandlerDeps = {}): Promise<Response> {
  const delivery = deps.delivery ?? getDelivery();
  const limiter = deps.limiter ?? defaultLimiter;
  const log = deps.log ?? defaultLog;

  // Same-origin only (browsers always send Origin on cross-site POSTs).
  const origin = req.headers.get('origin');
  if (origin) {
    let ok = false;
    try { ok = new URL(origin).host === (req.headers.get('host') ?? new URL(req.url).host); } catch { /* malformed */ }
    if (!ok) return json(403, { error: 'forbidden' });
  }
  if (!(req.headers.get('content-type') ?? '').toLowerCase().includes('application/json')) return json(415, { error: 'unsupported_media_type' });

  const rate = limiter.check(clientKey(req));
  if (!rate.ok) return json(429, { error: 'rate_limited' }, { 'Retry-After': String(rate.retryAfterSeconds) });

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return json(413, { error: 'too_large' });
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return json(400, { error: 'invalid_json' }); }

  const parsed = rfqPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return json(422, { error: 'validation', issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), code: i.message })) });
  }
  const rfq = parsed.data;
  if (rfq.website) return json(400, { error: 'rejected' }); // honeypot

  // Items must reference real catalog entries.
  const products = allProducts();
  if (rfq.items.some((i) => !products.some((p) => p.id === i.collection_id && p.code === i.code))) {
    return json(422, { error: 'validation', issues: [{ path: 'items', code: 'unknown_item' }] });
  }

  if (!delivery.isConfigured()) return json(503, { error: 'not_configured' });

  const reference = newReference();
  try {
    await delivery.send(rfq, reference);
  } catch (e) {
    log('rfq.delivery_failed', { reference, status: e instanceof DeliveryError ? e.status : 'unknown' });
    return json(502, { error: 'delivery_failed' });
  }
  return json(200, { reference });
}
