# 06 — Final Recommendation (for owner approval)

**Date:** 2026-11-24 · Status: **recommendation only.** Nothing has been purchased, deployed, or changed in DNS or code.

---

## 1. Category winners

| Category | Recommendation | Monthly | Annual | Why |
|---|---|---|---|---|
| Best free / near-free | **Cloudflare Workers Free + OpenNext** | $0 | $0 | Commercial use allowed [S3]; app builds and runs unchanged in workerd [M]; edge PoPs in Egypt, KSA, UAE and Iraq [S9] |
| Best low-cost VPS | **OVHcloud VPS-1** (2 vCore / 4 GB / 40 GB NVMe), Frankfurt | from $4.54 (verify at checkout) | ≈ $54.48 | 4 GB RAM, daily backup and a 99.9% SLA included [S33]. Hetzner CX23 would tie but was **out of stock** [S34] |
| Best managed hosting | **Railway Hobby** | $5 → ≈ $7.40 at 50k visitors | $60–89 | Runs `next start` unchanged, git deploys, inside budget at launch [S19] |
| **Best overall today** | **Cloudflare Workers + OpenNext: start on Workers Free, upgrade to Workers Paid ($5) on the triggers in §3** | **$0 → $5** | **$0 → $60** | Highest weighted score (8.48). Lowest cost, best MENA delivery, no servers to maintain |
| Fallback if the primary fails | **OVHcloud VPS-1 + Nginx + systemd** (DNS stays at Spaceship) | $4.54 | ≈ $54.48 | Runs the measured build exactly. No DNS migration. Rate limiter works as written |

## 2. Overall winner — details

- **Provider:** Cloudflare, Inc.
- **Plans:**
  - Cloudflare **Free** zone plan (DNS, CDN, TLS, WAF), plus
  - **Workers Free** (100k requests/day, 10 ms CPU), with a pre-approved upgrade to **Workers Paid: $5.00/month** (10M requests + 30M CPU-ms included) [S1];
  - **Cloudflare Images Free** via the Workers `IMAGES` binding (5,000 unique transformations/month; our maximum is 3,267) [S6].
- **Email:** Resend **Free** (3,000 emails/month, 100/day) [S10].
- **Region:** none to choose. Requests are served from the nearest PoP: Cairo, Riyadh, Jeddah, Dammam, Dubai, six Iraqi cities, Europe. Libya is served from nearby PoPs such as Tunis, Cairo or Palermo; which one is not verified [S9].
- **CPU / RAM / storage:**
  - 128 MB memory per isolate; 10 ms CPU per request (Free) or 30 s default (Paid);
  - worker bundle 8.0 MiB raw / **1.55 MiB gzip**, against a 64 MiB limit [M][S2];
  - static assets: 342 files, 28 MB, against limits of 20,000 files and 25 MiB per file.
- **Cost:**
  - Scenarios A and B: **$0/month, $0/year**.
  - Scenario C, or if the triggers fire: **$5.00–5.34/month ≈ $60–64/year** (≈ EGP 3,259–3,480 at 54.3094).
  - No setup fee, no commitment, no egress charges.
- **Sign-up:** https://dash.cloudflare.com/sign-up · Plans: https://www.cloudflare.com/plans/ · Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- **Compatibility evidence:**
  - OpenNext docs: "All minor and patch versions of Next.js 16" are supported, and `proxy.ts` / Node middleware has been experimental since 1.20.3 [S4].
  - npm: `@opennextjs/cloudflare@1.20.18` (2026-11-20) has peer dependency `next >=16.4.5` [S5].
  - Measured in this research [M], on a scratch copy:
    - `opennextjs-cloudflare build` → 138/138 pages;
    - `wrangler dev` → `/`→`/en` 307, pages 200, unknown URL 404;
    - security headers present;
    - `/_next/image` returned AVIF (16.6 KB) or WebP (37.5 KB);
    - RFQ returned 422 (validation), 403 (cross-origin) and 429 (rate limit).
- **Required code changes:**
  - **None to application logic.**
  - Add deployment config:
    - `wrangler.jsonc`;
    - `open-next.config.ts`;
    - `public/_headers`;
    - two devDependencies;
    - deploy scripts.
  - Optional: a 1-line `clientKey()` change to prefer `CF-Connecting-IP` (04 §A).
- **Deployment prerequisites:**
  1. Cloudflare account (international card **not** required for Free; required for Paid).
  2. Resend account with the domain verified (`send.` + `resend._domainkey` records).
  3. Production values for all `NEXT_PUBLIC_*` variables, plus Resend secrets set with `wrangler secret put`.
  4. Linux build environment (GitHub Actions or Cloudflare Workers Builds). OpenNext does not fully support Windows builds [S4].
  5. Spacemail records copied into Cloudflare **before** changing nameservers (04, DNS section).
