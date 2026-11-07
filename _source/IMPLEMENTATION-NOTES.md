# AL NASR FURNITURE — Implementation Notes

## Files
- `Al Nasr Furniture.dc.html` — the full bilingual site (all pages, routing, inquiry list, RFQ, gallery).
- `site-content.js` — **all** business content: config, catalog, countries, EN/AR translations. No content lives in the page template.

## Phase 5a — Visual catalog preview (Oct 2026)
- Source: Google Drive "الكتالوج" (94 PNG, 47 AR / 47 EN). Inventory + audit: `catalog-import/drive-inventory.json`; contact sheets: `catalog-import/sheets/`.
- **All images are AI-generated marketing posters** with embedded text (incl. unverified materials/dimensions/"Made in Egypt"). Site labels every product "Illustrative design"; detail pages carry an AI-image notice; pieces/materials/dimensions left empty ("Set contents to be confirmed").
- Preview imports **18 products / 36 images** (AR + EN counterpart per product, matched visually) across all 6 categories → `assets/furniture/{category}/{ar|en}/{imageId}-{640|1400}.webp` (WebP, 640 for cards, 1400 for detail/lightbox; originals stay in Drive). Dataset: `catalog-import/preview-catalog.json` → `site-content.js` `previewProducts`.
- Language switch keeps product identity (same record, localized image). Codes `PV-xx-nn` are internal preview IDs, shown as "Internal ref.".
- Previous SAMPLE-* collections removed; stale inquiry entries are ignored automatically.
- Uncertain classifications listed in inventory `audit.uncertain` (corner vs living folder contents, unmatched/near-duplicate images, Arabic names transcribed at low resolution).
- Remaining for full import: 58 images, decision on folder-vs-visual classification, AR names verification, real specs.

## Phase 4 — content integration (Oct 2026)
Source: `uploads/source_doc-…md` (approved Arabic business content). All copy lives in `site-content.js` (EN + AR).
- **New pages:** `#/{lang}/shipping-payment` (payment terms, Incoterms 2020 EXW/FOB/CFR/CIF cards, ports, containers, CBM, transit, CTA) and `#/{lang}/custom-manufacturing` (custom furniture, projects & hotels, CTA). Reached via Sourcing & Export guide cards, home links, footer "Buyer guides", mobile menu, RFQ hint, Inquiry List. Breadcrumb + nav highlight sit under Sourcing & Export.
- **Home:** new positioning, all 6 categories, What we offer (manufacturing / export / quality, each linking deeper), 4-stage process + link to full 10 steps, custom & projects teaser, source RFQ CTA.
- **About:** source narrative (3 paras), products list, manufacturing/made-to-order/export, vision, network, Let's work together.
- **Sourcing & Export:** export coordination, 10-step timeline (AR shows English term), QC checklist, independent inspection (SGS / Bureau Veritas / Intertek shown as *examples only*), guide cards, revised FAQ.
- **Categories:** Bedroom Sets, Kids' Bedroom Sets, Corner Sofas (new), Living Room Sofa Sets, China Cabinets (new), Dining Room Sets. Classic Salons and Individual Furniture removed; SAMPLE-CS-01/02 moved to Living Room (IDs kept); SAMPLE-IF-01..03 removed (stale inquiry entries are ignored); new SAMPLE-CO-01/02, SAMPLE-CC-01/02. All still sample data.
- **RFQ:** optional Inquiry type, Preferred delivery term, Preferred payment term, Destination port/city; "quotation may cover" list; type-specific message hints; `?type=shipping|project|custom` presets the type from CTAs. File upload not implemented.
- **Payload additions:** `inquiry_type`, `trade_preferences: { delivery_term, payment_term, destination_port_city }`. No-backend behaviour unchanged (never fakes success).

