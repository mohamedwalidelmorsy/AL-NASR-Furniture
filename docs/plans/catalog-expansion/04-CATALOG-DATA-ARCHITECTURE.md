# 04 — Catalog Data Architecture

**Verdict: the current JSON-file catalog is sufficient. No CMS, database or external service is needed.** The `Product` type needs a small, backward-compatible extension (all new fields optional) plus one new array on `Product` for categories. Tests should be extended, not rewritten.

## 1. Requirement → current support → change

| Requirement (brief §9) | Today | Change |
|---|---|---|
| Stable ID / slug | `id`, `slug`, `code` ✔ | none; add `legacySlugs?: string[]` only if a slug ever must change |
| Categories | single `categoryId` | add optional `alsoIn?: string[]` (extra category ids). Keep `categoryId` = primary (URL owner) |
| AR / EN names | `name{en,ar}` ✔ | none |
| Main + gallery | `gallery{en,ar}[]` (duplicates every image per locale) | add shared gallery `images[]` with per-image `locale: 'all' \| 'en' \| 'ar'`; keep `gallery` working during migration (see §3) |
| Image roles | none | `role: 'cover' \| 'detail' \| 'variant' \| 'poster'` |
| Original Drive IDs | `source.driveFileId` ✔ | add `source.drivePath?`, `source.status: 'valid' \| 'remapped' \| 'orphaned' \| 'deleted-by-decision'`, `source.sha256?` |
| Standard dimensions | none | `dimensionProfile` id → one shared `STANDARD_DIMENSIONS` object (doc 06 §8; wardrobe `{width:250,height:230,depth:null}`) — profile points to shared data, **not** per-product numbers; depth stays `null` |
| Customization | none | `customizable: boolean` (default true for bedroom/kids/dressing) |
| Components | `pieces[]` (name, qty, dims) ✔ | keep. Empty until confirmed. Add optional `components?: string[]` ids (`bed`, `wardrobe`, `nightstand`, `dressing-table`, `bench`) = what the **images visibly show**, flagged `confirmed:false` |
| Optional specs | `materials`, `pieces[].dims` ✔ | none |
| Verification | boolean `illustrative` | replace conceptually by `verification: 'concept-render' \| 'photo-unverified' \| 'verified-product'` (keep `illustrative` derived = `verification !== 'verified-product'`) |
| Featured | none | `featured?: boolean` (+ `featuredRank?`) |
| Inquiry integration | by `id` ✔ | none — **ID stability is the integration** |

## 2. Proposed types (delta only)

```ts
type ImageLocale = 'all' | 'en' | 'ar';
type ImageRole = 'cover' | 'detail' | 'variant' | 'poster';

interface ProductImage {            // existing fields kept
  card: string; full: string; width: number; height: number;
  source: { driveFileId: string; locale: Locale; drivePath?: string; status?: 'valid' | 'remapped' | 'orphaned' | 'deleted-by-decision'; sha256?: string };
  // new, all optional
  locale?: ImageLocale;             // default: the locale key it sits under today
  role?: ImageRole;                 // default: first image = 'cover'
  alt?: Localized;                  // per-image alt (component name for details: "Wardrobe detail")
  hasEmbeddedText?: boolean;        // true ⇒ never use as a card thumbnail if a clean cover exists
  focal?: [number, number];         // 0–100 % x,y for object-position
  ratio?: '16:9' | '4:3' | '3:4' | '1:1' | string;  // derived at build from width/height, stored for card rules
}

interface Product {                 // existing fields kept
  alsoIn?: string[];
  featured?: boolean; featuredRank?: number;
  verification?: 'concept-render' | 'photo-unverified' | 'verified-product';
  customizable?: boolean;
  dimensionProfile?: 'bedroom-standard' | 'kids-standard' | 'dressing-custom' | null;
  components?: { id: string; confirmed: boolean }[];
  images?: ProductImage[];          // new unified gallery; gallery{en,ar} remains until migrated
}
```

Design choices and why:
- **Standard dimensions live in one place** (`messages` + a profile id), never copied into each product, so a product can't accidentally claim "250 × 230" as *its* confirmed size. A product shows the standard block only if `dimensionProfile` is set; per-design confirmed numbers go in `pieces[].dims` (already supported, `null` = unknown, "never invent").
- **Unified gallery** removes the AR/EN duplication that makes sense only for the old paired posters, and satisfies "avoid unnecessary duplication". Migration is additive: `galleryFor(p, locale)` = `p.images` filtered by `locale ∈ {'all', locale}` else falls back to the legacy `gallery`. No existing record has to change on day one.
- **Verification vs illustrative**: today `illustrative` is a single boolean that drives badges/alt text. The richer enum keeps the badge logic working and lets a real photo (e.g. the WhatsApp wardrobe image, if confirmed) be marked differently without touching UI.

