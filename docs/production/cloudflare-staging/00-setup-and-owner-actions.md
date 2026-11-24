# Cloudflare Workers Free — Staging Setup (branch `deployment/cloudflare-staging`)

**Scope:** controlled staging trial only. **Not** the production launch.
The production domain, Spaceship DNS, nameservers and Spacemail records are **not touched**.
Nothing paid is enabled: no R2, KV, D1, Queues, Images Paid or Workers Paid. The only Durable Object is the SQLite-backed RFQ rate limiter, which is included in Workers Free.

## What this branch adds (deployment configuration only; no application source changed)

| File | Purpose |
|---|---|
| `wrangler.jsonc` | Worker `al-nasr-furniture-staging`. It is served on `workers.dev` only and has no routes or custom domain. Uses `nodejs_compat`, Static Assets, Images binding, self-reference service binding, observability logs, non-secret rate-limit vars, and the `RFQ_LIMITER` Durable Object binding (SQLite migration `v1-rfq-limiter`) |
| `open-next.config.ts` | OpenNext config. Uses the read-only **static-assets incremental cache**, so no paid storage is needed |
| `cloudflare/staging/worker.mjs` | Staging wrapper around the unmodified OpenNext worker. It adds:<ul><li>HTTP Basic Auth (fails closed);</li><li>`X-Forwarded-For` overwritten with `CF-Connecting-IP`, which closes the rate-limit bypass;</li><li>`X-Robots-Tag: noindex`;</li><li>a **global** per-IP RFQ rate limit in the `RfqRateLimiter` Durable Object (one object per IP; same 5 per 600 s as the app). The app's in-memory limiter counts per isolate on Workers, so on its own it gives no global limit. **Fails closed** (503 `rfq_unavailable`, Retry-After 120) if the Durable Object is unreachable, without logging the IP (owner decision 2026-11-25; code in `cloudflare/shared/rfq-guard.ts`).</li></ul> |
| `cloudflare/staging/_headers` | Security headers + `noindex` for static files; immutable cache for `/_next/static/*` |
| `cloudflare/staging/build.env` | Public build-time values. Indexing off, WhatsApp/e-mail empty ("PENDING"), consent version `STAGING-TEST` |
| `cloudflare/staging/build.sh` | Calls `cloudflare/shared/build.sh staging`. That script runs `opennextjs-cloudflare build` and `populateCache local` (the prerender route cache), copies `_headers`, and writes the `staging` deploy marker |
| `cloudflare/shared/rate-window.ts`, `rfq-guard.ts`, `rfq-limiter-do.mjs` | Fixed-window step, edge RFQ guard and Durable Object, shared with production. Unit-tested in `tests/edge-rate-window.test.ts` and `tests/edge-rfq-guard.test.ts`. Production setup: `docs/production/cloudflare-production/` |
| `cloudflare/shared/smoke-test.mjs` | Automated checks covering access control, every sitemap page, locale redirects, catalog 308 redirects, 404s, headers, AVIF/WebP, RFQ validation, the spoofed-IP rate-limit test and a global-limit check (every request after the first 429 must also be 429) |
| `package.json` | Pinned devDeps `@opennextjs/cloudflare@1.20.18`, `wrangler@4.168.0`; scripts `cf:build:staging`, `cf:preview:staging`, `cf:deploy:staging` |
| `.gitignore`, `eslint.config.mjs` | Ignore `.open-next/`, `.wrangler/`, `.dev.vars` |

## Owner actions required (in this order)

### 1. Create a free Cloudflare account (no card needed for Free)
1. Go to https://dash.cloudflare.com/sign-up and sign up with the business e-mail.
2. **Do not add a site / domain.** Skip any "add your domain" prompt, so DNS stays at Spaceship.
3. Open **Workers & Pages**.
   - If asked, choose a **workers.dev subdomain**, e.g. `alnasr-staging`. It becomes `https://al-nasr-furniture-staging.<subdomain>.workers.dev`.
   - Choose the **Free** plan. Do **not** select Workers Paid.
4. Note your **Account ID** (Workers & Pages → right sidebar, or Account home → "Account ID"). It is not secret.

### 2. Create a scoped API token for the deployment
1. Go to https://dash.cloudflare.com/profile/api-tokens and click **Create Token**.
2. Use the template **"Edit Cloudflare Workers"**.
3. Under **Account Resources**, choose *Include → your account*.
4. Under **Zone Resources**, choose *Include → All zones*. You have no zones in Cloudflare, so this grants nothing extra.
5. Add one permission: **Account → Account Analytics → Read**. This lets the trial read real CPU-time metrics.
6. Optional: set a TTL of 7–14 days, so the token expires after the trial.
7. Click **Create Token**. **Do not paste it in the chat.** Enter it only in the secure credential form Claude opens. It is stored in the cloud session's environment and injected for `api.cloudflare.com` only; Claude never sees the value.

