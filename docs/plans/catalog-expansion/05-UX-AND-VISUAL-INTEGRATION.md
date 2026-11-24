# 05 — UX and Visual Integration

**Scope guard:** preserve the approved design — same typography, colours (`#584838` brown, `#A58B64` gold, `#E9E4DC` / `#FAF9F6` neutrals), 1200 px container, spacing, button styles, grid, "Illustrative design" badge, lightbox pattern. Every change below is a *parameter* of an existing component (aspect ratio, object-position, thumbnail content), not a redesign.
**Evidence limit:** analysis is from component code and image measurements; **no browser/screenshot audit was run** (doc 01 §1). Each change below carries a "verify in browser" acceptance step.

## 1. Dressing Rooms: independent category vs subcategory (recommendation)

| Option | For | Against |
|---|---|---|
| **A. Independent top-level category (recommended)** | Buyers (importers/showrooms) shop "dressing rooms / walk-in wardrobes" as a separate joinery line; own route `/collections/dressing-rooms`; fits the existing 6→7 category model with zero new UI; own copy about made-to-measure sizing; clean sitemap/SEO; cards/filters need no nesting logic | 7 cards on Collections (grid is `auto-fill`, so no layout break); currently thin content |
| B. Subcategory of Bedroom Sets | Fewer top-level items | The site has **no sub-category UI** (would be new design); dressing rooms are not sold as a bedroom "set" (no bed); makes the 8–12 bedroom sets grid longer and mixes ratios (wardrobe walls vs room shots) |
| C. Shared hierarchy + independent route | Cross-discoverability | Needs `alsoIn` + link cards — the same machinery A needs anyway for dining/china |

**Recommendation: A, plus a discovery link** ("Looking for fitted wardrobes? → Dressing Rooms") at the bottom of the Bedroom Sets page and a bedroom product may list a dressing design in `alsoIn`-style related links. Sort position: after Bedroom Sets (order: Bedrooms, **Dressing Rooms**, Kids, Corner, Living, China, Dining). **Publish threshold (revised):** no technical minimum; recommendation ≥ 2 designs with a suitable cover (today D3 and D4 qualify) — rationale in doc 14 §6. Not implemented until you approve.

## 2. Image-orientation reality (drives most decisions)

| Image family | Count | Ratio | Today's card (3:4 `contain`) result |
|---|---|---|---|
| Bedroom main renders (rooms 1,4,5,6) | 4 | 2.3–2.8:1 | ~25 % of the box used; huge bars |
| Bedroom/kids PNG renders (opened: kids 3/7/8, bedroom 8) | — | 1.4–1.78:1 / 1.33:1 | ~40 % of the box |
| Posters (corner, living, China/Dining; kids infographic) | ~40 | 2:3 or 3:2 | fits well (design target) |
| Detail crops | ~50 | 0.6–1:1 | OK as thumbnails; low-res |

