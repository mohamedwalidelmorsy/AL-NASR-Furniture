/**
 * Production Worker entry (Cloudflare Workers + OpenNext). Deployed only by `wrangler.production.jsonc`
 * as `al-nasr-furniture`, never by the default `wrangler.jsonc` (staging).
 *
 * Differences from staging (cloudflare/staging/worker.mjs):
 *  - No Basic Auth: the site is public.
 *  - `X-Robots-Tag: noindex` is added on every Worker response UNTIL the runtime var ALLOW_INDEXING is "true".
 *    This is a second gate next to the build-time NEXT_PUBLIC_ALLOW_INDEXING (robots.txt + meta robots):
 *    indexing opens only when both are switched on at launch.
 * Shared with staging: client-IP normalisation (CF-Connecting-IP) and the global per-IP RFQ rate limit in a
 * Durable Object, fail-closed when it is unavailable (cloudflare/shared/rfq-guard.ts).
 *
 * No application source file is modified by this wrapper.
 */
import openNext from '../../.open-next/worker.js';
import { normalizeClientIp, rfqGuard } from '../shared/rfq-guard.ts';

export { RfqRateLimiter } from '../shared/rfq-limiter-do.mjs';

const NOINDEX = 'noindex, nofollow, noarchive';

const productionWorker = {
  async fetch(request, env, ctx) {
    const indexable = env.ALLOW_INDEXING === 'true';
    const extra = indexable ? {} : { 'X-Robots-Tag': NOINDEX };

    const headers = new Headers(request.headers);
    const ip = request.headers.get('cf-connecting-ip');
    normalizeClientIp(headers, ip);

    const guarded = await rfqGuard(request, env, ip, undefined, extra);
    if (guarded) return guarded;

    const res = await openNext.fetch(new Request(request, { headers }), env, ctx);
    if (indexable) return res;
    const out = new Response(res.body, res);
    out.headers.set('X-Robots-Tag', NOINDEX);
    return out;
  },
};

export default productionWorker;
