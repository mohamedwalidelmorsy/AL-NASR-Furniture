import { describe, expect, it } from 'vitest';
import { positiveInt, step, type WindowState } from '../cloudflare/shared/rate-window.ts';
import { createRateLimiter } from '@/lib/rate-limit';

const WIN = 600_000;

describe('staging RFQ rate window (Durable Object step)', () => {
  it('allows max hits per window, then refuses with Retry-After', () => {
    let s: WindowState | undefined;
    const out: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      const r = step(s, 1_000 + i, 5, WIN);
      s = r.state;
      out.push(r.ok);
    }
    expect(out).toEqual([true, true, true, true, true, false, false]);
    const r = step(s, 1_000 + 60_000, 5, WIN);
    expect(r.ok).toBe(false);
    expect(r.retryAfterSeconds).toBe(540);
  });

  it('opens a fresh window once the previous one ends', () => {
    const first = step(undefined, 0, 1, WIN);
    expect(first).toMatchObject({ ok: true, opened: true, state: { count: 1, resetAt: WIN } });
    expect(step(first.state, WIN - 1, 1, WIN).ok).toBe(false);
    expect(step(first.state, WIN, 1, WIN)).toMatchObject({ ok: true, opened: true, state: { count: 1, resetAt: 2 * WIN } });
  });

  it('never reports a zero Retry-After when refusing', () => {
    expect(step({ count: 5, resetAt: 1_000 }, 999, 5, WIN).retryAfterSeconds).toBe(1);
  });

  it('matches the app limiter decision for the same hit sequence', () => {
    let t = 0;
    const app = createRateLimiter(3, 10, () => t);
    let s: WindowState | undefined;
    for (const at of [0, 1_000, 2_000, 3_000, 9_999, 10_000, 10_500, 11_000, 12_000]) {
      t = at;
      const r = step(s, at, 3, 10_000);
      s = r.state;
      expect(r.ok, `hit at ${at}`).toBe(app.check('k').ok);
    }
  });

  it('parses limits as positive integers, else the default', () => {
    expect(positiveInt('5', 9)).toBe(5);
    expect(positiveInt(undefined, 9)).toBe(9);
    expect(positiveInt('0', 9)).toBe(9);
    expect(positiveInt('abc', 9)).toBe(9);
    expect(positiveInt('2.5', 9)).toBe(9);
  });
});
