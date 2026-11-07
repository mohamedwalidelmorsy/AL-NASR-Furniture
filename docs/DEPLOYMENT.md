# Configuration, deployment and launch blockers

Nothing has been pushed or deployed. All work is local; git history starts at the first commit of this app.

## Environment variables

Copy `.env.example` → `.env.local` (dev) or set them in the host (prod). Never commit real values.

| Variable | Scope | Purpose | If unset |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Canonical origin (no trailing slash) for canonicals, hreflang, sitemap, OG, WhatsApp product links | `http://localhost:3000` — **must be set in production** |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | public | Digits incl. country code (`201XXXXXXXXX`) | WhatsApp controls show "PENDING" and explain via toast |
| `NEXT_PUBLIC_SALES_EMAIL` | public | E-mail shown on contact page/footer | shows "PENDING" |
| `NEXT_PUBLIC_CONSENT_TEXT_VERSION` | public | Version label stored with each RFQ's consent | `PENDING` |
| `NEXT_PUBLIC_ALLOW_INDEXING` | public | `true` lifts `robots.txt` disallow + `noindex` | **indexing blocked** |
| `RESEND_API_KEY`, `RFQ_TO_EMAIL`, `RFQ_FROM_EMAIL` | **server only** | RFQ notification via Resend | `POST /api/rfq` → `503 not_configured`; the form says "Request not sent" and keeps the buyer's data |
| `RFQ_RATE_LIMIT_MAX` / `_WINDOW_SECONDS` | server | Per-IP limit (default 5 per 600 s) | defaults |

`NEXT_PUBLIC_*` values are inlined at **build** time — rebuild after changing them. No secret is ever referenced from client code (`server-only` guards the delivery module).

## RFQ delivery

`POST /api/rfq` pipeline: same-origin check → JSON content-type → per-IP rate limit → 64 KB body cap → Zod validation (shared with the browser) →
honeypot (`website`) → items must exist in the catalog → delivery configured? → send → `{ reference }`.
Statuses: 200 ok · 400 invalid JSON/honeypot · 403 cross-origin · 413 · 415 · 422 validation · 429 (+`Retry-After`) · 502 provider failed · **503 not configured**.
Logs contain only event name, reference and provider status code — no names, e-mails, phones or message text (asserted by a test).

To go live: create a Resend account → verify the sending domain → set the three server variables → submit one real test request.
To use another provider (SMTP, CRM, queue) implement `RfqDelivery` (`src/features/rfq/server/delivery.ts`) and return it from `getDelivery()`.
The in-memory limiter (`src/lib/rate-limit.ts`) is per server instance: on serverless/multi-instance hosting swap it for a shared store (e.g. Upstash Redis) behind the same `check(key)` interface.

## Deploying

Standard Next.js: `npm run build && npm start` on Node ≥ 20 (developed on Node 26), or any Next-compatible host (Vercel, a Node container, …).
All content pages are statically generated (the build reports 70 static pages); only `/api/rfq` and the unknown-URL 404 route render on demand.
Pre-launch checklist: set `NEXT_PUBLIC_SITE_URL` → set WhatsApp/e-mail → configure Resend → add privacy text → confirm catalog content → set `NEXT_PUBLIC_ALLOW_INDEXING=true` → rebuild → submit `sitemap.xml`.

## Catalog images — import status

**Imported: 36 of 94** (18 products, AR + EN variant each). **Remaining: 58**, listed by `npm run catalog:import`.
Authenticated Drive read access exists in the Claude Code session (one file's metadata was verified against the inventory: ID and byte size match),
but streaming ~212 MB of PNGs through the assistant is impractical, so the import is a reproducible local script:

```bash
GOOGLE_DRIVE_ACCESS_TOKEN=$(gcloud auth print-access-token --scopes=https://www.googleapis.com/auth/drive.readonly) \
  npm run catalog:import -- --download --convert        # all 94, or add --only=img-id,img-id
```
Required permission: Google account that can open folder `1K6J5ucRbYKr1anMzRVLHQTcQ9o4aIdsE`, scope `drive.readonly` (read-only; nothing is written to Drive).
The script verifies PNG signature, byte size against the inventory and dimensions, records SHA-256, converts to 640/1400 WebP, and writes `data/catalog-import/import-report.json`.
Importing files does **not** publish products — add records to `src/data/catalog/products.json` after the business decisions below.

## Launch blockers

**Business data (cannot be invented):**
1. WhatsApp number, sales e-mail, production domain, social URLs, final logo artwork.
2. Official English entity name (the "Al Nasr for Import & Export" spelling is a placeholder), commercial-registration/tax numbers.
3. **Privacy notice text** and RFQ **consent text + version** (the privacy page and consent line currently say "pending").
4. Real collections: names, codes, pieces, dimensions, materials, photos. Today all 18 products are **AI-generated posters with unverified embedded text** (materials, dimensions, "Made in Egypt") — decide whether they may be shown as product imagery; the "Illustrative design" labels and notice must stay until replaced.
5. Classification decision for the remaining 58 images (folder vs visual; corner-vs-living folders are inconsistent) and verification of Arabic product names that were transcribed at low resolution.
6. Which delivery/payment terms apply per market; file-sharing channel for custom drawings; partner names/imagery (with permission).

**Technical:**
7. E-mail provider credentials (RFQ is disabled until configured — by design).
8. Shared-store rate limiting if hosted on multiple instances.
9. Core Web Vitals / Lighthouse and real-device testing on the deployed site — not measured yet (only local Chromium runs were executed).
