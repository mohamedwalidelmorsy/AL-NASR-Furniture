# 01 — Technical Requirements (measured from the real repository)

**Research date:** 2026-11-24
**Source inspected:** `github.com/mohamedwalidelmorsy/AL-NASR-Furniture`, branch `main`, commit `f4352c9` ("Catalog expansion, final catalog fixes and full-site audit").
This research was done on a fresh clone in a cloud workspace. The owner's MacBook copy (`~/Desktop/al-nasr-furniture`) could not be reached, so this assumes GitHub `main` matches it.

Legend: **[MEASURED]** = I ran it · **[CODE]** = read from source · **[DOC]** = stated in the repo's own docs · **[ASSUMPTION]** = stated planning assumption.

---

## 1. Stack (exact installed versions, from `package-lock.json`) [CODE]

| Item | Version | Notes |
|---|---|---|
| Next.js | **16.4.5** (Turbopack build) | App Router; requires **Node ≥ 20.9.0** (`engines` in lockfile) |
| React / React DOM | 19.3.1 | |
| TypeScript | ^6.0.3 (strict) | |
| Tailwind CSS | ^4.3.5 via `@tailwindcss/postcss` | build-time only |
| next-intl | 4.14.9 | routing + messages + hreflang; `localePrefix: 'always'`, locales `en`, `ar` |
| React Hook Form + Zod | ^7.91 / ^4.6.7 | shared schema browser ↔ server |
| sharp | 0.35.5 (devDependency) | used by `next start` image optimizer when present |
| Email | Resend **HTTP API via `fetch`** (no SDK) | `src/features/rfq/server/delivery.ts` |
| Database / CMS / Redis | **none** | catalog is JSON in `src/data/catalog/` |
| Docker / CI config | **none** (no Dockerfile, no `.github/`, no `vercel.json`/`netlify.toml`) | |

## 2. Build result [MEASURED]

`npm ci && npm run build` on Node 22.23.5 → **success (exit 0)**, compile 3.8 s, TypeScript 4.1 s.

- **138 pages pre-rendered** (`●` SSG / `○` static): 2 locales × (home, about, collections, 7 category pages, 51 product pages, contact, custom-manufacturing, inquiry, privacy, shipping-payment, sourcing-export) + robots.txt, sitemap.xml, `_not-found`.
  - Catalog: 55 product records = 48 active, 4 `merged` (→ 308 redirects), 3 `archived`; 7 categories.
- **Dynamic (server-rendered on demand)**:
  - `ƒ /api/rfq`: `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`.
  - `ƒ /[locale]/[...rest]`: the catch-all route for unknown URLs (localized 404).
  - `ƒ Proxy (Middleware)`: `src/proxy.ts` (next-intl locale negotiation; `/` → `307 /en`).
- `.next` output: 96 MB total (46 MB `server/`, 1.6 MB `static/`). `output: 'standalone'` is **not** configured; plain `next start` is used.
- The repo's `docs/DEPLOYMENT.md` says "70 static pages". That number is **outdated**: the current build reports 138.

## 3. Runtime features the host must support [CODE]

| Feature | Where | Hosting implication |
|---|---|---|
| Node.js server runtime | `/api/rfq` uses `node:crypto` (`randomBytes`), `runtime='nodejs'` | Needs Node or a Node-compatible runtime (Workers `nodejs_compat` works, see §7) |
| Proxy / middleware | `src/proxy.ts` → `next-intl/middleware`, matcher excludes `api`, `_next`, files | Must run on every page request; it is what turns `/` into `/en` |
| Redirects (308) | `next.config.ts` `redirects()`, generated from catalog `merged`/`previousRoutes` | Needs Next's routing layer, or the rules moved into host config |
| Security headers | `next.config.ts` `headers()`: nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy | Same as above |
| Image optimization | `next/image` (`src/components/ui/Img.tsx`), `formats: ['image/avif','image/webp']`, deviceSizes 360–1600, imageSizes 72–480 | Needs an image optimizer (sharp on Node, Cloudflare Images binding on Workers, or platform optimizer) |
| Secrets | `RESEND_API_KEY`, `RFQ_TO_EMAIL`, `RFQ_FROM_EMAIL` (server only, guarded by `server-only`) | Host must store runtime secrets |
| Build-time public vars | `NEXT_PUBLIC_SITE_URL`, `_WHATSAPP_NUMBER`, `_SALES_EMAIL`, `_ALLOW_INDEXING`, `_CONSENT_TEXT_VERSION` | Inlined at **build**, so changing them means rebuilding |
| Outbound HTTPS | `fetch('https://api.resend.com/emails')`, 10 s timeout | Any host with outbound internet |
| Rate limiting | `src/lib/rate-limit.ts`: in-memory fixed window, default 5 req / 600 s per IP | Only reliable on **one long-lived process**; see §5 |
| Database / file writes / websockets / cron | none | No persistent storage needed at runtime |

