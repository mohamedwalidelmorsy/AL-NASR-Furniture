# 04 — Duplicate / matching design comparisons

All images are built from the **files actually used by the website** (`public/…webp`), side by side, in `evidence/compare/`. Rule used: "same design" only if multiple distinctive features match (headboard shape, bench/nightstand/wardrobe/vanity forms, colour palette, hardware) — a different scene or lighting alone is not enough. All classifications are **visual evidence only; the owner must confirm before any redirect/archival** (none was performed).

| # | Records | Evidence | Classification | Matching / differing features |
|---|---|---|---|---|
| 1 | `pv-br-01` Soft Arc ↔ `pv-br-12` Arc-Headboard (room 8) | `case1-softarc-vs-arc-headboard.jpg` | **Same design — high confidence** | Identical stacked-arch headboard with LED line, striped bedding, silver bench with circular medallions and legs, round/oval vanity mirror, same nightstand with ring pull. The new set adds a curved-inlay wardrobe (not shown in the poster). |
| 2 | `pv-br-02` Curve ↔ `pv-br-08` Curved-Headboard Bench (room 4) | `case2-curve-vs-curved-headboard.jpg` | **Same design — high confidence** | Same swooping padded headboard in wooden frame, stepped bench with drawer and raised shelf, same nightstand, same cream/walnut finish pairing. |
| 3 | `pv-br-03` Upholstered ↔ `pv-br-09` Padded-Headboard (room 5) | `case3-upholstered-vs-padded.jpg` | **Same design — high confidence** | Identical two-stacked rounded textured headboard panels in a wood frame, bedside unit with identical black-and-gold rectangular handle and glow strip, matching front bench. |
| 4 | `pv-br-04` Luxe ↔ `pv-br-07` Cream Panel (room 3) | `case4-luxe-vs-cream-panel.jpg` | **Same design — high confidence** | Nearly the same hero scene: cream tall headboard, marble-look wall, bench with wooden inset, fluted glossy wardrobe with dark glass, round-mirror vanity. |
| 5 | `pv-kb-03` Study Nook ↔ `pv-kb-11` Teddy-Theme (kids room 8) | `case5-studynook-vs-teddy.jpg` | **Different design — high confidence** | Different headboard (arched cream with wall lights vs rectangular padded in walnut frame), different wardrobe finish (grey vs walnut), legacy set includes a bookshelf unit; the new one does not. Only the teddy/wall-art styling is shared. |
| 6 | `pv-lr-04` Sculpted Modern ↔ `pv-lr-07` Sculpted White | `case6-sculpted-modern-vs-sculpted-white.jpg` | **Different design — moderate-high confidence** | Different arm treatment (wood wedge inlay vs rolled arm with metal wedge leg), different cushion build (large bolster blocks vs ribbed channels). Same family/style. |
| 7 | `pv-lr-10` Plush Curve ↔ `pv-lr-07` Sculpted White | `case7-plush-curve-vs-sculpted-white.jpg` | **Same design — high confidence (probable)** | Same ribbed channel cushions, same rolled arm profile, same tapered metal feet and ivory fabric; shown in a different two-sofa scene. Owner to confirm. |

## Additional checks (beyond the 7)
| Check | Evidence | Result |
|---|---|---|
| Legacy kids `pv-kb-01/02` vs all 8 new kids rooms | `case8-legacy-kids-vs-all-new-kids.jpg` | **Different — high confidence**: Arch Line (white arch wardrobe + walnut) and Butterfly Charm (butterfly headboard) match none of the new rooms. |
| `pv-cc-03` Curved Display Cabinet ↔ `pv-cc-04` Modern Buffet & Display (and cc-01/02) | `case9-china-cabinets-family.jpg` | **Different — high confidence** (same palette/template; different cabinet forms and mirror shapes). |
| `pv-cc-04` AR vs EN poster pairing | `case10-cc04-ar-vs-en-pairing.jpg` | Same design in both languages (pairing correct). |
| Multiple views treated as separate products? | contact sheets of every room (planning evidence) + product pages | **None found** in bedrooms/kids/dressing: each room folder is one product with its details as gallery items. |
| Different designs grouped into one product? | gallery review of all multi-image products | **None found.** (Dressing 1/3/5 are the same "glass-door wardrobe" family but distinct compositions → kept separate.) |
| China/Dining poster #1 | Drive files (not published) | AR#1 and EN#1 are **not** the same design (AR#1 = oval-table set ≈ `pv-dr-01`; EN#1 = square-table set ≈ `pv-dr-02`) → correctly not published. |

## Consequence
Confirmed pairs 1–4 and 7 mean **two active records exist for the same design**. Because buyers may already hold the legacy IDs, the safe fix is to keep the legacy record (ID/URL) and move the clean gallery onto it, then hide the new duplicate record — see 10 (P0-1, P0-2).
