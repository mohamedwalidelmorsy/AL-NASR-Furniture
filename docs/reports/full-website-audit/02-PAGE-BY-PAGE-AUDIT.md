# 02 — Page-by-page audit

Method: Playwright/Chromium against `http://localhost:3000` — every URL in `sitemap.xml` (70 paths × 2 languages) plus Inquiry and 404 pages, at **1280, 768 and 390 px** (432 loads, raw data `evidence/data/crawl.json`). Full-page screenshots of all page types (1280) and of the home/collections/category pages (390) are in `evidence/screens/`. Findings from the screenshots were checked by eye (listed per page).

## Automated results
| Page type | Lang | Pages | HTTP | Max horizontal overflow (px, 1280/768/390) | Broken imgs | Images w/o alt | Console errors* | h1≠1 |
|---|---|---|---|---|---|---|---|---|
| Homepage | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Homepage | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Collections overview | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Collections overview | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| About Us | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| About Us | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Sourcing & Export | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Sourcing & Export | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Shipping & Payment | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Shipping & Payment | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Custom Manufacturing | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Custom Manufacturing | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Contact / RFQ | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Contact / RFQ | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Privacy | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Privacy | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: bedrooms | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: bedrooms | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: dressing-rooms | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: dressing-rooms | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: kids-bedrooms | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: kids-bedrooms | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: corner-sofas | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: corner-sofas | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: living-rooms | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: living-rooms | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: china-cabinets | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: china-cabinets | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: dining-rooms | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Category: dining-rooms | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Product detail | EN | 55 | 200 | 0 | 0 | 0 | 0 | 0 |
| Product detail | AR | 55 | 200 | 0 | 0 | 0 | 0 | 0 |
| Inquiry List | EN | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| Inquiry List | AR | 1 | 200 | 0 | 0 | 0 | 0 | 0 |
| 404 / unknown | EN | 1 | 404 | 0 | 0 | 0 | 3 | 0 |
| 404 / unknown | AR | 1 | 404 | 0 | 0 | 0 | 3 | 0 |

\*Console errors exclude Next's dev-only LCP-lazy warning (47 loads: see ISSUE IMG-03). The three "errors" on 404 pages are the browser logging the 404 response itself.

## Visual review by page type (English and Arabic)
| Page | Verdict | Notes (evidence) |
|---|---|---|
| Homepage | Good | Two-column hero preserved, new image fully visible at 1440/1280; categories grid now 7 cards with clean covers (Bedrooms, Dressing, Kids use room renders; others posters). Footer/header intact. `screens/home-*-1280.png`, `home-*-390.png`. Mobile: hero image sits below the first screen (text-first stacking, inherited). WhatsApp float overlaps the footnote text on 390 px (UX-05). |
| Collections overview | Good | 7 category cards, counts correct. AR count text “12 مجموعات” grammar (AR-01). |
| Bedroom Sets (12) | Good with caveats | New renders look consistent; wide covers (2.3–2.8:1) are letterboxed on a tinted 4:3 card (6 products) – acceptable but visibly different from cover-filled cards; the 4 legacy posters mix in and duplicate 4 new designs (CAT-01). “Looking for fitted wardrobes?” link to Dressing Rooms present. |
| Dressing Rooms (6) | Very good | All six have full-view 1122-px covers; consistent card crops; related link back to Bedrooms. |
| Kids' Bedrooms (11) | Good | Clean covers; legacy posters (3) look visibly different (printed claims). Kids-2 cover is 2.6:1 (bars). |
| Corner Sofas (10) / Living (14) | Acceptable | All posters with the same “MODERN LIVING COLLECTION” template: repetitive but consistent; poster text is bilingual so it works in both languages. 4 legacy corner sofas are filed in the wrong category (CAT-04). Mobile list is very long (14 × single column). |
| China Cabinets (4) / Dining (2) | Good | Posters; dining sets could also appear under China Cabinets (CAT-08). |
| Product detail (110 pages) | Good | Real thumbnails, frame follows cover orientation, dimensions block present on all bedroom/kids/dressing products, related items, JSON-LD on each. Issues: low-res detail crops upscaled in the main frame (IMG-01, `evidence/issues/`), generic description (SEO-01), “sets” unit on single sofas (UX-02). |
| Inquiry List | Good | EN/AR, qty/note, remove; thumbnails use the card ratio. |
| About Us | Incomplete | Large striped placeholder “Approved company / product photograph” (EN) / “صورة معتمدة للشركة / المنتجات” (AR). Product-category list in the paragraph omits Dressing Rooms (CONT-01). |
| Sourcing & Export, Shipping & Payment | Good | Not changed by the expansion; Arabic reads well; trade terms (EXW/FOB/CFR/CIF, L/C, T/T) kept in Latin script correctly. |
| Custom Manufacturing & Projects | Good | “Products that can be evaluated” chips omit Kids/Dressing (CONT-01). |
| Contact / RFQ | Good (channels pending) | Validation messages correct in EN/AR; WhatsApp/e-mail cards show “PENDING” (blocker CAT-06). |
| Privacy | Pending text | “Pending” notice by design (blocker). |
| 404 | OK | Localized, real 404 status; **`<title>` is empty** (UX-03). Archived-product page: implemented, not reachable with current data (verified by component tests only). |

## Responsive/accessibility checks
No horizontal overflow at any viewport; skip link/landmarks present; touch targets ≥ 44 px in header (covered by existing e2e + axe tests, all passing); focus return from lightbox works.
