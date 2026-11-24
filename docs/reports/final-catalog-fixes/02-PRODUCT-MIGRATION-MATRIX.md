# 02 — Product Migration Matrix

| ID / code | Old URL | Action | New URL / result |
|---|---|---|---|
| pv-br-12 | /bedrooms/arc-headboard-bedroom-set | merged → pv-br-01, 308 | /bedrooms/soft-arc-bedroom-set |
| pv-br-08 | /bedrooms/curved-headboard-bench-bedroom-set | merged → pv-br-02, 308 | /bedrooms/curve-bedroom-set |
| pv-br-09 | /bedrooms/padded-headboard-bedroom-set | merged → pv-br-03, 308 | /bedrooms/upholstered-bedroom-set |
| pv-br-07 | /bedrooms/cream-panel-bedroom-set | merged → pv-br-04, 308 | /bedrooms/luxe-bedroom-set |
| pv-br-01/02/03/04 | unchanged | kept, gallery replaced by duplicate's clean gallery, class B | unchanged |
| pv-kb-01/02/03 | /kids-bedrooms/{arch-line,butterfly-charm,study-nook}-kids-bedroom-set | archived (no equivalent) | archived page, 200, noindex |
| pv-lr-01 | /living-rooms/soft-arc-corner-sofa | moved, 308 | /corner-sofas/soft-arc-corner-sofa |
| pv-lr-02 | /living-rooms/teal-sectional-sofa | moved, 308 | /corner-sofas/teal-sectional-sofa |
| pv-lr-03 | /living-rooms/luxury-corner-sofa | moved, 308 | /corner-sofas/luxury-corner-sofa |
| pv-co-03 | /corner-sofas/olive-curve-sofa | moved, 308 | /living-rooms/olive-curve-sofa |
| pv-lr-07 / pv-lr-10 | unchanged | NOT merged, both active | unchanged |
| pv-dr-01/02 | unchanged | cross-listed in China Cabinets (`alsoIn`) | no duplicate records |

Redirects are generated from data in `next.config.ts` (`catalogRedirects`), apply to `/en` and `/ar`, are `permanent` (308) and verified loop-free by unit test and real HTTP (`curl` and Playwright).

Inquiry mapping: `pv-br-12→01`, `08→02`, `09→03`, `07→04` (qty/note preserved, notes joined with " / ", quantities added if both present).