## 3. File layout and migration

Keep `src/data/catalog/products.json` for existing 18; add one file per category for new content (`products.bedrooms.json`, `products.dressing.json`, `products.kids.json`, …) merged in `src/lib/catalog/index.ts`. Rationale: 54 products in one JSON becomes hard to review; per-category files keep diffs small. **IDs must be unique across files — add a test.**
`categories.json` gains `dressing-rooms` (sort position to be confirmed — doc 05 §1). The existing filter "category appears only if it has products" means the new category stays invisible until its first product is published (safe rollout).

## 4. Validation (tests to add, replacing the 94-count pin)

1. Every `ProductImage` file exists under `public/` and its stored width/height equals the file's.
2. Every `driveFileId` is in the **new** inventory JSON (`data/catalog-import/drive-inventory-2026-11-09.json`) or marked `orphaned` with a note — replaces `inv.files.toHaveLength(94)`.
3. IDs and slugs are unique across all catalog files; no existing `pv-*` ID disappears (snapshot of ID list, additions allowed).
4. Every product has a cover; `role: 'cover'` appears exactly once; `hasEmbeddedText` cover is allowed only if the product has no clean image.
5. No locale has an empty effective gallery.
6. AR/EN key parity for any new `messages` keys (already enforced by an existing test).

## 5. Unknowns stay unknown

`pieces: []`, `materials: null`, and `dimensionProfile` unset = "to be confirmed during quotation" (already the UI behaviour). Specs visible on posters (e.g. kids-3 infographic "120×200", "Premium Fabric") are **not** imported.

## 6. Effort / risk

Types + loader + tests: **S–M** (0.5–1 day). Risk: low — additive, optional fields; main risk is accidentally letting `images[]` and `gallery` both define a gallery → rule: if `images` exists it wins, enforced by a test.

## 7. Inquiry List and RFQ compatibility (brief §12)

| Requirement | Status under this plan |
|---|---|
| Stable product IDs | Preserved — no `pv-*` removed/renamed; new IDs added (`pv-br-05…`, `pv-kb-04…`, `pv-dg-01…`) |
| Quantity, persistence | Unchanged (`alnasr.inquiry.v1`, `{id, qty, note}`) |
| Thumbnail | derived from the product cover `card` rendition (doc 05 §3.6); no storage change |
| AR/EN identity | name/category resolved from the catalog by ID at render time (already the case) |
| Customization notes | the existing per-item `note` (≤ 300 chars) is the right place; only the **placeholder text** changes (doc 06 §5). No schema change |
| Shipping preferences, RFQ schema | unchanged (`src/features/rfq/schema.ts`); server validates items against the catalog, so new products are accepted automatically once in the data files |
| Hidden/retired products | the one real gap: a stored ID with no product is currently ignored. If Q1 chooses "retire", add a "no longer available" row state (P1, S) — otherwise nothing to do |
| No prices / cart / checkout | unchanged |

## 8. Lifecycle status (added after the 2026-11-09 decisions)

Add `status?: 'active' | 'archived'` to `Product` (default `active`). `archived` = not listed, not in sitemap, no card, **but still resolvable by ID** (Inquiry List/RFQ validation) and its URL answers with a redirect to its category. `deleted-by-decision` image sources can never be re-imported: the importer must refuse any Drive ID on a deny-list (`data/catalog-import/deleted-sources.json`, the 20 IDs).

## 9. Archive model (Decision 2, 2026-11-09)

Details in doc 13. Schema effect: `Product.status: 'active' | 'archived'`, an `archived` block `{ archivedAt, reason: 'legacy-sample', equivalentId: string | null }`, and a **reserved-identifiers list** (`reserved-ids.json`: every legacy `id` and `slug`) so the loader/test refuses to reuse them for a different design. `equivalentId` is non-null **only** after the owner verifies equivalence; it is used for redirect/suggestion, never to rewrite stored data.

## 10. Classification fields (round 4)
`Product.migration?: { class: 'A' | 'B' | 'C'; equivalence?: { status: 'pending' | 'confirmed' | 'rejected'; candidate?: string; evidence?: string; confirmedBy?: string; date?: string } }`. Only `A` + confirmed drives archival; `equivalentId` for redirects exists only when `confirmed`. B products update in place; no duplicate record is created to refresh content.