### Claim-control decisions
- "Our workshops and showrooms" → "the manufacturing and showroom network we work with in Egypt" (per source guidance) until ownership is documented.
- "Egyptian company specialised in manufacturing" → "Egyptian business focused on supplying and exporting… coordinated manufacturing".
- Brand vs entity: AL NASR FURNITURE is stated as the commercial brand of مؤسسة النصر للاستيراد والتصدير (About + footer). Source English "Al-Nasr for Import and Export" used as the entity's English name — confirm official English spelling.
- Payment/delivery terms: framed as options agreed per order, not universally available. FCA mentioned only as a possible alternative, not offered.
- Container figures shown as indicative usable volume; no geometric volumes or container-count calculator added. CBM example is labelled illustrative arithmetic.
- No transit times, lead times, MOQs, freight rates or prices published.

### Pending data checklist
WhatsApp number · sales email · domain · social URLs · logo · official English entity name + commercial registration/tax numbers · privacy notice · RFQ endpoint + consent text version · real collections (names, codes, pieces, dimensions, materials, photos) · partner names/imagery (with permission) · confirmation of which delivery/payment terms apply per market · file-sharing channel for custom drawings.

## Routes (hash-based in this build; map 1:1 to Next.js `app/[lang]/…` later)
`#/{en|ar}/` · `/collections` · `/collections/{category}` · `/collections/{category}/{collection}` · `/about` · `/sourcing-export` · `/shipping-payment` · `/custom-manufacturing` · `/contact[?type=…]` · `/inquiry` · `/privacy` · anything else → 404.
Language switch keeps the same path and the inquiry list.

## Implemented
- Header (sticky 80/64px, full nav ≥1140px, accessible menu below), footer, skip link, focus rings, reduced-motion.
- Home: hero, featured categories, intro, Why Work With Us, How We Work, CTA.
- Collections overview + global search (name / code / category, EN+AR); category pages with category tabs, search, style chips (only when >1 style exists), counts, empty state.
- Collection detail: gallery (thumbs, arrows, swipe, fullscreen dialog with Escape, focus trap + restore), code, pieces with per-piece dimensions ("Available on request" when missing), materials only when present, quantity in sets/pieces, Add/Update Inquiry (no duplicates), WhatsApp with prefilled code, related collections.
- Inquiry List page: edit qty, notes, remove with undo, persisted in `localStorage` (`alnasr.inquiry.v1`), empty state.
- Contact / RFQ: WhatsApp + email channels, shared form, inline + summary validation (name, country, ≥1 contact method, email/phone format, message required when no items, consent), preferred method limited to provided channels, honeypot, loading/disabled state, error states, success only on a real 2xx response. Draft saved to `alnasr.rfqDraft.v1`.
- No prices, cart, checkout or payment anywhere.

## Placeholders (all marked PENDING / "Sample")
- `config.whatsappNumber`, `email`, `domain`, `social`, `logo`, `legalEntity`, `privacyPolicy`, `rfq.endpoint`, `rfq.consentTextVersion`.
- Catalog: 16 fictional `SAMPLE-xx-nn` collections across the 6 approved categories. Every image is a striped placeholder box with a monospace label.

## Replacing data
1. Edit `categories` / `collections` in `site-content.js` (schema per Blueprint §8). Set `pieces[].dims` to `null` when unknown; set `materials: null` to hide the section. Remove `sample: true`.
2. Replace placeholder boxes with `<img>` (srcset, width/height, bilingual alt) once approved photos exist.

## Connecting WhatsApp
Set `config.whatsappNumber` (digits incl. country code) — or the `whatsappNumber` tweak for preview. Until then WhatsApp buttons show "PENDING" and explain via toast.

## Connecting RFQ delivery
Set `config.rfq.endpoint` (or the `rfqEndpoint` tweak) to a server endpoint that accepts `POST application/json` and returns 2xx, optionally `{ "reference": "…" }`. Payload: `contact`, `destination_country`, `items[{collection_id, code, quantity, unit, notes}]`, `message`, `consent`, `locale`, `source_url`, `created_at`. Keep credentials server-side (email/CRM forwarding, spam checks, retention). With no endpoint the form reports "Request not sent" and keeps all data — it never fakes success.

## Not yet done / next steps
- Production stack (Next.js + TypeScript + Tailwind, SSR metadata, hreflang, sitemap) — use "Handoff to Claude Code" to port this design.
- Real photos, approved copy, translation review, privacy text, backend + spam protection.
