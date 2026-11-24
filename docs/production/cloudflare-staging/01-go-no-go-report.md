# Cloudflare Workers Free — Staging Go/No-Go Report

**Date:** 2026-11-25 · **Scope:** staging Worker `al-nasr-furniture-staging` on `https://al-nasr-furniture-staging.alnasr-staging.workers.dev` (Basic Auth, noindex). No DNS, e-mail, domain or billing change was made.

## Verdict: **GO for staging** · all blockers closed (B1, B2, A1). Production launch still needs the decisions under "To reach GO".

Both defects found during validation are **fixed and verified live** in version `83e696d7`: the cookie 500 (B1) and the `/favicon.ico` 500 (A1). Workers Builds is disconnected (B2). GitHub holds the exact deployed revision.

| # | Item | Status | Evidence / action |
|---|---|---|---|
| **B1** | Every request with a `Cookie` header answered 500. That broke a visitor's 2nd page view, RSC navigation and the RFQ POST. Upstream regression in `@opennextjs/cloudflare` 1.20.18 ([#1506](https://github.com/opennextjs/opennextjs-cloudflare/issues/1506)). | **Fixed** in `077f15b` | <ul><li>Pinned to **1.20.17** (`@opennextjs/aws` 4.1.16). The middleware bundle now uses node-mode interop (`__toESM(require_dist(), 1)`).</li><li>Live: cookie requests on `/en`, `/ar/collections`, `/en/inquiry` → 200.</li><li>254/254 page requests with a cookie → 200.</li><li>Real browser (Playwright, returning visitor): 4 client-side navigations, 37 RSC responses 200, **0 × 5xx**.</li><li>Return to the latest release once it contains #1507. None of the 1.20.18 changes are used by this site.</li></ul> |
| **B2** | Workers Builds was still connected, so the deployed source could not be pushed. | **Closed** 2026-11-25 | <ul><li>Disconnected with the owner's approval. Dashboard → Settings → Builds now shows `Git repository: Connect` (verified after reload).</li><li>Then pushed `564557f..baa3f33` (fast-forward) to `deployment/cloudflare-staging`. GitHub API: `baa3f33`.</li><li>0 check-runs on `baa3f33`, so no build was triggered.</li><li>Deploys are local `wrangler deploy` only from now on.</li></ul> |
| **A1** | `GET /favicon.ico` → **500** (with or without cookies). This app bug predated the Cloudflare work; it also reproduced on `next start`. | **Fixed** in `baa3f33` | <ul><li>Cause: the proxy skips dotted paths, so `/favicon.ico` reached `src/app/[locale]/` with `locale="favicon.ico"`, and page `generateMetadata` threw on `allMessages[locale]`.</li><li>Fix: `export const dynamicParams = false` on the `[locale]` layout, the same pattern the collections segments use. Unknown first segments now 404 before pages run.</li><li>New e2e test (failed with 500 before).</li><li>Live: `/favicon.ico`, `/apple-touch-icon.png`, `/wp-login.php`, `/not-a-locale.txt/about` → 404; `/en/nope` → localized 404.</li><li>Full e2e 239 passed (9 conditional skips).</li></ul> |

## Deployed version ↔ source

| Worker version | Source | Notes |
|---|---|---|
| **`83e696d7-74b6-4015-9558-c53f1649abfa`** (active, 100%, tag `baa3f33`) | **`baa3f33`** (on top of `077f15b`, `edf8dd1`) on `deployment/cloudflare-staging`: **on GitHub** (`baa3f33`) | Clean `cf:build:staging` on Node 22.23.5, `wrangler deploy` 4.168.0 from the MacBook. Live: smoke 50/50; real browser 42 RSC 200, 0 × 5xx |
| `57bc97b9` | `077f15b` | <ul><li>Clean `cf:build:staging` on Node 22.23.5, `wrangler deploy` 4.168.0 from the MacBook.</li><li>Bindings: `RFQ_LIMITER` (DO), `IMAGES`, `ASSETS`, `WORKER_SELF_REFERENCE`.</li></ul> |
| `42f69ae7` | `edf8dd1` | Global DO rate limiter; had B1 |
| `81c88b24` | `564557f` | Created by `wrangler secret put STAGING_BASIC_AUTH` |
| `a63b2d63` | `564557f` | First local deploy |
| Workers Builds runs for `ee7d329`, `564557f` | — | Both **failed**, never deployed |