### 3. Controlled RFQ e-mail test (optional but recommended)
This uses **Resend's sandbox sender**. Resend only delivers sandbox mail to the Resend account owner's own address, so no customer can be e-mailed.
1. Create a free Resend account at https://resend.com/signup. **Do not add or verify `alnasrfurniture.com` yet.**
2. Create an API key with permission **Sending access**.
3. In the Cloudflare dashboard, open Workers & Pages → `al-nasr-furniture-staging` → **Settings → Variables and Secrets**. Add these as type **Secret**:
   - `RESEND_API_KEY` = the Resend key
   - `RFQ_TO_EMAIL` = the same e-mail you used to sign up to Resend
   - `RFQ_FROM_EMAIL` = `AL NASR Staging <onboarding@resend.dev>`
4. Tell Claude when they're added. Claude will submit **exactly one** test RFQ.

### 4. Staging password
- Claude generates a random `STAGING_BASIC_AUTH` (`user:password`) and sets it as a Worker secret. Claude gives it to you so you can open the staging site.
- You can rotate it any time in **Settings → Variables and Secrets**.
- Removing it locks the site: it then answers 503.

## Status on 2026-11-24 (done by Claude)
- Cloudflare account verified via the scoped API token. It has no zones: DNS stays at Spaceship.
- workers.dev subdomain **`alnasr-staging`** created. Staging URL: **https://al-nasr-furniture-staging.alnasr-staging.workers.dev**
- **A deploy from Claude's cloud session failed** at the static-asset upload step, with `401` on `/workers/assets/upload`.
  - Cause: that step authenticates with a short-lived upload JWT. The session's network proxy replaces the `Authorization` header with the saved API token.
  - **Nothing was created** in the account (0 Workers). Use one of the two deploy paths below.

## Deploy path A (recommended): Cloudflare Workers Builds from GitHub (no local tools)
Workers Builds Free: 3,000 build minutes/month, 8 GB RAM, 20-minute timeout ([limits](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)). One build of this site takes a few minutes.
1. Go to https://dash.cloudflare.com/?to=/:account/workers-and-pages, then **Create application**, then **GitHub**.
2. Authorize the Cloudflare GitHub app for **only** `mohamedwalidelmorsy/AL-NASR-Furniture`, and select that repository.
3. Configure:
   - **Project / Worker name:** `al-nasr-furniture-staging`. This must equal `name` in `wrangler.jsonc`.
   - **Production branch:** `deployment/cloudflare-staging`. "Production" is only Cloudflare's term here; this Worker has no custom domain.
   - **Build command:** `npm run cf:build:staging`
   - **Deploy command:** `npx wrangler deploy`
   - **Non-production branch builds:** **disabled**, so other branches and `main` are never built.
   - **Build variable:** `NODE_VERSION` = `22`
4. Select **Save and Deploy**, then wait for the build to finish.
5. The site answers **503 "Staging is locked"** until the password secret exists. That is expected. Tell Claude, and Claude will set `STAGING_BASIC_AUTH` through the API and run the tests.

## Deploy path B: from your MacBook (macOS / Linux / WSL)
```bash
git checkout deployment/cloudflare-staging && npm ci
```
```bash
git pull
```
```bash
npx wrangler login
```
```bash
npm run cf:deploy:staging
```
```bash
npx wrangler secret put STAGING_BASIC_AUTH
```

## Free-tier safety notes
- **Workers Free:** over 100,000 requests/day, requests fail with error 1027 and you are **not billed**. Over 10 ms CPU, requests fail with error 1102.
- **Images Free:** beyond 5,000 unique transformations/month, new transforms return error 9422 and are **not billed**. Only the 11 configured widths are accepted; any other width gets HTTP 400 (tested).
- **Durable Objects Free (SQLite only):** 100,000 requests/day and 100,000 rows written/day. Each counted RFQ POST uses about 1 request and 1 row write, plus 1 alarm per IP window. Over the limit, operations fail and nothing is billed; the limiter then fails closed (RFQ answers 503 until the daily reset).
- **Why not the Workers Rate Limiting binding:** its `period` is 10 or 60 s only, and its counts are approximate and per Cloudflare location, so it cannot express "5 per 600 s per IP".
- No payment method is needed for any of the above. If Cloudflare ever asks for a card to "continue", stop and ask before entering one.
