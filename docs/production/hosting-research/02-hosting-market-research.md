# 02 — Hosting Market Research (22 providers / plans)

**Research date:** 2026-11-24. Prices are as published on that date, in the original currency. Source IDs like `[S12]` point to `07-sources-and-verification.md`.
**Tags:** **V** = verified on the provider's official page or docs · **U** = unverified (third-party, search snippet or inference) · **M** = measured by me in this research.
**FX (dated):** €1 = **$1.0963** (ECB reference rate, 24 Nov 2026 [S40]) · $1 = **54.3094 EGP** (Central Bank of Egypt sell rate, 24 Nov 2026 [S41]).

---

## 1. Edge / serverless platforms

| Provider · plan | Price | Commercial use | Runs this app? | Key limits | Regions near target markets | Status |
|---|---|---|---|---|---|---|
| **Cloudflare Workers Free** + OpenNext | **$0** | **Allowed.** The Self-Serve Subscription Agreement has no non-commercial clause; the only free-plan restriction is "no card processing" (§2.2.1(h)) [S3] V | **Yes, with deployment-only config (no app code change).** Built and run in local workerd [M] | 100k requests/day; **10 ms CPU per request**; 128 MB/isolate; 64 MiB worker uncompressed (ours 8.0 MiB raw / 1.55 MiB gzip [M]); static-asset requests free and unlimited; no egress fees [S1][S2] V | Cloudflare PoPs: **Cairo; Riyadh, Jeddah, Dammam; Dubai; Baghdad, Basra, Erbil, Najaf, Nasiriyah, Sulaymaniyah**; none in Libya (nearest Tunis, Cairo, Algiers, Palermo, Athens) [S9] V | **Shortlisted** |
| **Cloudflare Workers Paid** | **$5/mo** minimum (10M requests, 30M CPU-ms included; then $0.30/M requests, $0.02/M CPU-ms) [S1] V | Yes | Same | CPU 30 s default (up to 5 min); 10,000 subrequests [S2] V | Same | **Shortlisted** (upgrade path) |
| Cloudflare Pages | $0 | Yes | Not the recommended target: OpenNext targets Workers; Pages lacks the Images and rate-limit bindings [S8] V | — | Same | Not shortlisted |
| **Vercel Hobby** | $0 | **Prohibited:** *"You shall only use the Services under a Hobby plan for your personal or non-commercial use."* (Terms §4) [S12] V | Native | 100 GB transfer, 5k image transformations [S13] V | No Middle East region (fra1, bom1, cpt1 nearest) [S14] V | **Hard-rejected** (commercial use) |
| Vercel Pro | $20/mo (+$20 usage credit) [S11] V | Yes | Native | Image transformations $0.05/1k after included [S11] V | Same | Rejected (≈3× budget) |
| **Netlify Free** (credit plan) | $0, 300 credits/mo [S15] V | Allowed ("you can deploy commercial projects", 2024 blog) [S16] V; not re-checked in current agreement (U) | Yes via OpenNext-based adapter (Next ≥13.5; Next 16 not named) [S17] V | Bandwidth 20 credits/GB, deploy 15 credits, requests 2 credits/10k. When credits run out **every project on the account is paused** until the next cycle [S15][S18] V | Global CDN; function region custom only on Pro [S15] V | Not shortlisted (fails Scenario B, see 03) |
| Netlify Personal | $9/mo [S15] V | Yes | Same | 1,000 credits | — | Rejected (over budget) |
| **Google Cloud Run** | Free tier (180k vCPU-s, 360k GiB-s, 2M requests), then usage [S24] V | Yes | Yes (container, `next start`) | Scale-to-zero cold starts; keeping 1 min-instance warm ≈ $9.7/mo (U, arithmetic); internet egress at VPC rates, free tier only 1 GiB North America [S24] V | **me-central1 Doha, me-central2 Dammam** (Tier-2 pricing), me-west1 Tel Aviv [S24] V | Not shortlisted: unpredictable egress; custom-domain mapping may need a paid load balancer (U) |
| AWS Amplify Hosting | Free 12 months, then usage [S26] V | Yes | **No:** SSR supported for "Next.js versions 12 through 15" only [S25] V | — | — | **Hard-rejected** (Next 16 unsupported) |
| Firebase App Hosting | Blaze pay-as-you-go [S27] V | Yes | **Next 16 = "preview"** (newest "active" is 15.2.x) [S28] V | — | Cloud Run regions | **Hard-rejected** (Next 16 not supported) |

## 2. Managed container / PaaS

