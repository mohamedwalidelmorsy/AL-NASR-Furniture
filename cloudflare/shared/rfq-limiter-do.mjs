/**
 * RfqRateLimiter Durable Object (SQLite-backed, Workers Free). One instance per client key; its storage holds
 * that key's current fixed window. Exported again by each Worker entry (staging and production), so each Worker
 * gets its own Durable Object namespace: staging and production counts never mix.
 */
import { DurableObject } from 'cloudflare:workers';
import { step } from './rate-window.ts';

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
