import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (f: string) => fs.readFileSync(path.join(root, f), 'utf8');

/** JSONC → JSON: drops // and /* *\/ comments outside strings (wrangler configs have no trailing commas). */
function parseJsonc(src: string): Record<string, any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  let out = ''; let inStr = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inStr) { out += c; if (c === '\\') { out += src[++i]; } else if (c === '"') inStr = false; continue; }
    if (c === '"') { inStr = true; out += c; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; out += '\n'; continue; }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 1; continue; }
    out += c;
  }
  return JSON.parse(out);
}
const envFile = (f: string) => Object.fromEntries(read(f).split('\n').filter((l) => /^[A-Z_]+=/.test(l)).map((l) => { const [k, ...v] = l.split('='); return [k, v.join('=').replace(/^"|"$/g, '')]; }));

const staging = parseJsonc(read('wrangler.jsonc'));
const production = parseJsonc(read('wrangler.production.jsonc'));

describe('Cloudflare staging and production stay isolated', () => {
  it('are two different Workers, each pointing OpenNext at itself', () => {
    expect(staging.name).toBe('al-nasr-furniture-staging');
    expect(production.name).toBe('al-nasr-furniture');
    for (const c of [staging, production]) {
      expect(c.services).toEqual([{ binding: 'WORKER_SELF_REFERENCE', service: c.name }]);
    }
  });

  it('use their own entry points', () => {
    expect(staging.main).toBe('cloudflare/staging/worker.mjs');
    expect(production.main).toBe('cloudflare/production/worker.mjs');
    expect(read('cloudflare/staging/worker.mjs')).toContain('STAGING_BASIC_AUTH');
    expect(read('cloudflare/production/worker.mjs')).not.toContain('STAGING_BASIC_AUTH');
  });

  it('staging never binds a custom domain; production only the company domain', () => {
    expect(staging.routes).toBeUndefined();
    expect(staging.route).toBeUndefined();
    for (const r of production.routes ?? []) expect(String(r.pattern ?? r)).toMatch(/^(www\.)?alnasrfurniture\.com/);
  });

  it('both keep the fail-closed RFQ limiter binding and its SQLite migration', () => {
    for (const c of [staging, production]) {
      expect(c.durable_objects.bindings).toEqual([{ name: 'RFQ_LIMITER', class_name: 'RfqRateLimiter' }]);
      expect(c.migrations).toEqual([{ tag: 'v1-rfq-limiter', new_sqlite_classes: ['RfqRateLimiter'] }]);
    }
  });

  it('commit no secrets as plain vars', () => {
    for (const c of [staging, production]) {
      for (const k of Object.keys(c.vars ?? {})) expect(k).not.toMatch(/KEY|SECRET|TOKEN|PASSWORD|AUTH|EMAIL/);
    }
  });

  it('staging stays locked and noindex; production is noindex until launch', () => {
    const s = envFile('cloudflare/staging/build.env');
    expect(s.NEXT_PUBLIC_SITE_URL).toMatch(/^https:\/\/al-nasr-furniture-staging\.[a-z0-9-]+\.workers\.dev$/);
    expect(s.NEXT_PUBLIC_ALLOW_INDEXING).toBe('false');
    expect(read('cloudflare/staging/_headers')).toMatch(/X-Robots-Tag: noindex/);
    expect(read('cloudflare/production/_headers').split('\n').filter((l) => !l.startsWith('#')).join('\n')).not.toMatch(/X-Robots-Tag/);
    const p = envFile('cloudflare/production/build.env');
    expect(p.NEXT_PUBLIC_SITE_URL).toMatch(/^https:\/\/(www\.)?alnasrfurniture\.com$/);
    expect(p.NEXT_PUBLIC_ALLOW_INDEXING).toBe('false');
    expect(production.vars.ALLOW_INDEXING).toBe('false');
  });
});
