# 03 — Cost and Traffic Analysis

**Date:** 2026-11-24 · **FX:** €1 = $1.0963 (ECB, 24 Nov 2026 [S40]); $1 = 54.3094 EGP (CBE sell, 24 Nov 2026 [S41]).
These are **planning scenarios, not traffic measurements**. Every assumption is labelled. No VAT/sales tax is included (see §6).

---

## 1. Inputs

### Measured [M] (headless Chromium vs. the production build; see 01 §6)
- **4-page visit** (land on `/en`, then click to `/en/collections` → `/en/collections/bedrooms` → a product page), cold cache:
  - **946 KB transferred**.
  - **99 requests**: 1 HTML document (21 KB), 51 RSC / prefetch requests (180 KB), 20 optimized images (218 KB), 27 static JS/CSS/font files (527 KB).
- First-view weight of a single page: 686–760 KB, of which images 52–133 KB and JS 283–302 KB.
- Requests that hit the server or Worker (not static files): **≈ 72 per visit** (HTML + RSC + `/_next/image`).
- Image source set: 297 WebP files. Configured widths = 6 `deviceSizes` + 5 `imageSizes` = **11**. Maximum distinct (image × width) pairs = **3,267**.

### Assumptions [A]
- A1: average visit = the measured 4-page visit (B2B catalog browsing).
- A2: visitors = visits (no repeat-visit cache savings). This is conservative.
- A3: bots, crawlers, monitoring and previews add **+30%** to bytes and requests.
- A4: traffic is evenly spread across the month; the **peak day = 3× the average day**.
- A5: about 4 production deploys per month.
- A6: average server CPU per Worker request ≈ 10 ms. This is the upper end of what Cloudflare cites for SSR workloads (10–20 ms) [S1]; most of our requests are pre-rendered, so this is an over-estimate.
- A7: always-on Node process: 0.4 GB memory, 0.02 vCPU average (from the measured 390 MB RSS; CPU figure assumed).

## 2. Traffic scenarios (derived from the inputs)

| | A. Launch | B. Early growth | C. Established |
|---|---|---|---|
| Monthly visitors | 1,000 | 10,000 | 50,000 |
| **Data transfer / month** (946 KB × visits × 1.3) | **1.2 GB** | **12 GB** | **60 GB** |
| Server/Worker requests / month (72 × visits × 1.3) | 94k | 936k | 4.68M |
| Average requests / day | 3.1k | 31k | 156k |
| Peak-day requests (×3) | 9.4k | **94k** | 468k |
| Distinct image transformations / month | ≤ 3,267 (bounded by config, not traffic) | ≤ 3,267 | ≤ 3,267 |
| RFQ e-mails / month (assume 1% of visits submit) | ~10 | ~100 | ~500 |

**Important thresholds:**
- **Cloudflare Workers Free** allows 100k requests/day. Scenario B's peak day (94k) is close to that limit; Scenario C clearly needs **Workers Paid**.
- **Cloudflare Images Free** allows 5,000 unique transformations/month, and format/quality don't count toward uniqueness [S6]. Our maximum is 3,267, so we stay within it **as long as `deviceSizes`/`imageSizes` are not extended**.
- **Resend Free** allows 3,000 e-mails/month and 100/day [S10]. All scenarios fit.
- **Netlify Free** allows 300 credits/month. See §4.

## 3. Cost per provider and scenario (USD; original currency in brackets)