**Rule (data-driven, no new design):** add an optional `cardRatio` on the *category* (`'3/4'` default; `'4/3'` for bedrooms, kids, dressing) and let the import step generate the 640 px **`card` rendition as a 4:3 crop around a stored focal point** while `full` stays uncropped. The component keeps `objectFit: cover` for landscape cards and the existing `contain` for poster cards. A mixed grid (legacy portrait posters + new landscape renders in `bedrooms`) is the one awkward case: either render legacy posters inside the same 4:3 box with `contain` on the existing `#E9E4DC` tint (acceptable, same look as today's category cards) or retire legacy bedroom products (doc 09 Q1).
Cropping a 2.34:1 render to 4:3 keeps ~57 % of the width; the wardrobe or vanity can be cut, so focal points must be set per cover (reviewed visually) — not automatic.

## 3. Page-by-page proposals

Each: **Objective · Current → Proposed · Files · Priority · Effort · Acceptance · Test.**

### 3.1 Product detail — real thumbnails and adaptive main frame (P0 for multi-image products)
- **Objective:** show the 4–7 images per set.
- **Current:** thumbnails are numbered placeholder tiles (`DetailView.tsx:156`); main frame fixed 4:5 `contain` `maxHeight 80vh` (line 143).
- **Proposed:** thumbnail buttons render the `card` image (`Img`, `objectFit: cover`, existing 1:1 button, border state unchanged); main frame ratio follows the first image's orientation (landscape → `4/3`, portrait → `4/5`) via a derived `ratio` field; thumb `aria-label`s use the per-image `alt`/role ("Wardrobe detail"); keyboard/lightbox logic unchanged.
- **Files:** `src/components/views/DetailView.tsx`, `src/lib/product-cards.ts` (or a `product-detail` helper), `src/lib/catalog/types.ts`.
- **Priority/effort:** P0 · M.
- **Acceptance:** products with 1 image look identical to today (pixel diff within the existing tolerance); products with N images show N real thumbnails, arrow keys/lightbox still work; no CLS (main frame ratio set before image load); AR (RTL) thumbnail order mirrors.
- **Tests:** extend `tests/gallery.test.tsx` (N thumbnails, aria-current), `e2e/catalog.spec.ts` (gallery click changes main image), axe on a multi-image product.

### 3.2 Category pages and Collections product cards (P0)
- Apply `cardRatio` (§2), keep the "Illustrative design" badge; add `loading="lazy"` (already) and `sizes` matching the grid (3 columns ≥1024, 2 ≥640).
- Do **not** show detail crops as cards; card = product cover (`role: 'cover'`, not `hasEmbeddedText` when a clean image exists).
- Optional **P1**: style filter chips already exist in the client view for the 6 categories — keep; for Bedroom Sets with 8–12 designs add no new filters (a search box already exists on Collections). Revisit if the category exceeds ~16 products.
- **Files:** `CategoryView.tsx`, `CollectionsView.tsx`, `product-cards.ts`, `categories.json`.

### 3.3 Collections overview and Home "featured categories" (P1)
- Category cover = one **clean** image per category (4:3 `cover`, `center 38%` today). Proposed covers (all subject to your approval): Bedrooms → room 1 or 5 main; Dressing → dressing 3 main; Kids → kids 8 or 7 render; Corner/Living/China/Dining → keep current posters until clean alternatives exist (poster text is cropped by the 4:3 `cover`, which looks accidental — a known issue today).
- Add `coverProductId` per category (data) instead of "first product".

### 3.4 Home — highlighted designs (P2)
- Optional new strip reusing the existing card component: 3 `featured` products (one bedroom, one kids, one dressing). No new design pattern. Skip if you prefer the current 4-section structure.

### 3.5 Custom Manufacturing & Projects (P1)
- `Custom.tsx` was **not read in detail** in this audit. Proposal: reuse 2–3 existing cards (dressing wall, kids twin room, bedroom) as "made-to-order examples" with a one-line caption each and a link to the category; keep all current copy. No claim that these are completed projects — caption: "Design example / illustrative".

### 3.6 Inquiry List (P0 correctness)
- Thumbnail = product `card` rendition at a **fixed 4:3 or 1:1** (today 3:4 `contain`); never an embedded-text poster when a clean cover exists. Product identity = ID (unchanged); show localized name + category (already). Items for hidden/retired products render a neutral state (P1, doc 09 Q1).

### 3.7 Dimensions & customization section (P1) — see doc 06
Placed on product detail between the description and the CTA, collapsed `<details>` is **not** used (keep content visible; it is a selling point). Shown only when `dimensionProfile` is set.

### 3.8 Bilingual presentation
Shared clean images for both locales; alt text per locale; embedded-text posters carry `hasEmbeddedText` and (P2) a quiet caption "Poster text is illustrative". Never switch a design's image to another design's image when changing language (the fallback only picks another *locale variant of the same product*).

## 4. Enlarged viewing, detail navigation, responsiveness
The lightbox already exists with focus-return and Esc; add (P1) prev/next arrows and swipe on touch if not present — **[Not verified: lightbox arrow handling was not read in full]**. Mobile: thumbnails become a horizontally scrollable row (existing grid → `grid-auto-flow: column` ≤ 640 px); thumb min touch size 44 px (WCAG target-size, matches existing 44 px rules).

## 5. Priority table

| # | Change | Prio | Effort | Depends on |
|---|---|---|---|---|
| 1 | Real thumbnails + adaptive main frame | P0 | M | data model (04) |
| 2 | `cardRatio` + 4:3 card renditions with focal | P0 | M | import pipeline (08) |
| 3 | Inquiry thumbnail rule | P0 | S | #2 |
| 4 | Dressing Rooms route/category | P0/P1 | S | owner approval + ≥3 covers |
| 5 | Dimensions/customization block | P1 | S–M | copy approval (06) |
| 6 | Category cover per category | P1 | S | owner choice |
| 7 | Hero (doc 07) | P1 | S | owner approval |
| 8 | Custom-manufacturing examples | P1 | S | — |
| 9 | Featured designs strip | P2 | S | — |
