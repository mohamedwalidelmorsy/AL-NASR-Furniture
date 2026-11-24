# 05 — Category accuracy review

Every product was judged by the **furniture it shows** (not its folder or name). Full per-product result: `03-PRODUCT-AUDIT-MATRIX.csv` (`category_check`, `category_note`). Screenshots: `evidence/screens/category-*-{en,ar}-1280.png` (+ 390).

| Category | Listed | Correct | Findings |
|---|---|---|---|
| Bedroom Sets | 12 | 12 | Correct, but 4 legacy + 4 new records are duplicates of each other (see 04). |
| Dressing Rooms | 6 | 6 | Correct; all six galleries belong to their own design (checked image by image). Dressing 1/3/5 share a visual family but are distinct compositions. |
| Kids' Bedrooms | 11 | 11 | Correct. Legacy `pv-kb-01/02/03` are different designs from all new rooms. |
| Corner Sofas | 10 | 7 primary + 3 cross-listed | `pv-co-03` **Olive Curve Sofa is a straight/curved sofa, not a corner sofa** (should be Living). `pv-lr-01/02/03` **are corner sofas** and appear here only through `alsoIn`. |
| Living Room Sofa Sets | 14 | 13 primary + 1 cross-listed | `pv-lr-01 Soft Arc Corner Sofa`, `pv-lr-02 Teal Sectional`, `pv-lr-03 Luxury Corner Sofa` are corner sofas filed under Living Rooms. `pv-lr-09 Classic White Chaise` is a single chaise (acceptable; not a "set"). `pv-lr-06 Harmony Living Room Set` is a real set. |
| China Cabinets | 4 | 4 | Correct. |
| Dining Room Sets | 2 | 2 | Correct; both posters also show vitrines/sideboard → legitimately discoverable under China Cabinets too. |

## Corner ↔ Living facts (evidence from the 20 posters)
- Corner/L/U/sectional shapes: `pv-co-01`, `pv-co-02`, `pv-co-04…07`, **`pv-lr-01`, `pv-lr-02`, `pv-lr-03`**.
- Straight/curved sofas, chaise, living set: `pv-lr-04…13`, **`pv-co-03`**.

## Cross-listing: legitimate vs incorrect
- **Legitimate:** a dining set that visibly includes display cabinets (`pv-dr-01/02`) discovered under China Cabinets; a Dressing Rooms ↔ Bedroom Sets link (already implemented as a link, not duplicate records).
- **Workaround, not a fix:** `alsoIn` currently masks the 4 wrong primary categories. Side effects: card → URL under the *other* category (breadcrumb "Living Room Sofa Sets" although the buyer came from Corner Sofas), and `/corner-sofas/<slug>` returns 404 (UX-01).

## Recommended customer-facing classification (B2B importers)
1. **Corner Sofas** = L-shape, U-shape, sectionals/corner units. **Living Room Sofa Sets** = straight/curved sofas, chaise, and multi-piece living sets.
2. Move `pv-lr-01/02/03` to `corner-sofas` and `pv-co-03` to `living-rooms` — **same product ID**, new URL, with permanent redirects from the old URLs (the design is unchanged, so this is not a replacement). Keep `alsoIn` only for genuine overlaps (dining sets ↔ China Cabinets).
3. Keep Dressing Rooms independent; keep the Bedroom ↔ Dressing link.
4. Owner to confirm the Arabic category names for Gulf buyers (AR-04).
