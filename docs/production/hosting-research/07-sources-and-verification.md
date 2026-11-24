# 07 — Sources and Verification Log

**Research window:** 2026-11-24 (pages fetched through Firecrawl; cache timestamps 2026-11-22 to 2026-11-24).
**Method:**
- Official pricing, docs and terms pages were read with Firecrawl scrape. Discovery used web search.
- Three parallel research passes (VPS, managed/PaaS, Cloudflare/DNS/email) were cross-checked against my own scrapes and measurements.
- Direct Web Fetch from the research workspace was blocked by its network policy, so Firecrawl was used instead.
- **No private source code, secrets or credentials were sent to any external service.** Only public URLs were fetched.

**Legend:**
- **V** = read on the official page.
- **U** = unverified (third party, search snippet, or inference).
- **M** = measured in this research.

---

## 1. Measurements performed (M)

| # | What | How | Result |
|---|---|---|---|
| M1 | Production build | `npm ci && npm run build`, Node 22.23.5, commit `f4352c9` | Exit 0; Next 16.4.5; **138 static pages**; dynamic: `/api/rfq`, `/[locale]/[...rest]`, Proxy |
| M2 | Asset inventory | `du`, `find` on `public/` | 26.2 MB, 297 WebP; 640 px avg 48 KB; 1400 px avg 123 KB; no file > 1 MB |
| M3 | Page weight | Playwright/Chromium + CDP `encodedDataLength`, desktop 1280 px and mobile 390 px | 686–760 KB per first view; JS 283–302 KB |
| M4 | 4-page visit | Same, with client-side navigation | 946 KB; 99 requests (1 doc, 51 RSC, 20 images, 27 static) |
| M5 | Server memory | `ps` RSS of `next-server` after M3 | ≈ 390 MB |
| M6 | OpenNext build | Scratch copy + `@opennextjs/cloudflare@1.20.18`, `wrangler@4.168.0` | Success; warning "Node.js middleware support is experimental" |
| M7 | Worker size | `wrangler deploy --dry-run` | 8,179.58 KiB / gzip 1,588.38 KiB |
| M8 | Runtime in workerd | `wrangler dev` + curl | 307 `/`→`/en`; 200 pages; 404; headers OK; `/_next/image` AVIF 16,581 B / WebP 37,492 B; RFQ 422 / 403 / 429 |

**Not measured:**
- Real Cloudflare edge deployment.
- CPU time per request on the edge.
- Real Resend delivery.
- Lighthouse / Core Web Vitals.
- Latency from MENA to any candidate host.

## 2. Source list

