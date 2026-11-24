# Production configuration and operations (Cloudflare Workers Free)

**Status 2026-11-25:** prepared and tested; **not deployed**. No DNS change has been made, and search indexing is off.
Owner decisions applied:
- Workers Free, with the measured CPU risk accepted; no Workers Paid without owner approval.
- RFQ fails closed when the limiter is unavailable.
- Staging stays a separate environment.
- Node.js 22 (Homebrew `node@22`) is the build runtime.

## 1. Two environments, one codebase

| | Staging | Production |
|---|---|---|
| Wrangler config | `wrangler.jsonc` (the default) | `wrangler.production.jsonc` (only with `-c`) |
| Worker name | `al-nasr-furniture-staging` | `al-nasr-furniture` |
| Entry | `cloudflare/staging/worker.mjs` | `cloudflare/production/worker.mjs` |
| Access | Basic Auth (`STAGING_BASIC_AUTH`); fails closed with 503 when unset | Public |
| Indexing | Always noindex: `_headers` + Worker `X-Robots-Tag` + app | Noindex until launch. Three gates: `NEXT_PUBLIC_ALLOW_INDEXING` (build), `ALLOW_INDEXING` var (Worker header), and `CF_CONFIRM_INDEXING=yes` to build with indexing on |
| Build values | `cloudflare/staging/build.env` | `cloudflare/production/build.env` (the build refuses empty or `PENDING` values) |
| Static headers | `cloudflare/staging/_headers` (with noindex) | `cloudflare/production/_headers` (security headers only) |
| URL | `https://al-nasr-furniture-staging.alnasr-staging.workers.dev` | `workers.dev` for the pre-cut-over check, then the custom domain (DNS runbook) |

Shared by both: client-IP normalisation (`CF-Connecting-IP`) and the RFQ edge guard (`cloudflare/shared/rfq-guard.ts`, `rfq-limiter-do.mjs`, `rate-window.ts`). They also share the build (`cloudflare/shared/build.sh`), the deploy guard (`check-target.mjs`) and the smoke test (`smoke-test.mjs`).

### Isolation guarantees (tested)

- **Separate Workers:** different names, so secrets, Durable Object namespaces, logs and versions never mix. Each Worker's `WORKER_SELF_REFERENCE` points at itself. Test: `tests/cloudflare-config.test.ts`.
- **Plain `wrangler deploy` deploys staging.** Production needs `-c wrangler.production.jsonc` or `npm run cf:deploy:production`.
- **Every build records its target** in `.open-next/deploy-target`. The deploy scripts refuse a bundle built for another target. Verified: a staging bundle is refused by the production check, and a production test build is refused by the staging check.
- **Production deploy rules:** it refuses a dirty git tree, so each version maps to one commit and is tagged with its SHA. It also refuses missing business values; `CF_ALLOW_INCOMPLETE=1` only makes a local test build, marked `production-incomplete` and refused by deploy.
- **Staging can never bind a custom domain**, and production may only bind `alnasrfurniture.com` / `www` (config test).
- **No secret appears in committed `vars`** (config test).

## 2. Commands (Node 22: `export PATH=/opt/homebrew/opt/node@22/bin:$PATH`)

| Task | Command |
|---|---|
| Staging build / deploy | `npm run cf:build:staging` / `npm run cf:deploy:staging` |
| Production local test build (incomplete values) | `CF_ALLOW_INCOMPLETE=1 npm run cf:build:production` |
| Production config dry run (no upload) | `npm run cf:check:production` |
| Production deploy (**owner approval only**) | `npm run cf:deploy:production` |
| Production secrets (**at launch**) | `npx wrangler secret put RESEND_API_KEY -c wrangler.production.jsonc` (then `RFQ_TO_EMAIL`, `RFQ_FROM_EMAIL`) |
| Smoke test, staging | `STAGING_AUTH='alnasr:…' BASE_URL=<staging url> node cloudflare/shared/smoke-test.mjs` |
| Smoke test, production | `SMOKE_MODE=production BASE_URL=<url> SITE_URL=https://alnasrfurniture.com [EXPECT_INDEXING=true] node cloudflare/shared/smoke-test.mjs` |
| Roll back | `npx wrangler rollback <version-id> -c <config>`; versions are tagged with their git SHA |

Always deploy through the npm scripts. They build, copy the prerender route cache into the assets, and check the target before uploading.

## 3. RFQ edge policy

