/**
 * Fixed-window in-memory limiter. Good enough for a single Node instance; on serverless / multi-instance
 * hosting replace `createRateLimiter` with a shared store (Upstash/Redis) behind the same interface.
 */
export interface RateResult { ok: boolean; retryAfterSeconds: number }

export function createRateLimiter(max: number, windowSeconds: number, now: () => number = Date.now) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return {
    check(key: string): RateResult {
      const t = now();
      if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
      const cur = hits.get(key);
      if (!cur || cur.resetAt <= t) {
        hits.set(key, { count: 1, resetAt: t + windowSeconds * 1000 });
        return { ok: true, retryAfterSeconds: 0 };
      }
      cur.count += 1;
      return cur.count > max ? { ok: false, retryAfterSeconds: Math.ceil((cur.resetAt - t) / 1000) } : { ok: true, retryAfterSeconds: 0 };
    },
  };
}
