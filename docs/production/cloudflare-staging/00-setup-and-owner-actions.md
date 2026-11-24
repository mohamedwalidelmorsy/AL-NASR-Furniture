# Cloudflare Workers Free — Staging Setup (branch `deployment/cloudflare-staging`)

**Scope:** controlled staging trial only. **Not** the production launch.
The production domain, Spaceship DNS, nameservers and Spacemail records are **not touched**.
Nothing paid is enabled: no R2, KV, D1, Durable Objects, Queues, Images Paid or Workers Paid.

## What this branch adds (deployment configuration only; no application source changed)

| File | Purpose |
|---|---|
| `wrangler.jsonc` | Worker `al-nasr-furniture-staging`. It is served on `workers.dev` only and has no routes or custom domain. Uses `nodejs_compat`, Static Assets, Images binding, self-reference service binding, observability logs, and non-secret rate-limit vars |
| `open-next.config.ts` | OpenNext config. Uses the read-only **static-assets incremental cache**, so no paid storage is needed |
| `cloudflare/staging/worker.mjs` | Staging wrapper around the unmodified OpenNext worker. It adds:<ul><li>HTTP Basic Auth (fails closed);</li><li>`X-Forwarded-For` overwritten with `CF-Connecting-IP`, which closes the rate-limit bypass;</li><li>`X-Robots-Tag: noindex`.</li></ul> |
| `cloudflare/staging/_headers` | Security headers + `noindex` for static files; immutable cache for `/_next/static/*` |
| `cloudflare/staging/build.env` | Public build-time values. Indexing off, WhatsApp/e-mail empty ("PENDING"), consent version `STAGING-TEST` |
| `cloudflare/staging/build.sh` | `opennextjs-cloudflare build` with the staging env, then copies `_headers` |
| `cloudflare/staging/smoke-test.mjs` | Automated checks covering access control, every sitemap page, locale redirects, catalog 308 redirects, 404s, headers, AVIF/WebP, RFQ validation and the spoofed-IP rate-limit test |
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

## How to deploy or re-deploy yourself (macOS / Linux / WSL)
```bash
git checkout deployment/cloudflare-staging && npm ci
```
```bash
sed -i.bak 's/CHANGE-ME-SUBDOMAIN/<your-subdomain>/' cloudflare/staging/build.env
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
- No payment method is needed for any of the above. If Cloudflare ever asks for a card to "continue", stop and ask before entering one.
