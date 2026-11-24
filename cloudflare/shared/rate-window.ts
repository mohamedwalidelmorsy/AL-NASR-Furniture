/**
 * Fixed-window rate-limit step (pure). Same semantics as the app's in-memory limiter
 * (src/lib/rate-limit.ts): the first hit opens a window; hit number `max + 1` and later are refused
 * until the window ends. Used by the staging Worker's RfqRateLimiter Durable Object, whose storage
 * holds `WindowState` for one client key, so the count is global rather than per isolate.
 */
export interface WindowState { count: number; resetAt: number }
export interface StepResult { state: WindowState; ok: boolean; retryAfterSeconds: number; opened: boolean }

export function step(prev: WindowState | undefined, now: number, max: number, windowMs: number): StepResult {
  if (!prev || prev.resetAt <= now) {
    return { state: { count: 1, resetAt: now + windowMs }, ok: max >= 1, retryAfterSeconds: max >= 1 ? 0 : Math.ceil(windowMs / 1000), opened: true };
  }
  const state = { count: prev.count + 1, resetAt: prev.resetAt };
  const ok = state.count <= max;
  return { state, ok, retryAfterSeconds: ok ? 0 : Math.max(1, Math.ceil((prev.resetAt - now) / 1000)), opened: false };
}

/** Positive integer from a string var, else the fallback (mirrors the app's `Number(x) || default`). */
export function positiveInt(raw: unknown, fallback: number): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}
