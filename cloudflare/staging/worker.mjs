/**
 * Staging-only Worker entry (Cloudflare Workers + OpenNext).
 *
 * Wraps the unmodified OpenNext bundle (`.open-next/worker.js`) and adds three staging guards:
 *  1. HTTP Basic Auth on every request the Worker handles (pages, RSC, /_next/image, /api/rfq).
 *     Fails closed: if the STAGING_BASIC_AUTH secret ("user:password") is missing, nothing is served.
 *     Static files under /_next/static, /images, /assets are served by Workers Static Assets before
 *     the Worker runs, so they are public-but-unlisted (they contain no private data).
 *  2. Client-IP normalisation: X-Forwarded-For / X-Real-IP are overwritten with Cloudflare's
 *     CF-Connecting-IP so the app's per-IP RFQ rate limiter cannot be bypassed by a spoofed header.
 *  3. `X-Robots-Tag: noindex, nofollow, noarchive` on every Worker response (in addition to the
 *     app's own robots.txt disallow + noindex while NEXT_PUBLIC_ALLOW_INDEXING=false).
 *  4. Global per-IP RFQ rate limit. The app's limiter (src/lib/rate-limit.ts) is an in-memory Map, so on
 *     Workers each isolate counts separately and no global limit holds. Here one SQLite-backed Durable
 *     Object per client IP (`idFromName`) keeps the count, with the app's semantics and the same
 *     RFQ_RATE_LIMIT_MAX / RFQ_RATE_LIMIT_WINDOW_SECONDS vars. Only requests the app itself would count
 *     (same-origin, JSON) are counted. Fails open, logging no IP, if the Durable Object is unreachable:
 *     the app's in-memory limiter, origin and content-type checks still apply.
 *
 * No application source file is modified by this wrapper.
 */
import { DurableObject } from 'cloudflare:workers';
import openNext from '../../.open-next/worker.js';
import { positiveInt, step } from './rate-window.ts';

const encoder = new TextEncoder();

/** One instance per client key; storage holds that key's current window. */
export class RfqRateLimiter extends DurableObject {
  async hit(max, windowSeconds) {
    const now = Date.now();
    const r = step(await this.ctx.storage.get('w'), now, max, windowSeconds * 1000);
    await this.ctx.storage.put('w', r.state);
    // Drop the row when the window ends so idle IPs leave no stored data behind.
    if (r.opened) await this.ctx.storage.setAlarm(r.state.resetAt);
    return { ok: r.ok, retryAfterSeconds: r.retryAfterSeconds };
  }

  async alarm() {
    const cur = await this.ctx.storage.get('w');
    if (cur && cur.resetAt > Date.now()) await this.ctx.storage.setAlarm(cur.resetAt);
    else await this.ctx.storage.deleteAll();
  }
}

/** Mirrors the app's early rejections (403 cross-origin, 415 non-JSON), which it never counts. */
function countedByApp(request) {
  const origin = request.headers.get('origin');
  if (origin) {
    try { if (new URL(origin).host !== new URL(request.url).host) return false; } catch { return false; }
  }
  return (request.headers.get('content-type') ?? '').toLowerCase().includes('application/json');
}

/** Returns a 429 Response when the global limit is exceeded, else null. */
async function rfqRateLimit(request, env, ip) {
  if (request.method !== 'POST' || new URL(request.url).pathname !== '/api/rfq' || !countedByApp(request)) return null;
  try {
    const stub = env.RFQ_LIMITER.get(env.RFQ_LIMITER.idFromName(ip ?? 'unknown'));
    const { ok, retryAfterSeconds } = await stub.hit(
      positiveInt(env.RFQ_RATE_LIMIT_MAX, 5),
      positiveInt(env.RFQ_RATE_LIMIT_WINDOW_SECONDS, 600),
    );
    if (ok) return null;
    return Response.json({ error: 'rate_limited' }, {
      status: 429,
      headers: { 'Cache-Control': 'no-store', 'Retry-After': String(retryAfterSeconds), 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
    });
  } catch (e) {
    console.error(JSON.stringify({ evt: 'rfq_limiter_unavailable', error: String(e?.name ?? 'Error') }));
    return null;
  }
}

async function sameSecret(a, b) {
  // Constant-time comparison of two strings (hash first so lengths match).
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

function unauthorized(body = 'Authentication required') {
  return new Response(body, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="AL NASR staging", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}

const stagingWorker = {
  async fetch(request, env, ctx) {
    const expected = env.STAGING_BASIC_AUTH;
    if (!expected) {
      return new Response('Staging is locked: STAGING_BASIC_AUTH secret is not configured.', {
        status: 503,
        headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
      });
    }
    const given = request.headers.get('authorization') ?? '';
    const want = `Basic ${btoa(expected)}`;
    if (!(await sameSecret(given, want))) return unauthorized();

    const headers = new Headers(request.headers);
    headers.delete('authorization');
    const ip = request.headers.get('cf-connecting-ip');
    if (ip) {
      headers.set('x-forwarded-for', ip);
      headers.set('x-real-ip', ip);
    }

    const limited = await rfqRateLimit(request, env, ip);
    if (limited) return limited;

    const res = await openNext.fetch(new Request(request, { headers }), env, ctx);
    const out = new Response(res.body, res);
    out.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return out;
  },
};

export default stagingWorker;