| Situation | Status | Body | Headers | Form shows (EN/AR) |
|---|---|---|---|---|
| Under the limit | → app | app response | — | normal flow |
| Limit reached (5 per 600 s per IP, global) | **429** | `{"error":"rate_limited"}` | `Retry-After` (seconds left) | "Too many requests", with the wait in minutes (Arabic number forms: دقيقة واحدة / دقيقتين / 3 دقائق / 15 دقيقة) |
| Limiter Durable Object fails, or its binding is missing | **503 (fail-closed)** | `{"error":"rfq_unavailable"}` | `Retry-After: 120` | "Requests temporarily unavailable" |
| E-mail delivery not configured | 503 (app) | `{"error":"not_configured"}` | — | "Request not sent" (unchanged) |
| **MVP: online RFQ off** (`NEXT_PUBLIC_RFQ_ENABLED=false`) | nothing is sent | — | — | "Online quote requests are not open yet" with WhatsApp / e-mail links; submit disabled. The production build requires at least one real contact channel |

- Every error alert keeps the buyer's details in the browser and offers **WhatsApp**, or the **sales e-mail** when WhatsApp is not configured. Focus moves to the alert.
- Cross-origin (403) and non-JSON (415) requests are neither counted nor blocked by the edge guard; the app rejects them.

## 4. Structured logs (Workers Logs: Free 200k events/day, 3-day retention)

One JSON line per event. **No IP, name, e-mail, phone or message text.** Tests assert this.

| `evt` | Level | Fields | Meaning / action |
|---|---|---|---|
| `rfq.sent` | info | `reference`, `items` | An RFQ was handed to Resend; reconcile with the sales inbox |
| `rfq.rate_limited` | warn | `ray`, `retryAfterSeconds` | Normal protection; a spike means abuse |
| `rfq.limiter_unavailable` | **error** | `ray`, `error`, `policy: fail_closed` | **RFQs are being refused**: check Durable Objects status/quota, then [Cloudflare status](https://www.cloudflarestatus.com/) |
| `rfq.delivery_failed` | **error** | `reference`, `status` | Resend refused or was unreachable; check the Resend dashboard and key |
| `rfq.not_configured` | **error** | — | Production is missing the Resend secrets |

**Monitoring routine** (no paid service):
- **Daily in launch week, then weekly:** check Worker → Metrics (errors, "Exceeded CPU Time Limits", requests/day) and Observability. Filter by `evt` for the three error events.
- **External uptime check:** a free monitor (for example UptimeRobot) on `/en` and `/ar` every 5 minutes, alerting the owner's e-mail. The owner creates this account.
- Which Cloudflare Notifications exist for Workers on the Free plan is **not verified yet**: check Account → Notifications before launch, and enable any free Worker error/usage alert.

## 5. CPU risk (accepted) and measurable upgrade criteria

Measured on staging (Workers Metrics, version `57bc97b9`, 804 invocations, 2026-11-25):
- CPU P50 **4.9 ms**, P90 **7.7 ms**, P99 **40.9 ms**, P999 362 ms; **0** exceeded-CPU errors.
- Workers Free allows 10 ms per request, with "some built-in flexibility" for infrequent overruns ([limits](https://developers.cloudflare.com/workers/platform/limits/)).

| Trigger (any one) | Measured in | Action |
|---|---|---|
| "Exceeded CPU Time Limits" (error 1102) > 0 on **2 different days within 7 days**, or > **0.1 %** of requests on any day | Worker → Metrics → Errors by invocation status | Ask the owner to approve **Workers Paid ($5/month)** |
| Requests > **60,000/day for 3 consecutive days**, or any **1027** (daily limit) | Worker → Metrics → Invocations | Ask the owner to approve Workers Paid |
| CPU **P99 > 50 ms for 7 days** without errors | Worker → Metrics → CPU Time | Investigate (cache HIT rate, new dynamic routes); no upgrade by itself |
| Any page without `x-opennext-cache: HIT` | Smoke test | Treat as a release defect (see §6), not a plan problem |

Nothing is upgraded automatically. The upgrade is a dashboard plan change with no code change.

## 6. Incident 2026-11-25: missing route cache (fixed)

**What happened:**
- Staging version `95136ef3` was deployed with `wrangler deploy -c wrangler.jsonc`. With an explicit config, wrangler skipped OpenNext's cache population, so the prerender route cache was not uploaded (342 instead of 480 assets).
- Every page was server-rendered on request. Workers logs showed render errors (500), `exceededCpu` (82 ms, 503), and 16 of 45 sampled page requests (36 %) failing.

**Response:**
- Rolled back to `83e696d7` with `wrangler rollback`: 24/24 pages returned 200.

**Prevention** (commit `505f06c`):
- `build.sh` always runs `opennextjs-cloudflare populateCache local` and refuses a build without the cache.
- `check-target.mjs` refuses to deploy one.
- The smoke test requires `x-opennext-cache: HIT` on all 126 sitemap pages.
- Redeployed as `51bc65c9`: 45/45 pages 200, smoke 51/51, real browser 0 × 5xx.

**Lesson:** local `wrangler dev` cannot catch this, because it renders without the CPU limit. Only the live smoke test can.