| Provider · plan | Price | Commercial use | Runs this app? | Key limits | Regions | Status |
|---|---|---|---|---|---|---|
| **Railway Hobby** | **$5/mo** subscription including $5 of usage; memory $0.00000386/GB·s, CPU $0.00000772/vCPU·s, egress **$0.05/GB** [S19] V ($5 subscription price from docs snippet, U) | Not prohibited on pricing page; Hobby described as for "personal projects" (U, check ToS) | **Yes, unchanged** (`next start`) | Always on; up to 6 replicas; 2 custom domains; credit card only [S19] V | EU West / Amsterdam (U); no Middle East | **Shortlisted** |
| Railway Free | $1 credit | — | — | **Custom domains "Trial only"**, sleeps after 5–10 min [S19] V | — | Rejected |
| **Render** paid 0.5 CPU / 512 MB | **$7/mo** + Hobby workspace $0 [S20] V | Not prohibited (Hobby "for individuals building personal projects", U) | Yes, unchanged; **512 MB vs 390 MB measured RSS = tight** [M] | Only **5 GB bandwidth**, then **$0.15/GB** [S20] V | Frankfurt (U) | Not shortlisted (bandwidth overage; tight RAM) |
| Render Free | $0 | **Docs:** *"Do not use them for production applications."* Spins down after 15 min, ~1 min wake [S21] V | — | — | — | **Hard-rejected** (production use disallowed) |
| **Fly.io** shared-cpu-1x | 512 MB **$3.69**, 1 GB **$6.70**/mo (iad/ewr prices; other regions may differ); egress $0.02/GB NA+EU, **$0.12/GB Africa & India**; dedicated IPv4 $2 optional [S22] V | Yes | Yes (needs a Dockerfile, which doesn't exist yet) | No free compute allowance for new orgs [S22] V | **No Middle East region**; fra/cdg/ams/lhr [S22] V | Not shortlisted (needs Docker; Frankfurt price unverified) |
| Koyeb | Free: 0.1 vCPU / 512 MB, **card with $29 pre-authorization hold**; paid Pro $29/mo [S23] V | Not stated | Too weak (0.1 vCPU) | — | Frankfurt, Washington | Rejected (unusable free tier; paid far over budget) |
| DigitalOcean App Platform | **$5/mo** fixed 1 vCPU / **512 MiB**, 50 GiB transfer, then $0.02/GiB [S29] V | Yes | Yes, but **512 MiB tight** [M] | Static free tier cannot run proxy/route handler | FRA/AMS/LON (U) | Not shortlisted (RAM) |
| Hostinger "Web Apps Hosting" Unlimited | **$2.79/mo promo = $133.92 prepaid for 48 months, renews at $16.99/mo** [S30] V | Yes | Next.js listed as supported (V); process model U | "Unlimited" under fair use | No Middle East | **Hard-rejected** (renewal price invalidates the advertised price) |
| Spaceship Web Hosting (cPanel) | Essential **$19.88 first year → $28.88/yr renewal** (1 CPU / 1 GB burst) [S31] V | Yes | **Unverified:** cPanel "Setup Node.js App" (Passenger, Node 6–24) [S32] V; Next 16 + sharp under CloudLinux limits untested | "Resource limits are for burst allowance … only for a limited time" (AUP, V) | US, EU, UK, Singapore | Not shortlisted (unverified fit, burst-limited) |
| Spaceship Starlight Hyperlift | ~$0.005/h ≈ $3.60/mo (U) | Yes | Needs Dockerfile | Micro 0.25 vCPU / 0.5 GB (third-party, U) | U | Not shortlisted (unverified, 512 MB) |

## 3. VPS (self-managed Node.js + Nginx)

Sizing from measurement: `next-server` ≈ **390 MB RSS** [M], so 1 GB is workable with swap and builds done off-box. 2–4 GB is comfortable.

| Provider · plan | vCPU / RAM / disk | Price / month | Traffic | Backups | Term / fees | Locations (nearest) | SLA | Status |
|---|---|---|---|---|---|---|---|---|
| **OVHcloud VPS-1** (2027 range) | 2 / **4 GB** / 40 GB NVMe | **"From $4.54"** (USD page; EUR price and whether a commitment is required: **U**) [S33] V | Unlimited, 500 Mbps (APAC 500 GB cap) | **Daily backup included** | Installation free (US site, snippet) | FR (Gravelines/Roubaix/Strasbourg), **Frankfurt**, Warsaw, London, Mumbai (list partly U) | **99.9%** V | **Shortlisted** (best value; verify the price at checkout) |
| Hetzner CX23 (Cost-Optimized) | 2 / 4 GB / 40 GB | **€5.99 excl. VAT** (incl. IPv4) [S34] V | 20 TB, €1/TB over | +≈20% (from €1.098) | Hourly, monthly cap | Nuremberg, Helsinki (no Middle East) | 99.9% | **Hard-rejected today: "currently unavailable"** on 24 Nov 2026 [S34] V. Re-check later; sign-up ID checks have rejected some Middle East applicants (anecdotal, U) |
| Hetzner CPX02 | 1 / 1 GB / 20 GB | €5.49 (HEL1) / €6.49 (FSN1/NBG1) excl. VAT [S35] V | 20 TB | as above | Hourly | FSN/NBG/HEL | 99.9% | Not shortlisted (1 GB tight) |
| **Netcup VPS Lite 1 G12.5s** | 2 / 4 GB / 80 GB | **€4.92 net** [S36] V | Included, "reduced bandwidth" | Snapshots included | **6-month contract** | Nuremberg / Vienna / Amsterdam, assigned (no choice) | **None for VPS** (V) | **Shortlisted** (cheapest 4 GB) |
| Netcup VPS pico | 1 / 1 GB / 30 GB | €1.85 net, 12-month contract [S36] V | Included | Snapshots | 12 months | Nuremberg only | None | Not shortlisted (1 GB) |
| Contabo Cloud VPS 4 | 4 / 8 GB / 100 GB SSD | **$5.28** effective on a 24-month term; **$6.60** monthly + one-time setup fee (amount U) [S37] V | "Unlimited" fair use, 200 Mbit/s | 1 snapshot; auto-backup paid | 1 month min | Germany / Lauterbourg; UK; no Middle East | 99.9% (marketing) | Scored, not top 5 |
| IONOS VPS S+ | 1 / 2 GB / 60 GB NVMe | **$6.00** (US site; EU price may differ) [S38] V | Unlimited, 1 Gbps | Cloud Backup from $0.065/GB | Cancel anytime, no setup fee | US, UK, **Germany**, Spain | 99.99% (claim) | **Shortlisted** (only provider with an explicit "commercial purposes" statement) |
| Vultr Regular Cloud Compute | 1 / 1 GB / 25 GB | **$5.00** [S39] V | 1 TB, then $0.01/GB | +20% ($1) | Hourly | **Milan**, Frankfurt, Tel Aviv, Mumbai… (per-location prices may differ) | 100% (network + host) | Scored (1 GB tight) |
| Akamai/Linode Nanode | 1 / 1 GB / 25 GB | $5.00 (NA price; **EU regions priced differently**, U) [S42] V | 1 TB, then $0.005/GB | not captured | Hourly | Frankfurt, Milan, Paris… | not checked | Not shortlisted |
| DigitalOcean Basic Droplet | 1 / 1 GiB / 25 GiB | **$6.00** [S43] V | 1,000 GiB | +20% weekly ($1.20) / +30% daily ($1.80) | Per-second, monthly cap; **PayPal accepted** | Frankfurt, Amsterdam, London | not checked | Scored (1 GB tight) |
| AWS Lightsail | 2 / 1 GB / 40 GB | **$7.00** with IPv4 ($5 = IPv6-only) [S44] V | 2 TB; overage from $0.09/GB | Snapshots $0.05/GB-mo | Hourly | Frankfurt, Paris, Mumbai; **no Bahrain/UAE in Lightsail** [S44] V | not checked | Not shortlisted (1 GB at the budget ceiling) |
| Hostinger VPS KVM 1 | 1 / 4 GB / 50 GB | **$6.49 promo = $155.76 prepaid for 24 months → renews $11.99/mo** [S45] V | 4 TB | Weekly free | 24-month prepay | DE, FR, UK, LT, IN | not captured | **Hard-rejected** (renewal breaks budget) |
| Scaleway STARDUST1-S | 1 / 1 GB / (storage extra) | ≈€0.43 + **IPv4 ≈€3.65** + storage, excl. tax (≈€4–4.5 total, U) [S46] V | Included, 100 Mbps | — | Hourly | Paris | — | Not shortlisted (stock often limited, U; 1 GB) |
| Oracle Cloud Always Free (Ampere A1) | up to 2 OCPU / 12 GB / 200 GB | **$0** [S47] V | 10 TB | 5 volume backups | Card required (no prepaid/virtual) | **Jeddah, Riyadh, Dubai, Abu Dhabi**, Frankfurt (home region only) | **"Free Tier does not include SLAs"**; **idle instances may be reclaimed** [S47][S48] V | **Hard-rejected for production** (no SLA, reclamation, no support) |

## 4. Observations

1. **Only three options put compute inside the Gulf:** Oracle (free, but no SLA), Google Cloud Run (unpredictable cost) and AWS (Bahrain not in Lightsail; a 23 Nov 2026 AWS Health Dashboard snippet reported ME-SOUTH-1 unavailable, U). **Cloudflare is the only low-cost option with edge presence in Egypt, KSA, UAE and Iraq** [S9].
2. **All VPS and PaaS options in budget run in Europe.** Published ping Cairo → Frankfurt averages **≈56–60 ms** (WonderNetwork hourly samples, 10–24 Nov 2026) [S50] V. Baghdad → Frankfurt ≈70–80 ms and Dubai → Frankfurt ≈120 ms (WonderNetwork summaries, U precision) [S51][S52].
3. **Egypt sign-up/payment eligibility** is not stated on any provider page. All need an international card except DigitalOcean (also PayPal). OVHcloud's country selector lists Egypt, Libya, Iraq, KSA and UAE (V), which suggests but does not prove availability. **Treat this as unknown until the owner tries to sign up.**
4. **VAT:** EU providers list prices excluding VAT. For a non-EU business customer, EU VAT usually doesn't apply (U). Whether Egyptian VAT applies to imported digital services for this company is **unknown; the owner's accountant should confirm**. No VAT has been added to any figure in these documents.
