# 08 — Functional and technical QA

## Existing automated tests (run without modifying anything; logs in `evidence/data/`)
| Suite | Result |
|---|---|
| `tsc --noEmit` | pass |
| `eslint .` | pass |
| Vitest | **73 passed**, 8 files |
| Playwright (desktop + mobile Pixel 7; builds and serves on :3100) | **208 passed, 8 skipped, 0 failed** (skips are the existing desktop-only/mobile-only guards) |

## Manual / scripted probes (real browser, `evidence/data/func.json`)
| Area | Result |
|---|---|
| Category and product navigation, 55 products × 2 languages | 200; correct H1/crumbs |
| Gallery thumbnails | real images (not numbered tiles); selecting changes main image; counter and arrows work; lightbox + Esc (also in e2e) |
| Language switch on a product page | keeps the product (verified with explicit URL wait) and the Inquiry List |
| Quantity | 0 → 1; 9 999 999 → 99 999; restored after refresh |
| Add to Inquiry | **all 55 products** store correct ID/qty and render EN and AR name + code in the list |
| Inquiry persistence / remove | survives refresh and language switch; removing the last item empties storage |
| Browser back/forward | works across product ↔ list ↔ language switch; scroll position restored on back |
| Mobile menu (Pixel 7) | opens with all links; Escape closes |
| RFQ | empty submit shows a summary + per-field errors (EN and AR); API returns 422 for an empty body; **real delivery not tested** (no Resend credentials → 503 by design) |
| 404 handling | unknown product/category/page → real 404 (localized); trailing slash and `/EN` normalise |
| Cross-category URL | `/collections/corner-sofas/soft-arc-corner-sofa` → **404**; the card in Corner Sofas links to `/collections/living-rooms/…` (breadcrumb "Living Room Sofa Sets") — UX-01 |
| Search | "sofa" 20 results, "dressing" 6, "طقم" 30, code and name search work, empty state works |
| Archived products | no archived record exists → **not testable live**; covered by 3 component tests + 2 API tests (archived line kept with qty/note, excluded from RFQ, removable, API `archived_item`) |

## Performance and image optimisation (measured, not a Lighthouse audit)
Lighthouse was **not run**. Numbers below come from Chromium on the dev server (no throttling, dev-mode JS), so LCP values are indicative only.

| Page (dev server) | Viewport | Initial image KB | After scroll KB | Images | CLS | LCP ms (dev, un-throttled) |
|---|---|---|---|---|---|---|
| /en | desktop | 125 | 125 | 8 | 0 | 560 |
| /ar | desktop | 128 | 128 | 8 | 0 | 144 |
| /en/collections | desktop | 110 | 110 | 7 | 0 | 472 |
| /en/collections/bedrooms | desktop | 150 | 150 | 12 | 0 | 136 |
| /en/collections/kids-bedrooms | desktop | 131 | 131 | 11 | 0 | 116 |
| /en/collections/dressing-rooms | desktop | 49 | 49 | 6 | 0 | 112 |
| /en/collections/living-rooms | desktop | 262 | 262 | 14 | 0 | 120 |
| /en/collections/bedrooms/curved-headboard-bench-bedroom-set | desktop | 46 | 46 | 11 | 0 | 464 |
| /en/collections/dressing-rooms/taupe-panel-dressing-room | desktop | 43 | 43 | 8 | 0 | 100 |
| /en/collections/living-rooms/sculpted-white-sofa | desktop | 90 | 90 | 4 | 0 | 96 |
| /en/collections/bedrooms/soft-arc-bedroom-set | desktop | 59 | 59 | 4 | 0 | 104 |
| /en | mobile | 228 | 228 | 8 | 0 | 104 |
| /ar | mobile | 232 | 232 | 8 | 0 | 108 |
| /en/collections | mobile | 195 | 195 | 7 | 0 | 100 |
| /en/collections/bedrooms | mobile | 121 | 266 | 12 | 0 | 96 |
| /en/collections/kids-bedrooms | mobile | 110 | 224 | 11 | 0 | 104 |
| /en/collections/dressing-rooms | mobile | 81 | 81 | 6 | 0 | 88 |
| /en/collections/living-rooms | mobile | 205 | 469 | 14 | 0 | 112 |
| /en/collections/bedrooms/curved-headboard-bench-bedroom-set | mobile | 90 | 90 | 11 | 0 | 416 |
| /en/collections/dressing-rooms/taupe-panel-dressing-room | mobile | 79 | 79 | 8 | 0 | 576 |
| /en/collections/living-rooms/sculpted-white-sofa | mobile | 173 | 173 | 4 | 0 | 748 |
| /en/collections/bedrooms/soft-arc-bedroom-set | mobile | 113 | 113 | 4 | 0 | 800 |

- **CLS 0** on every measured page; no layout jumps when thumbnails change (frame ratio fixed by the cover).
- Delivered images are AVIF/WebP via `next/image`; category pages transfer 49–469 KB of images in total.
- **IMG-03 (Medium):** 47 of 432 loads log Next's dev warning that an above-the-fold card image was the LCP element but is `loading="lazy"`. First 2–3 card images on category pages should be eager.
- **IMG-01:** low-resolution detail crops are enlarged in the main frame (see 09).
- Asset footprint: `public/images` 15 MB (224 WebP), legacy `public/assets/furniture` 11 MB.

## Cannot be fully tested without live credentials / data
Real RFQ e-mail delivery; WhatsApp links (number pending); production-build Lighthouse/field data; archived-product page in production data.
