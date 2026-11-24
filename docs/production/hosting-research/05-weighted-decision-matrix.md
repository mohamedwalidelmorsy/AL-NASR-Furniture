# 05 — Weighted Decision Matrix

**Date:** 2026-11-24.
**Weights:** Total cost of ownership 35% · Technical compatibility 25% · Performance & regional delivery 15% · Reliability & security 10% · Operational simplicity 10% · Scalability & migration flexibility 5%.
Scores run 0–10. Evidence comes from 01–04; sources are in 07.

---

## Step 1 — Hard rejections (applied before scoring)

| Option | Rejection criterion | Evidence |
|---|---|---|
| Vercel Hobby | Commercial use prohibited | Terms §4: "personal or non-commercial use" [S12] |
| Render Free | Production use disallowed / unacceptable reliability | "Do not use them for production applications"; ~1 min wake [S21] |
| Railway Free | Essential feature unsupported | Custom domains "Trial only" [S19] |
| AWS Amplify Hosting | Essential feature unsupported | SSR supports Next.js 12–15 only [S25] |
| Firebase App Hosting | Essential feature unsupported | Next 16 is "preview" [S28] |
| Hetzner CX23 / CAX11 | Unavailable plan | "This product is currently unavailable" on 24 Nov 2026 [S34] |
| Oracle Always Free | Unacceptable production reliability | No SLA; idle instances reclaimable; no support [S47][S48] |
| Hostinger VPS KVM 1 / Web Apps | Hidden cost invalidates the advertised price | Promo requires 24–48-month prepay; renews at $11.99 / $16.99 [S30][S45] |
| Koyeb | Unusable free tier; paid $29/mo | 0.1 vCPU free instance, $29 card hold [S23] |
| DO App Platform static (free) | Essential features unsupported | No server for proxy / route handler [S29] |
| Static export + separate API (Arch. D) | Essential features unsupported without a rewrite | 01 §7 #5 |

Excluded on budget, not on hard criteria: Vercel Pro ($20), Netlify Personal ($9), Scaleway DEV1-S (≈€10), Google Cloud Run with a warm instance (≈$9.7, U).

## Step 2 — Scoring of the remaining candidates

| # | Option | Cost 35% | Tech 25% | Perf 15% | Rel/Sec 10% | Ops 10% | Scale 5% | **Weighted** |
|---|---|---|---|---|---|---|---|---|
| 1 | **Cloudflare Workers (Free → Paid $5) + OpenNext** | 9.5 | 7 | 10 | 7 | 8 | 8 | **8.48** |
| 2 | **OVHcloud VPS-1 + Nginx** | 8 | 10 | 6.5 | 7 | 4 | 6 | **7.68** |
| 3 | **Netcup VPS Lite 1 + Nginx** | 8 | 10 | 6.5 | 5 | 4 | 6 | **7.48** |
| 4 | **Railway Hobby** | 6.5 | 9 | 5.5 | 7 | 8 | 7 | **7.20** |
| 5 | **IONOS VPS S+ + Nginx** | 7 | 9 | 6.5 | 7 | 4 | 6 | **7.08** |
| 6 | Contabo Cloud VPS 4 | 7 | 10 | 6 | 5 | 4 | 6 | 7.05 |
| 7 | Vultr 1 GB (Milan/Frankfurt) | 8 | 7 | 6.5 | 8 | 4 | 6 | 7.03 |
| 8 | DigitalOcean 1 GiB Droplet | 7 | 7 | 6.5 | 8 | 4 | 6 | 6.68 |
| 9 | Netlify Free | 7 | 7 | 7 | 4 | 8 | 4 | 6.65 |
| 10 | Fly.io 1 GB | 6 | 8 | 5.5 | 7 | 6 | 8 | 6.63 |
| 11 | Render 512 MB | 5 | 7 | 5.5 | 7 | 8 | 7 | 6.18 |

Arithmetic check for #1: 0.35×9.5 + 0.25×7 + 0.15×10 + 0.10×7 + 0.10×8 + 0.05×8 = 3.325 + 1.75 + 1.5 + 0.7 + 0.8 + 0.4 = **8.475**.

## Step 3 — Score justifications