## 4. Static assets and images [MEASURED]

| Measure | Value |
|---|---|
| `public/` total | **26.2 MB** (26,152,360 bytes) |
| Files | 297 `.webp` (225 under `public/images/`, 72 under `public/assets/`) |
| 640 px renditions | 148 files, avg **48 KB** |
| 1400 px renditions | 148 files, avg **123 KB** |
| Hero | 1 file, 237 KB (`warm-neutral-living-room-1672.webp`) |
| Largest single file | < 1 MB (no file over 1 MB in `public/`; none over 5 MB anywhere outside `.git`) |
| Repo working tree (excl. `.git`) | 105 MB, of which `docs/` 62 MB and `_source/` 14 MB (not served) |

All catalog images are already pre-sized WebP, so the optimizer only re-encodes to AVIF/WebP at the requested width.
Example from the Workers test: hero at `w=640` became **16.6 KB AVIF** or **37.5 KB WebP**, down from the 237 KB source.

## 5. Rate limiting and security review findings (no code changed)

1. **In-memory limiter only works per process** [CODE + MEASURED]. On a single VPS process it is effective. On serverless or Workers, each instance or isolate keeps its own counter, so it is best-effort only. The repo's own docs already flag this (`DEPLOYMENT.md` item 8). In the local Workers runtime the 6th request from one IP got `429`, as designed.
2. **Client-IP key can be spoofed (pre-existing issue, launch risk).** `clientKey()` uses the **first** entry of `X-Forwarded-For`. Proxies such as Nginx (`$proxy_add_x_forwarded_for`) and Cloudflare *append* the real IP to whatever the client sent, so an attacker can send a fresh fake `X-Forwarded-For` on every request and bypass the limit.
   - Mitigations (choose at deployment, not done here): on Cloudflare, prefer `CF-Connecting-IP`; on Nginx, overwrite with `proxy_set_header X-Forwarded-For $remote_addr` (after `real_ip` from Cloudflare ranges); or add a Cloudflare WAF rate-limit rule on `/api/rfq`.
3. **Same-origin check, 64 KB body cap, honeypot and Zod validation** all run before email is sent [CODE]. Cross-origin POST returned `403` in the Workers test [MEASURED].
4. No secrets are committed. `.gitignore` excludes `.env*` (except `.env.example`), `*.pem`, `*.key`, `.vercel` [CODE].

## 6. Page weight and server footprint [MEASURED]

Measured with headless Chromium against `next start` (production build), cold cache, scrolled to the bottom:

| Page | Desktop total | of which images | JS | Mobile total |
|---|---|---|---|---|
| `/en` | 744 KB | 129 KB (8) | 283 KB | 738 KB |
| `/ar` | 751 KB | 133 KB (8) | 283 KB | 746 KB |
| `/en/collections` | 756 KB | 114 KB (7) | 292 KB | 747 KB |
| `/en/collections/bedrooms` | 760 KB | 73 KB (8) | 302 KB | 741 KB |
| product page | 708 KB | 59 KB (9) | 302 KB | 686 KB |

- HTML document (uncompressed) is 90–133 KB per page. `next start` gzips when the client asks; the "total" column above is what Chromium actually transferred.
- **Server memory:** the `next-server` process used **≈ 390 MB RSS** after serving these pages and on-demand image transforms. That means **≥ 1 GB RAM** is needed on a VPS; 512 MB instances are too small. The `npm run build` step also needs RAM, so on a 1 GB VPS either build in CI or on a laptop, or add swap.

## 7. Platform feasibility (what works **today, without code changes**)

