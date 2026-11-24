# 04 — Architecture Comparison

**Date:** 2026-11-24. These four architectures follow the brief. No Docker, Kubernetes, database or Redis is introduced, because the application doesn't need any of them (01 §3).

---

## A. Free / near-free edge deployment — Cloudflare Workers + OpenNext

```
 Visitor (EG / LY / IQ / SA / AE / EU)
        │ HTTPS
        ▼
 Cloudflare edge PoP (Cairo, Riyadh, Jeddah, Dammam, Dubai, Baghdad…, Frankfurt…)
   ├─ Static assets (/_next/static, /images, /assets) ─► Workers Static Assets (free, unlimited)
   ├─ WAF rate-limit rule on /api/rfq (Free plan: 1 rule)
   └─ Worker (OpenNext bundle of the unchanged Next.js app)
        ├─ proxy.ts (next-intl) → / → /en
        ├─ pre-rendered HTML/RSC (138 pages, from the static-assets cache)
        ├─ /_next/image ─► Cloudflare Images binding (AVIF/WebP)
        └─ POST /api/rfq ─► fetch https://api.resend.com ─► sales inbox (Spacemail)
 DNS: Cloudflare (nameservers moved from Spaceship; Spacemail records recreated)
```

**Required project modifications.** These are deployment config only; no application logic changes. All were validated on a scratch copy [M].
1. `npm i -D @opennextjs/cloudflare@1.20.18 wrangler@4.168.0`.
2. Add `wrangler.jsonc`:
   - `main: .open-next/worker.js`
   - `compatibility_flags: ["nodejs_compat","global_fetch_strictly_public"]`
   - `assets: { binding: "ASSETS" }`
   - `images: { binding: "IMAGES" }`
   - optionally `WORKER_SELF_REFERENCE` [S4].
3. Add `open-next.config.ts` with `defineCloudflareConfig()`. For a pure SSG site, use the read-only static-assets incremental cache, so no R2/KV/D1 is needed [S5].
4. Add `public/_headers`:
   - long-cache `/_next/static/*`;
   - the four security headers for static files, because `next.config` `headers()` doesn't apply to static assets on Workers [S5].
5. Add scripts: `"preview"`, `"deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"`.
6. Recommended small code change, optional: in `clientKey()`, prefer the `CF-Connecting-IP` header. Otherwise rely on the WAF rule (01 §5).

| Dimension | Assessment |
|---|---|
| Monthly cost | **$0** (Free) → **$5** (Paid) at ≈ 100k requests/day or on CPU-limit errors |
| Operational complexity | Low at runtime (no servers). Medium one-time: OpenNext build, nameserver move, CI deploy from Linux (Windows is not fully supported by OpenNext [S4]) |
| Maintenance | Keep `@opennextjs/cloudflare` and `wrangler` updated alongside Next.js. Each OpenNext release states its supported Next versions (1.20.18 needs Next ≥ 16.4.5 [S5]) |
| Security | DDoS protection and TLS at the edge; WAF rate limit; secrets via `wrangler secret`; no SSH surface to patch |
| Scalability | Automatic, global |
| Vendor lock-in | **Medium.** App code stays portable (plain Next.js). Only the config files are Cloudflare-specific |
| Migration difficulty | Low. Remove the two config files and `npm start` anywhere |
| Pros | Best regional coverage (PoPs in Egypt, KSA, UAE, Iraq); no bandwidth bills; $0 at launch |
| Cons | `proxy.ts` runs as **experimental** Node middleware in OpenNext; Free plan's **10 ms CPU** limit is unmeasured on the real edge; in-memory limiter is per-isolate; requires moving DNS to Cloudflare |

## B. Single low-cost VPS — Node.js + Nginx (optional Cloudflare CDN)

```
 Visitor ──HTTPS──► [optional: Cloudflare Free proxy/CDN] ──► VPS (OVHcloud VPS-1, Frankfurt)
                                                               ├─ Nginx: TLS (Let's Encrypt), gzip/br, cache /_next/static
                                                               ├─ systemd: `next start` (Node 22 LTS, port 3000)
                                                               │     ├─ proxy.ts, SSG pages, /_next/image (sharp)
                                                               │     └─ POST /api/rfq ─► Resend API
                                                               └─ ufw firewall, unattended-upgrades, fail2ban
 DNS: stays at Spaceship (A/AAAA record → VPS IP); Spacemail untouched
```

**Required project modifications:**
- **None to the app.**
- Server config only: Nginx site, a systemd unit and `.env.production`.
- Build in CI or on the 4 GB box with `npm ci && npm run build`.
- In Nginx, set `proxy_set_header X-Forwarded-For $remote_addr;` so the existing limiter can't be spoofed (01 §5).

