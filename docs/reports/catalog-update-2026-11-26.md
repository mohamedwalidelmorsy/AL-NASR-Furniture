# Catalog update + payment terms — 2026-11-26

Scope: owner request of 2026-11-26. Catalog automation is postponed; the research is kept in
[docs/plans/catalog-automation/AL-NASR-CATALOG-AUTOMATION-PLAN.md](../plans/catalog-automation/AL-NASR-CATALOG-AUTOMATION-PLAN.md).

## Drive reconciliation (read-only)

| Listing | Images |
|---|---|
| 2026-10-27 | 94 |
| 2026-11-09 | 133 |
| 2026-11-26 | **236** |

What the 236 images are:
- **37** have the same Drive id as on 2026-11-09 (Dressing, China/Dining).
- **134** were re-uploaded on 2026-11-19 under new ids:
  - the old folders were trashed;
  - the files were matched by filename and byte size, and one was spot-checked by SHA-256 (identical);
  - this includes the 40 Oct-27 bedroom/kids AR+EN posters.
- **65** are new. All 65 were downloaded, SHA-256 hashed and visually reviewed.

Two 2026-11-09 images no longer exist in Drive. Their published web copies are kept and flagged `orphaned`.

Files:
- `data/catalog-import/drive-inventory-2026-11-26.json`: full listing, re-upload map, duplicates.
- `data/catalog-import/catalog-update-2026-11-26.json`: hand-reviewed grouping and the exclusions.
- `data/catalog-import/asset-manifest-2026-11-26.json`: source → web rendition → product.
- `scripts/build-catalog-update.mjs`: idempotent. It refuses an original whose SHA-256 differs from the inventory.

## Catalog changes

**New products: 28.** Active products go from 48 to 76.

| Category | New products | Products |
|---|---|---|
| Bedrooms | 7 | `pv-br-13`…`19` (Drive rooms 9–15) |
| Kids | 6 | `pv-kb-12`…`17` (Drive rooms 9–14) |
| Corner sofas | 9 | `pv-co-08`…`16` |
| Living | 6 | `pv-lr-14`…`19` (4 sets, 2 sofas) |

How the new products were built:
- **Bedrooms and kids:** one Drive room folder is one product.
- **Corner and living:** these folders are flat, so images were grouped by visual comparison. Names printed on posters are used as-is; other names describe only what is visible.
- **Specifications:** no materials, dimensions or specifications are stated. Every new product is `illustrative` with `pieces: []` and `materials: null`.

**Extra images on existing products:**
- `pv-kb-05`: wardrobe interior detail. This closes the 2026-11-09 source gap.
- `pv-lr-13`: room view with the matching armchair. Owner confirmation requested.

**Image sources:** 223 existing image sources were re-pointed to the re-uploaded Drive ids (`remapped`, previous id kept). 4 are `orphaned`, and their local web images are kept.

**Excluded:**

| Drive file | Reason |
|---|---|
| `1Wded…` | Byte-identical duplicate (SHA-256) |
| `1fb78…` | Visual duplicate of `pv-co-11` |
| WhatsApp photo (bedroom room 8) | Unpublished; earlier decision kept |
| Kids room 3 infographic | Unpublished; earlier decision kept |

**Renditions:**
- 128 new WebP files. They use the existing standard: 640/1400 px, quality 82, never upscaled.
- `public/images/catalog` grows from 15 MB to 26 MB.

## Payment terms

The site now shows exactly **T/T or L/C** (Arabic: **T/T أو L/C**).
- **Shipping & payment guide:** two cards, with no intro, explanation or note.
- **FAQ:** answer updated in EN and AR.
- **RFQ form:** options are `tt` and `lc`. A browser draft that still holds a retired value drops it on restore.
- **Removed:** 30/70 deposit, L/C-at-sight conditions and all explanations.

## Owner review — decided 2026-11-26 (visual review report)

All four recommendations were approved by the owner:

| # | Item | Decision | Applied in data |
|---|---|---|---|
| 1 | `pv-br-15` / `pv-br-17` | Keep as two separate products | `pv-br-17` bed-detail image (gold-strip headboard) removed; that product now has 3 images |
| 2 | `pv-co-08` | One product shown in two colours | Kept as is |
| 3 | `pv-lr-13` extra image | Shows the Pearl Ribbed Sofa | Kept as is |
| 4 | `pv-co-11` vs `1fb78…` | Exclusion confirmed | Kept as is |

Each decision is recorded as `review.decision` in the catalog data and as `decision` in `catalog-update-2026-11-26.json`.

All images are still AI renders, so the "Illustrative design" label stays.