| Option | A (1k) / mo | B (10k) / mo | C (50k) / mo | Annual at A | Notes |
|---|---|---|---|---|---|
| **Cloudflare Workers Free** + Images Free + Resend Free | **$0** | **$0** (peak day near the cap) | **not viable** (exceeds 100k/day) | **$0** | No egress fees. Static asset requests free [S1] |
| **Cloudflare Workers Paid** | $5.00 | $5.00 | **$5.34** (4.68M req < 10M incl.; 46.8M CPU-ms → 16.8M over × $0.02/M) | $60.00 (EGP 3,259) | Images still free (≤ 3,267 unique) |
| **OVHcloud VPS-1** (4 GB) | **$4.54** | $4.54 | $4.54 | **$54.48** (EGP 2,959) | "From" price; commitment/EUR price **U** [S33]. Daily backup included |
| Netcup VPS Lite 1 (€4.92) | $5.39 | $5.39 | $5.39 | $64.73 (€59.04) | **6 months prepaid = €29.52 ($32.36) upfront** [S36] |
| IONOS VPS S+ (2 GB) | $6.00 | $6.00 | $6.00 | $72.00 | Monthly, no setup fee [S38] |
| Contabo Cloud VPS 4 | $5.28 (24-mo term) / $6.60 + setup fee (monthly) | same | same | $63.36–$79.20 | Setup fee amount **U** [S37] |
| Hetzner CX23 (€5.99) | $6.57 | $6.57 | $6.57 | $78.80 (€71.88) | **Not purchasable on 24 Nov 2026** [S34]; backups +≈€1.20 |
| Vultr 1 GB | $5.00 (+$1.00 backups) | same | same | $60–72 | Overage $0.01/GB beyond 1 TB, never reached [S39] |
| DigitalOcean 1 GiB | $6.00 (+$1.20 weekly backups) | same | same | $72–86.40 | [S43] |
| **Railway Hobby** | **$5.00** (usage ≈ $4.46 < $5 credit) | $5.00 (≈ $5.0) | **≈ $7.40** (egress 60 GB × $0.05 = $3.00) | $60 | Arithmetic from published unit rates [S19], A7 |
| Render 512 MB | $7.00 | $8.05 (7 GB × $0.15) | **$15.26** | $84 | 5 GB bandwidth included [S20] |
| Fly.io 1 GB | $6.72 | $6.94–8.14 | $7.90–13.91 | ≈$81 | Range = EU egress ($0.02) vs Africa/India egress ($0.12) [S22]; Frankfurt machine price **U** |
| Netlify Free | $0 (103 credits) | **paused: 487 credits > 300** | paused | $0 | Exceeding credits pauses **all** projects [S15] |
| Vercel Pro | $20 | $20+ | $20+ | $240 | Over budget [S11] |

### Hidden or extra costs checked

| Cost item | Cloudflare | VPS | Railway / Render / Fly |
|---|---|---|---|
| Domain | Already owned (Spaceship). No change | same | same |
| Bandwidth overage | None (no egress fees) [S1] | None within 1–20 TB included | Render $0.15/GB after 5 GB; Railway $0.05/GB; Fly $0.02–0.12/GB |
| Image optimization | Images Free ≤ 5k unique/mo [S6]. Beyond 5k on Free, **new** transforms fail with error 9422 (no charge); Paid $0.50/1k | CPU on the box (sharp). No fee | CPU/RAM on the instance |
| Builds | Free if built in GitHub Actions (public/private minutes apply) or Workers Builds (U) | Build off-box (laptop/CI) or on 4 GB boxes | Render 500 build-min incl.; Railway in usage |
| Backups | Not needed (stateless; Git is the source of truth) | OVH daily included; others +20–30% | Not needed |
| TLS certificates | Free (Universal SSL) | Free (Let's Encrypt) | Free |
| Rate limiting | WAF Free: 1 rule (path + IP, 10 s window) [S7] → $0 | In-process limiter works → $0 | Works on 1 instance → $0 |
| E-mail (Resend) | Free 3,000/mo | same | same |
| Monitoring | Workers Logs Free 200k events/day, 3-day retention [S2] | Self-installed / free uptime checker | Platform logs |
| Setup / upfront | $0 | Netcup €29.52 upfront (6 mo); Contabo setup fee on monthly plans | $0 |

## 4. Free-tier verdicts

| Free option | Commercial OK? | Survives A? | Survives B? | Survives C? | Verdict |
|---|---|---|---|---|---|
| Cloudflare Workers Free | Yes [S3] | Yes | Yes (thin margin on peak days) | No → upgrade to $5 Paid | **Usable**, with a clear $5 upgrade trigger |
| Netlify Free | Yes [S16] | Yes | **No** (pauses) | No | Not suitable |
| Vercel Hobby | **No** [S12] | — | — | — | Excluded |
| Render Free | Production use disallowed [S21] | — | — | — | Excluded |
| Oracle Always Free | Not prohibited (U) | Yes | Yes | Yes | Excluded: no SLA, idle reclamation [S47] |

## 5. First-year totals (owner's budget view)

| Option | First year | Renewal year | Minimum payment commitment |
|---|---|---|---|
| Cloudflare Workers Free → Paid only if needed | **$0 – $60** | same | none (Paid is monthly, cancel anytime) |
| OVHcloud VPS-1 | ≈ $54.48 (U: confirm term) | same (no promo detected) | possibly 1–12 months (U) |
| Netcup VPS Lite 1 | €59.04 ≈ $64.73 | same | 6 months prepaid |
| Railway Hobby | $60 (A/B) – ≈$89 (C) | same | monthly |
| IONOS VPS S+ | $72 | same (US page, U for EU) | monthly |

## 6. Taxes
- EU providers (OVH, Netcup, Hetzner) show prices **excluding VAT**. For non-EU business buyers, EU VAT is normally not charged (U).
- US-based providers may add sales tax depending on the buyer's location.
- **Egyptian VAT on imported digital services is not verified.** The company's accountant should confirm this before any budget sign-off.
- All figures above are **before any tax**.