| ID | Claim(s) supported | URL | Status |
|---|---|---|---|
| S1 | Workers Free 100k req/day, 10 ms CPU; Paid $5, 10M req + 30M CPU-ms, overage $0.30/M + $0.02/M CPU-ms; static assets free; no egress fees; SSR typically 10–20 ms CPU | https://developers.cloudflare.com/workers/platform/pricing/ | V |
| S2 | Worker size 64 MiB (Free and Paid), 128 MB memory, asset limits, Workers Logs retention | https://developers.cloudflare.com/workers/platform/limits/ | V |
| S3 | Free services: no commercial-use ban; §2.2.1(h) card-data restriction; §2.6 termination | https://www.cloudflare.com/terms/ (Self-Serve Subscription Agreement, updated 12 Sep 2025) | V |
| S4 | OpenNext: Next 16 supported; proxy/Node middleware experimental since 1.20.3; config; Windows caveat; image binding | https://opennext.js.org/cloudflare · https://opennext.js.org/cloudflare/get-started · https://opennext.js.org/cloudflare/howtos/image | V (the "3 MiB / 10 MiB" worker size line on that page is **outdated** versus S2) |
| S5 | `@opennextjs/cloudflare` 1.20.18 (2026-11-20), peer `next >=16.4.5`; static-assets cache for SSG; `_headers` note | https://registry.npmjs.org/@opennextjs/cloudflare · https://opennext.js.org/cloudflare/caching | V |
| S6 | Images Free 5,000 unique transformations/month; error 9422 beyond; Paid $0.50/1k; format/quality excluded from uniqueness | https://developers.cloudflare.com/images/pricing/ | V (binding-counting wording on the binding page: U) |
| S7 | WAF rate limiting Free: 1 rule, IP, 10 s | https://developers.cloudflare.com/waf/rate-limiting-rules/ | V |
| S8 | Workers vs Pages matrix; Workers custom domains require a Cloudflare zone | https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/ | V |
| S9 | Cloudflare PoP cities (Cairo; Riyadh/Jeddah/Dammam; Dubai; 6 Iraqi cities; none in Libya) | https://www.cloudflare.com/network/ | V |
| S10 | Resend Free 3,000/mo, 100/day, 3 domains; DNS records on `send.` / `resend._domainkey`; ToS free tier | https://resend.com/pricing · https://resend.com/docs/knowledge-base/cloudflare.md · https://resend.com/legal/terms-of-service | V |
| S11 | Vercel Pro $20 + $20 credit; image transformation $0.05/1k | https://vercel.com/pricing | V |
| S12 | Vercel Hobby "personal or non-commercial use" | https://vercel.com/legal/terms (§4, updated 19 Oct 2026) | V |
| S13 | Vercel Hobby inclusions | https://vercel.com/docs/plans/hobby | V |
| S14 | Vercel regions (no Middle East) | https://vercel.com/docs/regions | V |
| S15 | Netlify plans, credits, account-wide pause | https://www.netlify.com/pricing/ | V |
| S16 | Netlify Free allows commercial projects (2024 blog) | https://www.netlify.com/blog/introducing-netlify-free-plan/ | V (current agreement not re-read: U) |
| S17 | Netlify Next.js adapter support and limitations | https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/ | V |
| S18 | Netlify credit consumption rates | https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/ | V |
| S19 | Railway Free/Hobby features and unit rates; egress $0.05/GB | https://railway.com/pricing | V ($5 Hobby subscription from docs snippet: U) |
| S20 | Render compute $7/512 MB; 5 GB bandwidth then $0.15/GB | https://render.com/pricing | V |
| S21 | Render Free "Do not use them for production applications" | https://render.com/docs/free | V |
| S22 | Fly.io machine prices, egress by region, regions list | https://docs.fly.io/about/pricing | V |
| S23 | Koyeb free instance, $29 hold, Pro $29 | https://www.koyeb.com/docs/faqs/pricing · https://www.koyeb.com/pricing | V |
| S24 | Cloud Run free tier, rates, Middle East tiers | https://cloud.google.com/run/pricing | V |
| S25 | Amplify SSR: Next.js 12–15 only | https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html | V |
| S26 | Amplify pricing | https://aws.amazon.com/amplify/pricing/ | V |
| S27 | Firebase App Hosting costs / Blaze | https://firebase.google.com/docs/app-hosting/costs | V |
| S28 | Firebase App Hosting framework support (16 = preview) | https://firebase.google.com/docs/app-hosting/frameworks-tooling | V |
| S29 | DO App Platform $5/512 MiB, $0.02/GiB | https://www.digitalocean.com/pricing/app-platform | V |
| S30 | Hostinger Web Apps $2.79 (48-mo) → $16.99 | https://www.hostinger.com/web-apps-hosting | V |
| S31 | Spaceship Web Hosting plans and renewals | https://www.spaceship.com/web-hosting/ | V |
| S32 | Spaceship cPanel Node.js app setup | https://www.spaceship.com/knowledgebase/setup-nodejs-application-spaceship-hosting/ | V (Next 16 fit: U) |
| S33 | OVHcloud VPS-1 2 vCore/4 GB/40 GB, from $4.54, daily backup, 99.9% SLA | https://www.ovhcloud.com/en/vps/ | V (commitment term and EUR price: **U**) |
| S34 | Hetzner CX23 €5.99, CAX11 €6.49, "currently unavailable"; IPv4 €0.50 included | https://www.hetzner.com/cloud/cost-optimized/ · https://docs.hetzner.com/general/infrastructure-and-availability/ipv4-pricing/ | V |
| S35 | Hetzner CPX02 €5.49/€6.49 | https://www.hetzner.com/cloud/regular-performance/ | V |
| S36 | Netcup VPS Lite 1 €4.92 net, 6-month contract; no VPS availability guarantee | https://www.netcup.com/en/server/vps-lite · https://www.netcup.com/en/server/vps | V |
| S37 | Contabo Cloud VPS 4 $5.28 (24 mo) / $6.60; setup fee on monthly | https://contabo.com/en-us/vps/ · https://contabo.com/en-us/pricing/ | V (fee amount U) |
| S38 | IONOS VPS S+ $6, commercial use stated | https://www.ionos.com/servers/vps | V |
| S39 | Vultr $5 1 GB, $0.01/GB overage, +20% backups, 100% SLA | https://www.vultr.com/pricing/ | V |
| S40 | ECB EUR/USD 1.0963 on 24 Nov 2026 | https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html | V |
| S41 | CBE USD sell 54.3094 EGP on 24 Nov 2026 | https://www.cbe.org.eg/en/economic-research/statistics/cbe-exchange-rates | V |
| S42 | Akamai/Linode Nanode $5, regional pricing | https://www.akamai.com/cloud/pricing | V |
| S43 | DigitalOcean Droplet $6/1 GiB, backups 20–30%, PayPal | https://www.digitalocean.com/pricing/droplets | V |
| S44 | Lightsail bundles ($7 1 GB IPv4), regions | https://aws.amazon.com/lightsail/pricing/ · https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-regions-and-availability-zones-in-amazon-lightsail.html | V |
| S45 | Hostinger KVM 1 $6.49 (24-mo prepay) → $11.99 | https://www.hostinger.com/vps-hosting | V |
| S46 | Scaleway Stardust and IPv4 prices | https://www.scaleway.com/en/pricing/virtual-instances/ | V |
| S47 | Oracle Always Free resources, idle reclamation | https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm | V |
| S48 | Oracle Free Tier: no SLA; card rules | https://www.oracle.com/cloud/free/faq/ | V |
| S49 | Spaceship nameserver change behaviour; Spacemail records for Cloudflare | https://www.spaceship.com/knowledgebase/connect-domain-custom-nameservers/ · https://www.spaceship.com/knowledgebase/set-up-spacemail-dns-records-cloudflare/ | V |
| S50 | Cairo → Frankfurt ping ≈ 55–62 ms avg (hourly, 10–24 Nov 2026) | https://wondernetwork.com/pings/Cairo/Frankfurt | V (third-party measurement network) |
| S51 | Baghdad → Frankfurt ≈ 70–80 ms | https://wondernetwork.com/pings/Baghdad/Frankfurt | U (summary of the page, not row-level) |
| S52 | Dubai → Frankfurt ≈ 120 ms | https://wondernetwork.com/pings/Dubai/Frankfurt | U (summary of the page, not row-level) |

