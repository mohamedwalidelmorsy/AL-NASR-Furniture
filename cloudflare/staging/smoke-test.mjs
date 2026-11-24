#!/usr/bin/env node
/**
 * Staging smoke test for the Cloudflare Workers deployment. Read-only except for RFQ checks, which
 * never send e-mail unless RFQ_SEND_REAL=1 (then exactly ONE valid RFQ is submitted).
 *
 * Usage:
 *   BASE_URL=https://al-nasr-furniture-staging.<sub>.workers.dev STAGING_AUTH='user:pass' \
 *     node cloudflare/staging/smoke-test.mjs [--json out.json]
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.env.BASE_URL ?? '').replace(/\/$/, '');
const AUTH = process.env.STAGING_AUTH ?? '';
if (!BASE || !AUTH) { console.error('BASE_URL and STAGING_AUTH are required'); process.exit(2); }
const authH = { Authorization: `Basic ${Buffer.from(AUTH).toString('base64')}` };
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;

const results = [];
const record = (group, name, ok, detail = '') => { results.push({ group, name, ok, detail }); if (!ok) console.log(`FAIL [${group}] ${name} ${detail}`); };
const get = (p, opts = {}) => fetch(BASE + p, { redirect: 'manual', ...opts, headers: { ...authH, ...(opts.headers ?? {}) } });

const root = path.resolve(import.meta.dirname, '../..');
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const products = [...readJson('src/data/catalog/products.json'), ...readJson('src/data/catalog/products.expansion.json')];
const categories = readJson('src/data/catalog/categories.json');
const catSlug = (id) => categories.find((c) => c.id === id)?.slug ?? id;

// 1. Access control
{
  const r = await fetch(BASE + '/en', { redirect: 'manual' });
  record('access', 'no credentials → 401', r.status === 401, `got ${r.status}`);
  const r2 = await fetch(BASE + '/en', { redirect: 'manual', headers: { Authorization: 'Basic ' + Buffer.from('x:wrong').toString('base64') } });
  record('access', 'wrong credentials → 401', r2.status === 401, `got ${r2.status}`);
}

// 2. Locale routing
{
  const r = await get('/');
  record('routing', '/ → redirect to /en', [307, 308].includes(r.status) && /\/en$/.test(r.headers.get('location') ?? ''), `${r.status} ${r.headers.get('location')}`);
  const ar = await get('/', { headers: { 'Accept-Language': 'ar-EG,ar;q=0.9' } });
  record('routing', '/ with Accept-Language ar → /ar', /\/ar$/.test(ar.headers.get('location') ?? ''), `${ar.status} ${ar.headers.get('location')}`);
  for (const l of ['en', 'ar']) {
    const h = await (await get(`/${l}`)).text();
    record('routing', `/${l} html lang/dir`, h.includes(`lang="${l}"`) && h.includes(`dir="${l === 'ar' ? 'rtl' : 'ltr'}"`));
  }
}

// 2b. Returning visitor: browsers send back the locale cookie set on the first visit, so every request after
// the first carries a Cookie header (@opennextjs/cloudflare 1.20.18 answered 500 to all of them, #1506).
{
  const first = await get('/ar');
  const setCookie = (first.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
  record('cookies', 'first visit sets a cookie', setCookie.length > 0, setCookie.replace(/=.*/, '=…'));
  const jar = { Cookie: `${setCookie || 'NEXT_LOCALE=ar'}; a=b` };
  for (const p of ['/en', '/ar/collections', '/en/inquiry']) {
    const r = await get(p, { headers: jar });
    record('cookies', `GET ${p} with cookies → 200`, r.status === 200, `got ${r.status}`);
  }
  // Next 16 answers an RSC request without a valid `_rsc` param with a 307 that adds it; browsers follow it.
  const rscH = { ...jar, RSC: '1', 'Next-Router-Prefetch': '1' };
  let rsc = await get('/en/collections', { headers: rscH });
  if (rsc.status === 307 && rsc.headers.get('location')) rsc = await get(new URL(rsc.headers.get('location'), BASE + '/').pathname + new URL(rsc.headers.get('location'), BASE + '/').search, { headers: rscH });
  record('cookies', 'RSC prefetch with cookies → 200 text/x-component', rsc.status === 200 && (rsc.headers.get('content-type') ?? '').includes('text/x-component'), `${rsc.status} ${rsc.headers.get('content-type')}`);
  const fav = await get('/favicon.ico', { headers: jar });
  record('cookies', '/favicon.ico with cookies → not 5xx', fav.status < 500, `got ${fav.status}`);
  const rfq = await fetch(BASE + '/api/rfq', { method: 'POST', redirect: 'manual', headers: { ...authH, ...jar, 'Content-Type': 'application/json', Origin: BASE }, body: '{}' });
  record('cookies', 'RFQ POST with cookies → 422/429 (reaches the app, not 500)', [422, 429].includes(rfq.status), `got ${rfq.status}`);
}