`main` is unchanged at `f4352c9` (local and `origin`). `origin/deployment/cloudflare-staging` = `baa3f33` = the source of the active version `83e696d7` (tag `baa3f33`).

**Deploy note:**
- `wrangler deploy` writes OpenNext's prerendered route cache (`cdn-cgi/_next_cache/<buildId>/…`, 138 files) into `.open-next/assets` before upload. This is by design for the static-assets incremental cache.
- Always deploy from a clean `cf:build:staging`.

## Platform and limits (Workers Free)

- **Plan:** dashboard → Workers plans shows **Free, "Current plan"**. No paid product is enabled.
- **Durable Objects (`RfqRateLimiter`, SQLite):** on 2026-11-24, 26 requests, 0 errors, 0.126 GB-s, 26 rows read, 25 rows written, 0 B stored. That is under 0.03% of the daily free limits (100k requests, 13,000 GB-s, 5M reads, 100k writes, 5 GB). One counted RFQ POST costs ≈ 1 DO request and 1 row write, plus 1 alarm per IP window.
- **Bundle:** 1.58 MiB gzip, 8.2 MiB raw. The Free limit is 64 MiB uncompressed (no compressed limit). Startup is 19 ms; the limit is 1 s.

## CPU time (Free limit: 10 ms per request, with "some built-in flexibility" for infrequent overruns)

| Source | P50 | P90 | P99 | P999 | Exceeded-CPU errors |
|---|---|---|---|---|---|
| Dashboard metrics, last 24 h (~1.2k invocations, mostly synthetic) | 5.06 ms | 9.88 ms | **138 ms** | **254 ms** | **0** |

| Dashboard, active version `57bc97b9` only (804 invocations: smoke, browser and cookie-carrying traffic) | **4.86 ms** | **7.7 ms** | 40.86 ms | 362 ms | **0** (errors 0, uncaught exceptions 0) |

`wrangler tail` sample (83 events, sampled) by route class:

| Route class | p50 | max |
|---|---|---|
| Product pages | 6 ms | 9 ms |
| Collection pages | 8 ms | 16 ms |
| Image transforms | 4 ms | 32 ms |
| Other pages | 8 ms | 56 ms (`/en`, likely first request on an isolate) |
| `sitemap.xml` | 14 ms | — |
| RFQ POST answered by the DO | 0 ms | — |

**Assessment:**
- The median is comfortable.
- After the fix, P90 is 7.7 ms, but the P99/P999 tail is still above 10 ms.
- Cloudflare tolerates "infrequent" overruns and gives no number. No request has been killed so far, but this was low, synthetic traffic.
- **Conditional risk:** watch "Exceeded CPU Time Limits" (error 1102) under real traffic. Workers Paid is the documented way out if it appears; no billing change was made.

## Performance

**Server timing (client side, Egypt → MRS):**

Before the fix (version `42f69ae7`, no cookies):

| Request type | n | TTFB p50 | TTFB p95 |
|---|---|---|---|
| First request per page | 126 | 109 ms | 484 ms |
| Repeat request per page | 126 | 99 ms | 539 ms |
| First image transform | 20 | 403 ms | 720 ms |
| Repeat image transform | 20 | 352 ms | 680 ms |

After the fix (version `57bc97b9`, every request carries the locale cookie):

| Request type | n | Status | TTFB p50 | TTFB p95 |
|---|---|---|---|---|
| Pages, first and repeat | 254 | all 200 | 78–79 ms | 96–104 ms |
| Image transforms | 40 | all 200 | 310–355 ms | 723–815 ms |

- First and repeat page requests are effectively the same, because pages are served from the prerendered static-assets cache.
- Image transforms are **not cached at the edge** (no `cf-cache-status`), so each repeat re-transforms. This is an optimisation, not a blocker.

**Lighthouse 13.6.0** (single run per page, simulated throttling):

