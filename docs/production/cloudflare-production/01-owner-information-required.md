# Information required from the owner (one consolidated list)

**Date:** 2026-11-25. Nothing below is invented. Placeholders stay "PENDING" on the site, and the production build refuses to run while the required values are missing.

## Already known — not requested again

| Item | Value | Source |
|---|---|---|
| Brand name | AL NASR FURNITURE / النصر للأثاث | `src/lib/site-config.ts` (approved design) |
| Positioning | Egyptian furniture manufacturing and export for wholesale buyers | Approved site copy |
| Production domain | `alnasrfurniture.com` at Spaceship, registry expiry **2027-11-13**, DNSSEC **on** | Public WHOIS/DNS, checked 2026-11-25 |
| Mailboxes | Spacemail (MX `mx1`/`mx2.spacemail.com`, SPF, DKIM, autodiscover) | Public DNS, checked 2026-11-25 |
| Hosting | Cloudflare account on the **Workers Free** plan; staging on `alnasr-staging.workers.dev` | Cloudflare dashboard |
| Catalog | 55 products live on staging, all flagged illustrative (AI-generated images) | `src/data/catalog/*.json` |

## Required before launch

### 1. Contact channels (critical)
- [ ] **WhatsApp number** that answers buyers, in international digits (for example `20…`). Shown on every page and used as the fallback in RFQ error messages.
- [ ] **Sales e-mail address** shown on the site, on `@alnasrfurniture.com`. It must already exist in Spacemail.
- [ ] **RFQ inbox** (`RFQ_TO_EMAIL`): the address that receives quote requests. It can be the same as the sales address.

### 2. Official company information
- [ ] **Legal entity name** in English. The current English text is a placeholder: "Al Nasr for Import & Export".
- [ ] **Legal entity name** in Arabic. Confirm or correct the current text: "مؤسسة النصر للاستيراد والتصدير".
- [ ] **Commercial registration number** and **tax ID**, if they should appear (footer / privacy notice).
- [ ] **Registered address** (at least city and country) for the privacy notice.
- [ ] **Social media URLs**, if any are to be shown (optional).

### 3. Logo and images
- [ ] **Final logo:** SVG (preferred), plus PNG at least 1024 px on a transparent background. Also a **square icon** (512 × 512) for the favicon and the iPhone home-screen icon. The site currently uses a provisional text wordmark.
- [ ] **Product images decision:** launch with the 55 AI-generated images labelled "Illustrative design", **or** supply authentic photos first, all at once or per product.
- [ ] **About page image**, if a real photo of the factory, showroom or team is wanted.
- [ ] **Catalog confirmations:** the Arabic product names (transcribed at low resolution), the kids-room photo flagged in the audit, and the classification of the 58 Drive images not yet imported.

### 4. Privacy policy and consent
- [ ] **Privacy notice text, EN + AR, legally reviewed.** It should name:
  - the company as data controller;
  - what an RFQ collects (name, company, country, e-mail/phone, message, selected products);
  - why, and how long RFQ data is kept;
  - the processors (Cloudflare hosting, Resend e-mail delivery) and any cross-border transfer;
  - how a buyer can ask for access or deletion.
- [ ] **Consent sentence**, EN + AR, shown beside the RFQ checkbox. Approve or replace the current text: "I agree that AL NASR FURNITURE may use these details to respond to my inquiry." It is followed by a "Privacy notice" link marked "(text pending legal review)".
- [ ] **Consent version label**, for example `2026-12-v1`. It is stored with each RFQ.

### 5. Resend (RFQ e-mail delivery)
- [ ] Create a **Resend account** (free plan: 3,000 e-mails/month, 100/day) with a business e-mail, and enable 2FA.
- [ ] Add the domain `alnasrfurniture.com` in Resend.
  - Resend will show records for `send.` (MX + SPF) and `resend._domainkey` (DKIM).
  - **Do not add them at Spaceship now.** They go into the Cloudflare zone during the DNS migration (runbook step 4), and verification completes after the nameserver switch.
  - These records do not conflict with Spacemail.
- [ ] Choose the **sender address**, for example `AL NASR Furniture <rfq@alnasrfurniture.com>` (`RFQ_FROM_EMAIL`).
- [ ] Create an **API key with "Sending access" only**, restricted to this domain.
  - **Never paste it in chat or e-mail.**
  - It is entered once at the terminal with `npx wrangler secret put RESEND_API_KEY -c wrangler.production.jsonc`, typed by the owner, or by the engineer in a session the owner supervises.

### 6. Cloudflare account ownership and security
- [ ] Confirm the account that will hold the production zone **belongs to the business**. It is currently registered to a personal-style Gmail address. If not, decide now whether to move it, before the zone is added.
- [ ] Enable **two-factor authentication** and store the recovery codes offline.
- [ ] Add a **second administrator** (a trusted person) so access is never lost.
- [ ] Keep **no payment method** on the account until a paid upgrade is approved.

### 7. Launch decisions
- [ ] **Canonical host:** `alnasrfurniture.com` (prepared) or `www.alnasrfurniture.com`. The other host will redirect.
- [ ] **Cut-over window:** a weekday morning (Cairo time), at least **24 h after** DNSSEC is turned off (see the DNS runbook).
- [ ] **Uptime alerts:** which e-mail receives them (free external monitor).
- [ ] **Indexing go-ahead:** confirm that search engines may index the site once content items 1–4 are done.
