# 08 — Implementation Roadmap (revised 2026-11-09 — PLAN ONLY, nothing started)

Approved direction ≠ approval to implement. Implementation starts only on the owner's explicit go-ahead.
Effort (estimates, one engineer): **S** ≤ 0.5 d · **M** 1–2 d · **L** 3–5 d. Every phase = one PR; tests extended in the same PR; no push/deploy without separate approval.
Governing rules: Drive active folders = source of truth (fresh inventory first) · the 20 deleted images are deny-listed · legacy products classified A/B/C (doc 13): only confirmed A are archived, B keep ID/URL, C unchanged · the current application stays untouched until replacement data and images are verified · local legacy images kept until dependencies and tests are updated.

## Priorities

| P | Work package | Phase |
|---|---|---|
| **P0** | Active image verification (117) | 0 |
| **P0** | Correct product grouping | 0 |
| **P0** | Stable IDs, reserved list, route handling, archived pages/redirects | 1, 4 |
| **P0** | New catalog integration | 2, 3 |
| **P0** | Safe archival of old products | 4 |
| **P0** | Inquiry List migration safety | 4 |
| **P0** | Functional tests | every phase |
| **P1** | Standard dimensions & customization content (wardrobe **250 W × 230 H**, depth unspecified) | 5 |
| **P1** | Dressing Rooms category | 5 |
| **P1** | New homepage hero (3:2 recommendation, pending visual approval) | 5 |
| **P1** | Visual and mobile QA | 6 |
| P2 | Featured strip, custom-manufacturing examples, per-category covers | 7 |

## Phase 0 — Verification & grouping (no code) · P0

| Task | Detail | Output | Effort |
|---|---|---|---|
| 0.1 Fresh inventory | list active tree, skip trashed ancestors; diff against the 117 of 2026-11-09 | `drive-inventory-<date>.json` | S |
| 0.2 Download + machine pass | read-only token run by the owner (doc 11 §3); size, SHA-256, perceptual hash, crop-containment, OCR (needs approval to install dev tools) | per-image metadata | M |
| 0.3 Contact sheets + eye pass | ≈ 24 sheets; assign roles and groups by doc 11 §6 rules; `confidence: low` items → owner | grouping table (doc 03 appendix) | M + owner |
| 0.4 Deny-list | the 20 deleted IDs; importer + test refuse them | `deleted-sources.json` | S |
| 0.5 Equivalence review | owner confirms/rejects C candidates using `evidence/` (01≈room 8, 02≈room 4, 03≈room 5, 04≈room 3; kids) | `equivalence` records | owner |

**Acceptance:** 100 % of active images have dimensions + hash + role + group + confidence; zero deleted/trashed files; every product group has cover + ≥ 2 distinct images, or is marked *not publishable*.

## Phase 1 — Data model, archive model, importer, test foundations · P0 · L

Affected: `src/lib/catalog/{types,index}.ts`, new per-category data files, `reserved-ids.json`, `scripts/import-drive-catalog.ts` + lib, `tests/content.test.ts`, `e2e/integrity.spec.ts`.
Do: doc 04 delta + `status`/`archived` fields; `allActive()` vs `productById()` (archived resolvable); reserved-ID test; unified `images[]`; importer on the new inventory (PNG/JPG/JPEG, 640 card with focal crop + 1400 full, never upscale); replace the `94` and `36` pins with data-derived assertions.
**Acceptance:** typecheck/lint/unit green with **no content change**; legacy 18 render exactly as today.

## Phase 2 — Gallery & card rendering · P0 · M
Doc 05 §3.1–3.2, 3.6: real thumbnails (replace numbered tiles), adaptive main frame, category `cardRatio`, Inquiry thumbnail rule. Acceptance/tests as doc 05.

## Phase 3 — Update continuing (B) products in place; add genuinely new designs · P0 · M–L
- **B products** (11 now; up to 15 if bedroom candidates are confirmed): edit in place — ID, slug, URL, category unchanged; refresh `driveFileId`/provenance, names/descriptions (approved), image metadata and images.
- **New designs** (rooms 1, 2, 6, 7; kids rooms; dressing D3, D4; the 14 unmapped corner/living posters after classification): **new IDs**.
- **C products stay untouched** until confirmed. Not imported: kids-3 infographic as an image; kids-1 main uncropped; dressing designs without a usable cover; detail crops beyond native size.
**Acceptance:** doc 13 §7 (B/C/new bullets); each new product has an approved cover + ≥ 2 distinct images, EN/AR names and alt text; RFQ accepts new IDs.

## Phase 4 — Confirmed-A archival, routes, Inquiry migration safety · P0 · L
Runs **only for products the owner confirms as A**. Remove code/test dependencies on those IDs (hero `page-ctx.ts:64` is already handled by the Phase 5 hero swap; `e2e/helpers.ts`/`a11y.spec.ts`/`integrity.spec.ts` reference `soft-arc-bedroom-set` — unaffected if `pv-br-01` is B/C) → archived-product page, archived registry, verified-only redirects, Inquiry row states, `archived_item` API error, reserved-ID test.
**Acceptance/tests:** doc 13 §7–8.

## Phase 5 — P1 content & features · M
- Dimensions & customization block (doc 06; wardrobe "250 cm wide × 230 cm high"; no depth; shared `STANDARD_DIMENSIONS`; test forbids any number outside it).
- Dressing Rooms category (independent; link from Bedroom Sets; publish when ≥ 2 suitable covers — D3, D4 qualify; doc 14 §6).
- Hero swap (doc 07; 3:2 pending owner's visual approval; also removes the hero's dependency on legacy `pv-br-01`).
**Acceptance:** block only on tagged products; category hidden until gate; hero ≤ 150 KB at 1280 px, `priority`, no CLS; AR/EN key parity.

## Phase 6 — Visual & mobile QA · P1 · M
390/768/1280 px × EN/AR(RTL) screenshots: Home, Collections, each category, new product pages, archived page, Inquiry (with/without archived rows), RFQ; axe; production-build Lighthouse (no scores claimed until measured).

## Phase 7 — P2 optional · S–M
Featured designs strip, custom-manufacturing examples, per-category cover products, poster captions.

## Cut-over cleanup (separate, later PR)
After Phase 6 sign-off: remove unreferenced legacy image files and legacy-only tests. Never earlier.

## Asset pipeline (unchanged)
Drive stays master; originals not committed/not in `public/`; renditions 640 card + 1400 full WebP (`<productId>-<nn>-<role>-<w>.webp`), AVIF on demand via `next/image`; lazy except hero and first gallery image; no R2/CMS. Current `public/assets/furniture` = 11 MB/72 files (measured); growth estimate +15–25 MB (not measured).

## Dependencies
0 → 1 → 2 → 3 → 4 → 5 → 6. Hero (5) may ship after 1 if approved early. Decision A (doc 13 §6) gates the corner/living/China part of 4.
