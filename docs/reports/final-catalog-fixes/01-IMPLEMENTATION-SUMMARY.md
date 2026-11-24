# 01 — Implementation Summary (local only, 2026-11-09)

Nothing was committed, pushed or deployed. No Drive content was modified; no source assets deleted; the 20 intentionally deleted Drive images were not restored.

## Catalog counts (computed from data)
| Measure | Count |
|---|---|
| Total records | 55 |
| Active | 48 |
| Archived (page kept, not orderable) | 3 (`pv-kb-01/02/03`) |
| Merged / redirect-only | 4 (`pv-br-12/08/09/07`) |
| Active bedrooms | 8 |

Category listing counts (cross-listing included): Living Rooms 11 · Corner Sofas 9 · Bedrooms 8 · Kids 8 · Dressing Rooms 6 · China Cabinets 4 (2 own + 2 cross-listed dining sets, no duplicate records) · Dining Rooms 2. Sum of listings = 48 active + 2 cross-listings.

## What changed
1. **Bedroom merges** — kept `pv-br-01/02/03/04` (IDs, slugs, URLs); galleries from `pv-br-12/08/09/07` transferred; duplicates are `status: merged` and 308-redirect (locale preserved), excluded from listings, sitemap and static params.
2. **Inquiry List** — saved lines under a duplicate id are canonicalised explicitly on load: qty and notes preserved, both-ids case adds quantities once (no double lines), origin kept in `from` and disclosed on the row ("Combined with your earlier selection PV-BR-12…"). Idempotent, stable after refresh.
3. **Kids archive** — `pv-kb-01/02/03` render an archived page (HTTP 200, noindex, no add-to-inquiry), stay visible/removable in the Inquiry List, are excluded from RFQ; API returns `422 archived_item` (and `422 merged_item` for merged ids).
4. **Category moves** — `pv-lr-01/02/03` → Corner Sofas, `pv-co-03` → Living Rooms; old URLs 308; canonical/hreflang/sitemap/breadcrumbs follow the new category. Dining sets `pv-dr-01/02` are cross-listed in China Cabinets via `alsoIn`.
5. **Plush Curve (`pv-lr-10`) and Sculpted White (`pv-lr-07`)** remain separate active products.
6. **Posters** — `pv-lr-01/02/03` EN galleries now use the clean AR poster (EN posters carried "Premium Fabric / Durable Frame" claims).
7. **Hero** — still 3:2; `sizes` now `(min-width:1200px) 560px, (min-width:1024px) 48vw, 100vw`. Served width ≥ rendered CSS width at all tested viewports (see 07).
8. **Images** — never upscaled; detail images capped at ~1.15× native display size (main + lightbox); proven edge slivers trimmed (27 JPEG sources, 1–4 px) on derived assets only; only the first three cards eager.
9. **Content** — design-specific EN/AR descriptions (no new facts), context-sensitive units (corner sofa / sofa / chaise / sofa set / bedroom set…), Arabic plural forms, GCC terminology, 404 `<title>`.

Re-run order for the asset pipeline: `node scripts/build-catalog-expansion.mjs` then `node scripts/apply-approved-fixes.mjs` (the builder regenerates `products.expansion.json`).