## 3. Cross-checks and corrections made during the research

1. **Worker size limit.** OpenNext's docs say 3 MiB (Free) / 10 MiB (Paid) compressed. Cloudflare's own limits page says 64 MiB uncompressed on both plans, with no compressed limit. **Cloudflare's page was taken as authoritative** (S2 over S4). The measured bundle (1.55 MiB gzip) passes either way.
2. **"OpenNext does not support `proxy.ts`".** One research pass found this in a search snippet. It is **contradicted** by the official docs (experimental since 1.20.3) and by M6/M8. The claim was discarded.
3. **Page count.** The repository's `docs/DEPLOYMENT.md` says 70 static pages; M1 shows 138. The measurement was used.
4. **Vercel Hobby commercial wording.** The fair-use page no longer contains the sentence; the binding Terms §4 do (S12 used).
5. **Hetzner lineup.** CX22 and EU CPX11 no longer exist as entry plans, and CX23/CAX11 were out of stock. Treated as an "unavailable plan".
6. **Lightsail $5 1 GB.** That bundle is IPv6-only; the 1 GB IPv4 bundle is $7 (S44 bundle tables over the page's older example text).

## 4. Open unknowns (verify before purchase)

- OVHcloud VPS-1: the EUR price and commitment shown to an Egyptian account; VAT treatment.
- Egypt sign-up and payment acceptance for each provider; Egyptian VAT on imported digital services.
- Real-edge CPU time per request on Workers Free, and OpenNext proxy behaviour in production (06 §4 PoC).
- Which Cloudflare PoP serves Libyan ISPs.
- Railway Hobby commercial-use terms; Railway/Render exact EU region availability.
- Cloudflare Images binding counting wording (S6 binding page).