| Dimension | Assessment |
|---|---|
| Monthly cost | **≈ $4.54–6.57** (OVH / Netcup / IONOS / Hetzner), flat across all three scenarios |
| Operational complexity | **Medium-high.** You own OS updates, Nginx, TLS renewal, Node upgrades, monitoring and restarts |
| Maintenance | Monthly patching (~1–2 h/month); Node LTS upgrades yearly |
| Security | Exposed SSH; needs key-only login, firewall, automatic security updates, fail2ban |
| Scalability | Vertical (resize). Single point of failure, no automatic failover |
| Vendor lock-in | **Lowest.** Standard Linux + Node |
| Migration difficulty | Lowest |
| Pros | App runs exactly as tested; the in-memory rate limiter works as designed; **no DNS migration needed**, so Spacemail is untouched |
| Cons | Europe-only origin (Cairo → Frankfurt ≈ 56–60 ms RTT [S50]; Gulf farther); image transforms consume VPS CPU; one server, one person on call |

Adding the Cloudflare Free CDN in front of the VPS improves static and image delivery in MENA. But it brings back the same nameserver move as A, and caching HTML on the free plan needs extra rules.

## C. Managed Next.js / PaaS — Railway Hobby (or Render)

```
 Visitor ──HTTPS──► Railway edge ──► Railway service (EU region): `next start` from GitHub main
                                        └─ POST /api/rfq ─► Resend
 DNS: Spaceship CNAME (www) + root handling per Railway docs; Spacemail untouched
```

**Required project modifications:** none. Set the build and start commands and env vars in the dashboard. Keep replicas at 1 so the in-memory limiter keeps working.

| Dimension | Assessment |
|---|---|
| Monthly cost | Railway **$5 → ≈ $7.40** at Scenario C (egress $0.05/GB). Render $7 → $15.26 |
| Operational complexity | Low (git push → deploy, managed TLS, logs) |
| Maintenance | Low |
| Security | Managed platform; no SSH |
| Scalability | Easy vertical and horizontal scaling (horizontal breaks the in-memory limiter) |
| Vendor lock-in | Low–medium |
| Migration difficulty | Low |
| Pros | Zero server administration; app unchanged |
| Cons | EU-only regions; usage-based cost grows with traffic; Hobby positioned for "personal projects" (commercial terms not confirmed, U); apex-domain setup on Spaceship needs checking |

Vercel, the "native" managed Next.js host, is excluded: Hobby prohibits commercial use and Pro is $20/month.

## D. Static frontend + separate RFQ backend — **not technically justified**

```
 Static host (export) ──► HTML/assets         RFQ form ──► separate function (e.g. Worker) ──► Resend
```

**This would require app changes** (01 §7 #5):
- remove or replace `proxy.ts`;
- move redirects and headers into host rules;
- switch to `images.unoptimized` or a custom loader;
- rewrite the `[...rest]` 404 handling;
- extract `/api/rfq` into a separate service with CORS and a new origin check.

It also gives no cost advantage: option A already serves the static parts for free and runs the RFQ route on the same platform.
**Verdict: rejected.** It redesigns working code for no saving.

## Comparison summary

| | A. Cloudflare Workers | B. VPS (OVH) | C. Railway | D. Static + API |
|---|---|---|---|---|
| Cost A / B / C scenario | $0 / $0 / $5.34 | $4.54 flat | $5 / $5 / ≈$7.40 | ≈ A |
| App code changes | none (config only) | none | none | **substantial** |
| Regional delivery | ★★★★★ | ★★★ | ★★★ | ★★★★★ |
| Ops burden | ★★★★ (low) | ★★ (high) | ★★★★ | ★★★ |
| DNS migration needed | **yes** | no | no | depends |
| Biggest risk | experimental proxy on OpenNext; 10 ms CPU on Free | single server you must maintain | usage-based cost; commercial terms | rewrite risk |

## DNS and Spacemail risk (applies to A, and to B with a Cloudflare proxy)

- A Worker can only serve `alnasrfurniture.com` if the zone's **nameservers are moved to Cloudflare**. Pages supports CNAME setups; Workers custom domains do not [S8].
- Spaceship warns that changing nameservers terminates all active connections, including email. Old records become **inactive**, not deleted [S49].
- **Every Spacemail record must be recreated in Cloudflare before switching** [S49]:
  - MX `@` → `mx1.spacemail.com`, `mx2.spacemail.com`;
  - TXT `@` `v=spf1 include:spf.spacemail.com ~all`;
  - SRV `_autodiscover._tcp` → `autoconfig.spacemail.com:443`;
  - TXT `spacemail._domainkey` (copy the exact value from Spaceship's "Inactive records");
  - TXT `_dmarc`.
- **Resend's records don't conflict with Spacemail.** They live on `send.` (MX + SPF) and `resend._domainkey` (DKIM). Never enable Resend inbound on the root domain [S10].
- **Safe order:**
  1. Add the domain to Cloudflare.
  2. Verify that every imported record matches Spaceship's list.
  3. Add any missing Spacemail records.
  4. Lower TTLs.
  5. Switch nameservers at Spaceship.
  6. Send and receive a test email within 1 hour and again after 48 hours (propagation can take up to 48 h [S49]).
