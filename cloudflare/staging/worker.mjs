/**
 * Staging-only Worker entry (Cloudflare Workers + OpenNext). Deployed by `wrangler.jsonc` as
 * `al-nasr-furniture-staging`; production has its own entry (cloudflare/production/worker.mjs).
 *
 * Wraps the unmodified OpenNext bundle (`.open-next/worker.js`) and adds four staging guards:
 *  1. HTTP Basic Auth on every request the Worker handles (pages, RSC, /_next/image, /api/rfq).
 *     Fails closed: if the STAGING_BASIC_AUTH secret ("user:password") is missing, nothing is served.
 *     Static files under /_next/static, /images, /assets are served by Workers Static Assets before
 *     the Worker runs, so they are public-but-unlisted (they contain no private data).
 *  2. Client-IP normalisation: X-Forwarded-For / X-Real-IP are overwritten with Cloudflare's
 *     CF-Connecting-IP so the app's per-IP RFQ rate limiter cannot be bypassed by a spoofed header.
 *  3. `X-Robots-Tag: noindex, nofollow, noarchive` on every Worker response (in addition to the
 *     app's own robots.txt disallow + noindex while NEXT_PUBLIC_ALLOW_INDEXING=false).
 *  4. Global per-IP RFQ rate limit in a Durable Object, fail-closed when it is unavailable
 *     (cloudflare/shared/rfq-guard.ts).
 *
 * No application source file is modified by this wrapper.
 */
import openNext from '../../.open-next/worker.js';
import { normalizeClientIp, rfqGuard } from '../shared/rfq-guard.ts';

export { RfqRateLimiter } from '../shared/rfq-limiter-do.mjs';

const encoder = new TextEncoder();
const NOINDEX = { 'X-Robots-Tag': 'noindex, nofollow, noarchive' };

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
      ...NOINDEX,
    },
  });
}

const stagingWorker = {
  async fetch(request, env, ctx) {
    const expected = env.STAGING_BASIC_AUTH;
    if (!expected) {
      return new Response('Staging is locked: STAGING_BASIC_AUTH secret is not configured.', {
        status: 503,
        headers: { 'Cache-Control': 'no-store', ...NOINDEX },
      });
    }
    const given = request.headers.get('authorization') ?? '';
    const want = `Basic ${btoa(expected)}`;
    if (!(await sameSecret(given, want))) return unauthorized();

    const headers = new Headers(request.headers);
    headers.delete('authorization');
    const ip = request.headers.get('cf-connecting-ip');
    normalizeClientIp(headers, ip);

    const guarded = await rfqGuard(request, env, ip, undefined, NOINDEX);
    if (guarded) return guarded;

    const res = await openNext.fetch(new Request(request, { headers }), env, ctx);
    const out = new Response(res.body, res);
    out.headers.set('X-Robots-Tag', NOINDEX['X-Robots-Tag']);
    return out;
  },
};

export default stagingWorker;