- **Known limitations:**
  - OpenNext's Node middleware support is experimental.
  - Free plan's 10 ms CPU limit is not yet measured on the real edge.
  - The in-memory rate limiter is per isolate, so add the WAF rule `/api/rfq`, IP, 10 s (Free plan allows one rule) [S7].
  - `next.config` `headers()` don't apply to static files, so mirror them in `public/_headers`.
  - Free services can be terminated at Cloudflare's discretion (§2.6) and have no SLA [S3].
  - Images beyond 5,000 unique transforms would fail (error 9422) if `deviceSizes`/`imageSizes` were expanded.
- **Remaining launch blockers** (not hosting-related; 01 §9):
  - WhatsApp number, sales email, Resend credentials;
  - privacy and consent text;
  - About image, logo, registration details;
  - kids-room-8 photo confirmation;
  - production `NEXT_PUBLIC_SITE_URL`;
  - `NEXT_PUBLIC_ALLOW_INDEXING=true` at launch;
  - Lighthouse on the deployed site;
  - `X-Forwarded-For` spoofing fix (or WAF rule).
- **Operational responsibilities:**
  - Keep Next.js, OpenNext and Wrangler versions compatible.
  - Check Workers analytics monthly (requests/day, CPU errors, Images usage).
  - Rotate the Resend key if it leaks.
  - Re-test RFQ delivery after each deploy.
  - Watch the Spacemail mail flow after the DNS move.

## 3. Upgrade triggers (from Free to Workers Paid $5, or beyond)

| Trigger | Action |
|---|---|
| Any `Error 1102 / exceeded CPU` or `1027 / daily limit` in Workers logs, or average > ~60k requests/day | Upgrade to **Workers Paid ($5)** |
| Monthly unique image transformations > 4,000 | Keep widths fixed, or enable Images Paid ($0.50 per 1k beyond 5k) |
| RFQ > 100/day or > 3,000/month | Resend Pro $20/month (good problem to have) |
| Need for an uptime SLA / contractual support | Cloudflare Pro or Business plans (outside this budget), or move to a VPS with SLA |
| OpenNext breaks on a Next.js upgrade | Pin Next to the last OpenNext-supported version, or switch to the fallback VPS (app runs unchanged) |

## 4. Decision gate: proof of concept before any DNS change ($0, ~half a day)

The two unverified risks (experimental `proxy.ts` on the real edge, and 10 ms CPU on Free) can be tested **without touching DNS or email**:

1. Deploy the OpenNext build to a free `*.workers.dev` subdomain, with indexing still off.
2. Check:
   - `/` → `/en`, both locales, 10 product pages, the 404 page;
   - AVIF images;
   - one real RFQ through Resend (sandbox `onboarding@resend.dev` sender);
   - Workers Observability: CPU time p50/p99 per request type.
3. **Pass** = no errors, and CPU p99 under 10 ms. Then launch on Free.
   **CPU over 10 ms but otherwise fine:** launch on Workers Paid ($5).
   **Proxy or routing failures:** use the fallback OVH VPS-1.
4. Only after a pass: migrate DNS (Spacemail records first), attach the custom domain, set `NEXT_PUBLIC_SITE_URL`, rebuild.

## 5. $0 option vs a $5–7 VPS: engineering-cost comparison

| | Cloudflare Workers | OVH VPS-1 |
|---|---|---|
| One-time setup | ~4–6 h (OpenNext config, CI, PoC, DNS move with Spacemail records) | ~4–6 h (OS hardening, Node, Nginx, TLS, systemd, CI deploy) |
| Recurring maintenance | ~0.5 h/month (dependency compatibility, usage check) | ~1–2 h/month (OS patches, Node/Nginx updates, monitoring, disk) |
| Cash cost, year 1 | $0–60 | ≈ $54 + possible VAT |
| Risk profile | Platform/adapter risk (experimental proxy) | Operator risk (security patches, single server) |

The changes the $0 option needs are **configuration, not risky code changes**, and its recurring maintenance is lower. So it is economically sensible as well as cheapest. That holds only if the §4 proof of concept passes; otherwise the VPS is the right answer.

## 6. Conditions that would change this recommendation

- Owner rejects moving DNS to Cloudflare → choose the **OVH VPS-1 fallback** (DNS stays at Spaceship).
- A contractual SLA is required → VPS with SLA (OVH 99.9%), or paid Cloudflare plans.
- Sustained traffic well beyond Scenario C (> 10M Worker requests/month) → Workers Paid usage ($0.30 per extra million), still cheap.
- Future features needing a database, user accounts or a CMS → reassess (D1/R2 on Cloudflare, or a larger VPS).

## Owner approval needed for

1. Creating a Cloudflare account and running the `workers.dev` proof of concept (no DNS change).
2. After the PoC passes: moving nameservers from Spaceship to Cloudflare, with all Spacemail records recreated first.
3. Pre-approving the $5/month Workers Paid upgrade if the triggers in §3 fire.
4. Creating a Resend account and verifying the domain.