| Page | Mobile perf | Mobile LCP | Mobile TBT | Desktop perf | Desktop LCP |
|---|---|---|---|---|---|
| `/en` | 79 | 1.34 s | 903 ms¹ | 99 | 0.88 s |
| `/ar` | 89 | 3.75 s | 43 ms | 100 | 0.72 s |
| `/en/collections` | 92 | 3.32 s | 26 ms | 100 | 0.63 s |
| product (`octagon-mirror-bedroom-set`) | 87 | 4.11 s | 40 ms | 100 | 0.66 s |
| `/ar/inquiry` | 100 | 1.07 s | 46 ms | 100 | 0.27 s |

- **All pages:** Accessibility **100**, CLS ≤ 0.014, Best-practices 96 (console errors from B1 and A1, both since fixed). Lighthouse was run before the fixes and has not been re-run.
- **SEO 58–61 is expected:** the pages are noindex, and `robots.txt` answers 401 to Lighthouse's auth-less fetch.
- ¹ One 833 ms "unattributable" long task in a single run. It needs a repeat run before drawing conclusions.
- Mobile LCP of 3.3–4.1 s on image-led pages is dominated by image load duration under slow-4G simulation. That's above the 2.5 s "good" threshold, but not a launch blocker.

## Image optimisation

- AVIF is served when the browser accepts it, and WebP is the fallback (smoke test).
- Non-configured widths are rejected with 400 (quota protection).
- Size reduction from the source `warm-neutral-living-room-1672.webp` (236 KB):

| Width | Optimised size |
|---|---|
| 224 | 4.7 KB |
| 640 | 27.9 KB |
| 1280 | 97 KB |

## Mobile responsiveness

- Playwright, live, on the iPhone SE (320 CSS px), Pixel 7 (412 px) and 768 px tablet profiles, across 9 pages in both locales: **27/27 with no horizontal overflow**.
- The `dir` is correct on every page, and the viewport meta is `width=device-width, initial-scale=1`.
- Visual spot check of `/ar` product on 320 px: RTL breadcrumb and gallery are correct.

## RFQ rate limiter: fail-open review (remaining security risk)

**Behaviour:** if the Durable Object call throws, the wrapper logs `rfq_limiter_unavailable` (no IP) and lets the request continue. The app then still applies:
- its own **per-isolate** in-memory limit;
- the same-origin check (403);
- the JSON content-type check (415);
- the 64 KB body cap;
- Zod validation;
- the honeypot.

**When it fails open:**
- a DO outage or overload;
- the DO free quota running out (100k requests/day).

Quota exhaustion is not a separate attack path. Every counted RFQ POST is also a Worker request, and the Worker's own 100k/day cap is hit first or at the same moment, which takes the whole site to error 1027. That is a worse but louder failure.

**Impact while failed open:** RFQ spam is limited only per isolate, which can flood the sales inbox and Resend quota. No data is exposed. Staging is additionally behind Basic Auth.

**Residual risks to decide before production:**
- fail-closed (429/503) for `/api/rfq` only;
- a Workers Logs alert on `rfq_limiter_unavailable`;
- a challenge on the form (e.g. Turnstile), which would be a new feature and is not proposed here.

Separately, the limit is keyed on IP, so users behind a shared NAT share a budget (5 per 10 min). That's acceptable for B2B RFQ volumes.

## What passed

- Basic Auth fails closed: 503 without the secret, 401 without or with wrong credentials.
- `X-Robots-Tag` and noindex are present, and robots disallows all.
- Security headers are present on pages and static files.
- Locale redirects, catalog 308s and 404s work.
- RFQ origin and content-type checks work.
- The global rate limit is deterministic: `422×4 → 429×4`, a concurrent burst gave 12/12 429, and 429 carries `Retry-After`.
- The smoke test is **50/50** live on `83e696d7`, including the returning-visitor cookie checks.
- Free plan confirmed, DO usage negligible, Accessibility 100, responsive 27/27.

## To reach GO (production)

1. **A1 on `main`:** `baa3f33` is an app fix. It lives on the staging branch until that is merged; it is not on `main`.
2. Decide on the fail-open policy for `/api/rfq`.
3. Re-run Lighthouse after A1, and watch exceeded-CPU errors under real traffic.
4. Move off the 1.20.17 pin once an `@opennextjs/cloudflare` release contains #1507. Re-run the smoke test, including the cookie checks.