// 3. Every URL in the sitemap (all pre-rendered locale pages)
const sm = await (await get('/sitemap.xml')).text();
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
record('pages', 'sitemap.xml lists pages', urls.length > 0, `${urls.length} urls`);
let pageFail = 0; const imgSet = new Set(); const times = [];
for (const p of urls) {
  const t0 = performance.now();
  const r = await get(p);
  times.push(performance.now() - t0);
  const html = r.status === 200 ? await r.text() : '';
  if (r.status !== 200 || !html.includes('noindex')) { pageFail++; record('pages', p, false, `status ${r.status}${html && !html.includes('noindex') ? ' (no noindex)' : ''}`); }
  for (const m of html.matchAll(/\/_next\/image\?url=[^"\s,]+/g)) imgSet.add(m[0].replace(/&amp;/g, '&'));
}
record('pages', `all sitemap pages 200 + noindex (${urls.length})`, pageFail === 0, `${pageFail} failed`);
// Archived product pages are generated but not in the sitemap
const archived = products.filter((p) => p.status === 'archived');
for (const p of archived) for (const l of ['en', 'ar']) {
  const r = await get(`/${l}/collections/${catSlug(p.categoryId)}/${p.slug}`);
  record('pages', `archived ${l}/${p.slug} → 200`, r.status === 200, `got ${r.status}`);
}
for (const p of ['/en/inquiry', '/ar/inquiry']) { const r = await get(p); record('pages', `${p} (not in sitemap) → 200`, r.status === 200, `got ${r.status}`); }
for (const p of ['/robots.txt', '/sitemap.xml']) { const r = await get(p); record('pages', `${p} 200`, r.status === 200, `got ${r.status}`); }
{
  const robots = await (await get('/robots.txt')).text();
  record('indexing', 'robots.txt disallows all', /Disallow:\s*\/\s*$/m.test(robots), robots.replace(/\n/g, ' | '));
  const r = await get('/en');
  record('indexing', 'X-Robots-Tag noindex on pages', (r.headers.get('x-robots-tag') ?? '').includes('noindex'));
}

// 4. Redirects and 404
for (const p of products) {
  const from = [];
  if (p.status === 'merged' && p.mergedInto) from.push([p.categoryId, p.slug]);
  for (const r of p.previousRoutes ?? []) from.push([r.categoryId, r.slug]);
  for (const [c, s] of from) {
    const r = await get(`/ar/collections/${catSlug(c)}/${s}`);
    record('redirects', `ar/${c}/${s} → 308`, r.status === 308 && (r.headers.get('location') ?? '').startsWith('/ar/collections/'), `${r.status} ${r.headers.get('location')}`);
  }
}
for (const p of ['/en/does-not-exist', '/ar/collections/bedrooms/not-a-product']) {
  const r = await get(p); const h = await r.text();
  record('404', `${p} → 404 page`, r.status === 404 && h.length > 500, `got ${r.status}`);
}

// 5. Security headers
{
  const want = ['x-content-type-options', 'referrer-policy', 'x-frame-options', 'permissions-policy'];
  for (const p of ['/en', '/images/hero/warm-neutral-living-room-1672.webp']) {
    const r = await get(p);
    const miss = want.filter((h) => !r.headers.get(h));
    record('headers', `security headers on ${p}`, miss.length === 0, miss.join(','));
  }
  const css = (await (await get('/en')).text()).match(/\/_next\/static\/[^"]+\.css/)?.[0];
  if (css) { const r = await get(css); record('headers', '/_next/static immutable cache', (r.headers.get('cache-control') ?? '').includes('immutable'), r.headers.get('cache-control') ?? ''); }
}

// 6. Image optimisation (sample of distinct transforms)
{
  const sample = [...imgSet].slice(0, 12);
  let avif = 0, webp = 0, fail = 0;
  for (const u of sample) {
    const a = await get(u, { headers: { Accept: 'image/avif,image/webp,*/*' } });
    if (a.status === 200 && (a.headers.get('content-type') ?? '').includes('avif')) avif++; else fail++;
    await a.arrayBuffer();
  }
  const w = await get(sample[0], { headers: { Accept: 'image/webp,*/*' } });
  if (w.status === 200 && (w.headers.get('content-type') ?? '').includes('webp')) webp++;
  record('images', `AVIF served for ${sample.length} sampled transforms`, fail === 0, `avif=${avif} fail=${fail}`);
  record('images', 'WebP fallback when AVIF not accepted', webp === 1);
  record('images', 'distinct transform URLs seen in HTML', true, String(imgSet.size));
  const bad = await get('/_next/image?url=%2Fimages%2Fhero%2Fwarm-neutral-living-room-1672.webp&w=999&q=75');
  record('images', 'non-configured width rejected (quota protection)', bad.status === 400, `got ${bad.status}`);
}

// 7. RFQ API (no e-mail is sent by these checks)
{
  const post = (body, extra = {}) => fetch(BASE + '/api/rfq', { method: 'POST', redirect: 'manual', headers: { ...authH, 'Content-Type': 'application/json', Origin: BASE, ...extra }, body });
  const v = await post('{}');
  record('rfq', 'invalid payload → 422 (429 if the limiter is still counting a previous run)', [422, 429].includes(v.status), `got ${v.status}`);
  const x = await post('{}', { Origin: 'https://evil.example' });
  record('rfq', 'cross-origin → 403', x.status === 403, `got ${x.status}`);
  const ct = await fetch(BASE + '/api/rfq', { method: 'POST', headers: { ...authH, 'Content-Type': 'text/plain', Origin: BASE }, body: 'x' });
  record('rfq', 'wrong content-type → 415', ct.status === 415, `got ${ct.status}`);
  // Spoofed X-Forwarded-For must NOT reset the limiter (each request claims a new IP), and the limit must be
  // global: once refused, every later request in the window is refused too (a per-isolate counter flips
  // between 422 and 429). The 403/415 probes above are not counted, like in the app.
  const MAX = Number(process.env.RFQ_RATE_LIMIT_MAX) || 5;
  const codes = []; let retryAfterOk = true;
  for (let i = 0; i < 8; i++) {
    const r = await post('{}', { 'X-Forwarded-For': `198.51.100.${i + 1}` });
    codes.push(r.status);
    if (r.status === 429 && !(Number(r.headers.get('retry-after')) > 0)) retryAfterOk = false;
  }
  const first = codes.indexOf(429);
  record('rfq', `spoofed X-Forwarded-For cannot bypass rate limit (429 by request ${MAX + 1} of 8)`, first !== -1 && first <= MAX, codes.join(','));
  record('rfq', 'rate limit is global (every request after the first 429 is 429)', first !== -1 && codes.slice(first).every((c) => c === 429), codes.join(','));
  record('rfq', '429 carries a positive Retry-After', first !== -1 && retryAfterOk);
}

const pct = (a, q) => a.sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(q * a.length))];
const summary = { base: BASE, when: new Date().toISOString(), pages: urls.length, pass: results.filter((r) => r.ok).length, fail: results.filter((r) => !r.ok).length, ttfbMs: { p50: Math.round(pct(times, 0.5)), p95: Math.round(pct(times, 0.95)), max: Math.round(Math.max(...times)) } };
console.log(JSON.stringify(summary));
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ summary, results }, null, 2));
process.exit(summary.fail ? 1 : 0);
