# 10 — Fix plan (nothing implemented)

No redesign is proposed. Order reflects dependencies: owner decisions first, then data, then code.

## P0 — Catalog correctness and launch blockers
| # | Work | Issues | Files | Effort | Acceptance |
|---|---|---|---|---|---|
| P0-0 | Owner decisions 1–4, 9 (see 09) | CAT-01/02/03/04/07/06 | — | owner | written answers |
| P0-1 | **De-duplicate bedrooms**: keep legacy IDs/URLs; replace their gallery with the clean room galleries (rooms 8, 4, 5, 3); set the 4 new duplicate records to `draft` (IDs reserved, never reused); same for `pv-lr-10` if confirmed | CAT-01/02/03 | `products.json`, `products.expansion.json`, design-groups JSON, `build-catalog-expansion.mjs`, tests | M | 8 bedroom designs listed; legacy URLs/IDs unchanged; Inquiry lines still resolve; no poster with printed claims as a cover; tests updated (not weakened) |
| P0-2 | **Category corrections**: move `pv-lr-01/02/03` → corner-sofas, `pv-co-03` → living-rooms; 308 redirects for old URLs; keep `alsoIn` only for dining↔china | CAT-04, UX-01, CAT-08 | `products.json`, `next.config.ts` (redirects generated from data), tests/e2e | M | Old URLs redirect (200 after redirect); breadcrumbs match; reserved-ID test passes; sitemap lists new URLs |
| P0-3 | Kids legacy decision executed (archive or keep) | CAT-07 | `products.json` | S | archived page 200, `noindex`; Inquiry rows show archived state; Kids category not empty |
| P0-4 | Name alignment EN/AR for `pv-lr-02/03` + names approved | CAT-05 | catalog JSON | S | EN/AR describe the same title |
| P0-5 | Launch data + About image + legal text | CAT-06 | env, messages | owner + S | no "PENDING"; test RFQ received by e-mail |

## P1 — Important UX / visual / localization
| # | Work | Issues | Files | Acceptance |
|---|---|---|---|---|
| P1-1 | Native-size rule for low-res detail images (or higher-res sources) | IMG-01 | `DetailView.tsx`, importer | no gallery image enlarged > 1.2× native |
| P1-2b | Trim blank source-edge slivers in renditions | IMG-05 | `build-catalog-expansion.mjs` | no edge sliver on any rendition |
| P1-2 | Hero `sizes` fix | IMG-02 | `Home.tsx` | request width ≥ 1.3× css width at 768 (DPR 1) |
| P1-3 | Eager first-row card images | IMG-03 | `CategoryView/CollectionsView/Home` | no LCP-lazy warning; production Lighthouse run afterwards (not yet done) |
| P1-4 | Arabic plural-aware counts + name fixes | AR-01/02, EN-01 | `messages/*.json`, count components | correct for 1, 2, 3–10, 11–99 |
| P1-5 | Product-specific descriptions/meta (no invented facts) | SEO-01, AR-06 | catalog JSON | unique meta per product |
| P1-6 | Units "pieces" where single | UX-02 | catalog JSON | unit matches type in EN/AR/RFQ |
| P1-7 | 404 `<title>`; copy lists include Dressing Rooms | UX-03, CONT-01 | `not-found.tsx`, messages | titles/copy correct |
| P1-8 | Arabic terminology (owner glossary) | AR-04 | `categories.json`, names | glossary applied |

## P2 — Optional refinements
Reviewed 4:3 card crops for ultra-wide covers (IMG-04); smaller/offset WhatsApp float on mobile (UX-05); 2-column poster grid on phones (UX-06); simplify the two dimensions presentations (DET-01); consider image-first stacking on mobile hero (UX-04, only if the owner wants it).

## Suggested sequence
1. Owner answers (P0-0) → 2. P0-1 and P0-2 in one PR each with test updates → 3. P0-3/4 → 4. P1-2, P1-3, P1-4, P1-7 (small, independent) → 5. P1-1, P1-5, P1-6 → 6. production build + **real Lighthouse run** + visual QA at 360/390/768/1280/1440 → 7. P0-5 launch data and a live RFQ test → 8. P2 as desired.