| # | Target | Works with current code? | What is required | Evidence |
|---|---|---|---|---|
| 1 | **Traditional Node.js VPS** (`next build` + `next start` behind Nginx/Caddy) | **Yes, unchanged** | Node ≥ 20.9, ≥ 1 GB RAM, a process manager (systemd/PM2), reverse proxy + TLS, env vars | `next start` tested locally [MEASURED] |
| 2 | **Managed Next.js hosting** (Vercel, Netlify, Amplify, Firebase App Hosting) | **Yes, by design** (these platforms adapt Next builds) | Env vars in the dashboard; rate limiter becomes best-effort | Provider docs (see 02) |
| 3 | **Serverless containers** (Cloud Run, Render, Railway, Fly, Koyeb, DO App Platform) | **Yes, unchanged** (runs `next start`) | A start command or buildpack; min RAM ≈ 512 MB–1 GB; cold starts if scaled to zero | `next start` [MEASURED] |
| 4 | **Cloudflare Workers via OpenNext** | **Yes, with deployment-only additions (no app-code change)** | Add devDeps `@opennextjs/cloudflare` (tested 1.20.18) + `wrangler` (4.168.0); add `wrangler.jsonc` (`nodejs_compat`, assets binding, **`IMAGES` binding**) and `open-next.config.ts`; build with `opennextjs-cloudflare build` | See §8 |
| 5 | **Static hosting + separate RFQ backend** (`output: 'export'`) | **No, would need app changes** | Remove/replace `proxy.ts` (locale redirect), move `redirects()`/`headers()` into host rules, `images.unoptimized` or a custom loader, rework the `[...rest]` 404, move `/api/rfq` to a separate function (and change the form's endpoint/CORS/origin check) | Next.js static export does not support middleware, route handlers with POST, `redirects/headers` or the default image loader |
| 6 | **Container hosting** (Docker) | Yes, but needs a new `Dockerfile` (none exists) | Not justified: no service needs Docker; option 1 or 3 runs the same `next start` | — |

> "138 statically generated pages" ≠ "static-exportable app". The proxy, the POST route handler, the redirects/headers config and `next/image` all need a server or an adapter.

## 8. OpenNext / Cloudflare Workers compatibility test [MEASURED]

Done on a **scratch copy** (not the repository). No app source was edited. Only `wrangler.jsonc` + `open-next.config.ts` were added to the copy.

| Check | Result |
|---|---|
| `opennextjs-cloudflare build` with Next 16.4.5 | ✅ success, 138/138 pages generated |
| Proxy (`proxy.ts`) handling | ⚠️ Bundled as **Node.js middleware**. The build prints: *"Node.js middleware support is experimental in cloudflare, and not officially maintained by OpenNext maintainers. Use at your own risk."* |
| Worker bundle size (`wrangler deploy --dry-run`) | **8,180 KiB raw / 1,588 KiB gzip** (≈ 1.55 MiB). Far under Cloudflare's current limit of 64 MiB uncompressed on both Free and Paid [S2]. It would also pass the older 3 MiB / 10 MiB compressed figure still quoted in OpenNext's docs |
| Static assets | 342 files, 28 MB. Under 20,000 files / 25 MiB-per-file limits |
| Local workerd run (`wrangler dev`) | `/` → `307 /en` ✅ · `/en`, `/ar/collections`, product page → `200` ✅ · unknown URL → `404` ✅ · `robots.txt`/`sitemap.xml` → `200` ✅ · security headers present ✅ |
| `next/image` via `IMAGES` binding (local emulation) | ✅ `image/avif` 16.6 KB and `image/webp` 37.5 KB returned depending on `Accept` |
| `/api/rfq` | ✅ Zod validation `422`, cross-origin `403`, rate limit `429` after 5 hits (per isolate) |
| **Not tested** | Real Cloudflare edge deploy, real Cloudflare Images billing, real Resend delivery, CPU time per request on the **Free plan's 10 ms CPU limit** (UNVERIFIED: proxy + SSR 404 + image transforms may exceed 10 ms; the Paid plan allows 30 s default) |

## 9. Launch blockers that are independent of hosting [DOC: `docs/reports/final-catalog-fixes/06-REMAINING-LAUNCH-BLOCKERS.md`]

1. WhatsApp number not configured.
2. Sales e-mail not configured.
3. Resend credentials missing, so RFQ returns `503`. Never tested end to end.
4. Privacy policy text and consent version are drafts awaiting owner/legal approval.
5. About-page image is a placeholder.
6. Production domain / `NEXT_PUBLIC_SITE_URL` / deployment configuration.
7. Final logo, company registration details.
8. Owner confirmation for one unverified photo (kids room 8).
9. Lighthouse / field performance on the deployed site not measured.
10. **New (this research):** `X-Forwarded-For` spoofing weakens the RFQ rate limit (§5.2).
11. **New:** `docs/DEPLOYMENT.md` page count is outdated (70 vs 138).

## 10. Minimum hosting requirements (derived)

- Node.js ≥ 20.9 runtime (or Workers + `nodejs_compat` via OpenNext).
- ≈ 1 GB RAM for an always-on `next start` process (measured 390 MB RSS).
- About 30 MB of static assets, served with long-cache headers through a CDN.
- One small POST endpoint; outbound HTTPS to `api.resend.com`.
- An image optimizer with AVIF/WebP (or switch to pre-generated images, which is a code change).
- Custom domain + TLS. DNS changes must keep the Spacemail MX/SPF/DKIM records.
- No database, no persistent disk writes, no background jobs.