**1. Cloudflare Workers + OpenNext**
- **Cost 9.5:** $0 in Scenarios A and B and $5.34 in C (03 §3). No egress fees. Images stay inside the 5k free limit (max 3,267). Not 10, because of the likely $5 step-up.
- **Tech 7:**
  - Positive: the build succeeded, and in local workerd every route, the AVIF/WebP images, headers, the 307 locale redirect, 404 and the RFQ checks worked [M]. Next 16.4.5 is officially supported [S5].
  - Negative: `proxy.ts` uses OpenNext's **experimental** Node middleware [M][S4]. The Free plan's 10 ms CPU limit hasn't been measured on the real edge. The in-memory limiter needs the WAF rule.
- **Perf 10:** in-country PoPs in Egypt, KSA (3), UAE and Iraq (6); Libya is served from neighbouring PoPs [S9]. Static assets are served at the edge.
- **Rel/Sec 7:** Cloudflare DDoS protection and TLS. But the Free Services agreement allows termination at Cloudflare's discretion with no liability (§2.6) [S3], and there's no SLA on Free/Pay-as-you-go.
- **Ops 8:** no servers. One-time work: OpenNext build, CI and the DNS move.
- **Scale 8:** automatic scaling. App code stays portable.

**2. OVHcloud VPS-1**
- **Cost 8:** $4.54/month flat, daily backup included. The commitment term and the EUR price shown to Egyptian buyers are not verified (−2).
- **Tech 10:** runs `next start` exactly as measured. 4 GB RAM is ample (390 MB RSS) and allows building on the box.
- **Perf 6.5:** Europe-only origin. Cairo → Frankfurt ≈ 56–60 ms [S50]; the Gulf is farther.
- **Rel/Sec 7:** 99.9% SLA and anti-DDoS [S33], but a single server, and owner-managed patching.
- **Ops 4:** full system administration.
- **Scale 6:** vertical only.

**3. Netcup VPS Lite 1:** same technical profile as OVH. Cheaper RAM per euro, but **no availability guarantee** for VPS, "reduced bandwidth", a 6-month prepay and no choice of location (Rel 5) [S36].

**4. Railway Hobby**
- **Cost 6.5:** cost grows with traffic: $5 → ≈ $7.40 at Scenario C.
- **Tech 9:** runs unchanged. Hobby's commercial terms are unconfirmed (−1).
- **Perf 5.5:** EU region only, behind Railway's edge.
- **Ops 8:** managed git deploys.

**5. IONOS VPS S+:** $6 monthly with no commitment and an explicit commercial-use statement [S38]. 2 GB RAM is fine, but on-box builds are tighter (Tech 9). Germany data centre.

**6–11:**
- Contabo: unverified setup fee; slow 200 Mbit port.
- Vultr / DigitalOcean: 1 GB RAM is tight against the measured 390 MB plus build needs (Tech 7).
- Fly.io: needs a new Dockerfile; Africa egress at $0.12/GB.
- Netlify Free: the whole account pauses at Scenario B (Rel 4).
- Render: 5 GB bandwidth means $15.26 at Scenario C, and 512 MB RAM.

## Step 4 — Sensitivity check

- **If OpenNext's experimental proxy fails on the real edge**, option 1's Tech score drops to 3 and its total to ≈ 7.48. It then ties with Netcup and falls behind OVH (7.68). So the edge proof of concept (06 §4) is the deciding test, and **OVH VPS-1 is the fallback**.
- **If Workers Paid ($5) is needed from day one**, option 1's Cost drops to 8 and its total to ≈ 7.95. It still ranks first.
- **If OVH's $4.54 requires a 12-month commitment, or VAT applies**, OVH's Cost falls to 7 (≈ 7.33), and Netcup and IONOS move closer. The ranking of the top two doesn't change.

## Final shortlist (max 5)

1. **Cloudflare Workers + OpenNext** (Free at launch → Paid $5 at the trigger): 8.48
2. **OVHcloud VPS-1 + Nginx:** 7.68
3. **Netcup VPS Lite 1 + Nginx:** 7.48
4. **Railway Hobby:** 7.20
5. **IONOS VPS S+ + Nginx:** 7.08
