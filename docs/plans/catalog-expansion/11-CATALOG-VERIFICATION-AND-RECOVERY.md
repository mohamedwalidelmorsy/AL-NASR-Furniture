# 11 — Catalog Verification & Recovery Assessment

Date 2026-11-09. Read-only work; **no production code, images, catalog records or Drive files were changed.** Supersedes the Trash/kids parts of docs 02, 03, 08, 09 (already updated).

## 1. Trash status (request 1) and the owner decision

- **Connector evidence:** the folders `اطفال/عربي` (`1IQ9u1cZ…`) and `اطفال/انجليزي` (`1ZzmdLIQ…`) report `trashed: true`; the 20 files inside report `trashed: false` individually (they are trashed through their parent) and are still listed. `modifiedTime` of the folders (2026-11-08 11:49) is **not** a deletion time; the connector exposes no `trashedTime`, and a `trashed = true` search returns nothing. So the exact deletion/purge date **cannot be verified from here** — and no longer matters.
- **Decision (owner, 2026-11-09): deleted on purpose. Do not recover, restore, copy or use. Exclude from the active catalog.** Nothing was or will be restored/copied/deleted by this project. The CSV now has a `catalog_status` column (`active` = 117, `EXCLUDED – deleted by owner decision` = 20).
- Guard rail for implementation: importer deny-list of the 20 IDs + "skip any file with a trashed ancestor" (doc 08 P0-4).

## 2. The 26 obsolete references vs local files (request 2)

Method: for all 36 image records in `products.json` I checked that the `card` (640) and `full` (1400) files exist under `public/` and that their real pixel size equals the width/height stored in the JSON; then classified the stored `driveFileId` against the live active inventory (by ID, else by exact byte size of the original).

| Finding | Result |
|---|---|
| Missing website image files | **0 of 72** — every card/full file exists and matches its stored dimensions. The website images are intact |
| Dead source references | **26** (the site is unaffected; only traceability is) |
| ├ remappable to an active file (identical bytes) | **6** — `pv-co-01/02/03` AR, `pv-lr-01/02/03` AR (now in `ركن`/`انتريه`; two of the six sit in the "other" folder) |
| ├ orphaned (no counterpart anywhere) | **14** — `pv-br-01…04` AR+EN (8), `pv-co-01/02/03` EN (3), `pv-lr-01/02/03` EN (3) |
| └ deleted-by-decision | **6** — `pv-kb-01…03` AR+EN |
| Valid references | 10 — `pv-cc-01…03`, `pv-dr-01/02` AR+EN |
| `.catalog-cache/originals` (local PNG originals) | empty; no ChatGPT/room originals found elsewhere on the Mac. **The local WebP files are therefore the only surviving copies of the 14 orphaned and 6 deleted images** |
| Resolution of local copies | `full` renditions are 1024–1122 px wide = the originals' native width (the importer never upscales), WebP q82 lossy |

**Dependencies on the local assets that must be reviewed before anything is removed** (found by grep):
- `page-ctx.ts:64` — the Home hero currently uses `pv-br-01`'s image (hero swap removes this).
- `e2e/helpers.ts`, `e2e/a11y.spec.ts`, `e2e/integrity.spec.ts` hard-code `/collections/bedrooms/soft-arc-bedroom-set` (= `pv-br-01`).
- `e2e/catalog.spec.ts` CATEGORIES list and `integrity.spec.ts` seeds include `kids-bedrooms`; `integrity.spec.ts:38` expects 36 product URLs.
- Inquiry List localStorage / RFQ item validation (any ID, incl. archived).
- `sitemap.ts` and `generateStaticParams` (derive from data).
**Rule:** local files are preserved until a reviewed cut-over PR replaces these dependencies. Provenance for the 20 non-valid records becomes `orphaned` / `deleted-by-decision`, never a made-up ID.

## 3. Visual audit procedure for the 117 active images (revised: no new dependencies)

| Step | What | Tooling / permission |
|---|---|---|
| 0 Fresh inventory | list the active tree via the Drive connector, drop files with a trashed ancestor and the 20 deny-listed IDs, diff against the 117 | existing read-only connector |
| 1 Download | all 117 (≈ 170 MB) into a git-ignored scratch folder. The connector already downloaded ≈ 45 images in this project without any extra permission; 117 calls is feasible. Alternative: the owner runs the repo importer with their own read-only token (`drive.readonly`). **The assistant does not mint tokens or bypass permission prompts.** | existing connector (default) or owner-run script |
| 2 Machine pass | Pillow + NumPy (installed): dimensions, format, SHA-256, difference-hash (near-duplicates), normalized-correlation (detail ⊂ main), aspect/resolution flags | **no new dependency** |
| 3 Contact sheets | one per room/poster family, labelled with file ID and name | Pillow |
| 4 Eye pass | classify role (cover/detail/alternate/different-design/unusable), embedded text (EN/AR), render vs photo, group, confidence; ambiguous items → owner | assistant + owner |
| 5 Output | `drive-inventory-<date>.json` + review table; nothing written to Drive | — |
Optional only if the owner wants automation of the "embedded text" flag: `tesseract` with `ara`+`eng` (not installed; **not required**). OpenCV/imagehash are **not** needed. Effort ≈ ½–1 day incl. ~20 min owner review.

## 4. Recovery of older kids images (request 4)

**Not applicable — the owner deleted them deliberately.** No recovery, restore or copy is proposed. (Had it been needed, the safest route would have been owner-side "Restore" in the Drive Trash UI — never a copy from this tooling.) The only remaining engineering consequence is the deny-list in §1.

## 5. Existing products: disposition (superseded by the owner's A/B/C rule — doc 13 §1–2)

- **B (continuing, verified by identical bytes): 11** — `pv-co-*`, `pv-lr-*`, `pv-cc-*`, `pv-dr-*`: keep ID/slug/URL; update provenance/metadata only.
- **C (uncertain): 7** — `pv-br-01…04` (candidates rooms 8, 4, 5, 3; evidence images) and `pv-kb-01…03` (leaning A). No remap/redirect/archive until the owner decides.
- **A (superseded): none confirmed yet.** Confirmed A → archive with reserved ID/slug.
Local legacy images stay until every dependency (§2) and test is updated. Legacy posters print unverified claims ("Made in Egypt", "Romanian Red Beech Wood"); those claims are removed only when a product's images are actually replaced.

## 6. Final grouping method (request 6): one design vs several views

A **design** is a physical product concept (one headboard shape, one wardrobe door pattern, one material palette, one vanity/mirror shape, one bench/nightstand style). **Views** of it are main shot, detail crops, alternate angles.

1. **Candidate group = source folder** for bedrooms/dressing/kids (owner already grouped them); posters = one design per poster; never merge across folders.
2. **Role per image (reviewed on contact sheets), exactly one of:** `cover` (full room/complete set), `detail` (crop/close-up), `alternate` (same design, other angle/lighting), `different-design`, `unusable` (collage artefact, infographic, <400 px).
3. **Same-design test = ≥ 3 of 5 signature features match** (headboard, wardrobe doors, finish palette, vanity/mirror, bench/nightstand) **or** the machine proof that a detail is a crop of the cover (§3 step 2). Filename series `01_Main + 02…0n_*_Detail` counts as strong evidence; *timestamp adjacency of `ChatGPT Image` files is NOT evidence* — the old inventory shows consecutive timestamps (-1…-10) were ten different designs.
4. `different-design` inside a folder → split into a new product (`pv-br-NN`) with its own gallery; flagged to the owner.
5. A design needs **1 cover + ≥ 2 distinct images** to be published; otherwise it waits (dressing 1/2/5/6 fail this today).
6. Gallery order: cover → alternate(s) → details in a fixed order (bed/headboard → wardrobe → dressing table → nightstand → bench → drawer).
7. Every decision is logged (group id, rule applied, confidence); `confidence: low` blocks publication.

## 7. Dressing Rooms category (request 7)

Keep the recommendation: **independent top-level category**, link from Bedroom Sets, publish when ≥ 2 designs have a suitable cover (doc 14 §6 explains why not 3). Cover requirements: complete view of the unit (wardrobe wall/walk-in), ≥ 1400 px on the long side, landscape ≥ 4:3 (or 3:2), no embedded text, no unrelated furniture dominating, source file in an active folder. Today: designs 3 (1122×862) and 4 (1122×784) qualify marginally (< 1400 px: serve native); 1, 2, 5, 6 have only 366–443 px detail crops → **not publishable**. Full reinspection of all six folders is in doc 14 §6: D3 and D4 are good covers, D1 marginal, D2/D5/D6 unusable as covers; every folder is missing numbered files.

## 7b. Hero (request 8)

3:2 frame, `object-fit: cover`, `object-position: 50% 50%` remains the **recommendation pending your visual approval** of the cropped result (crop evidence rendered from the real file; see doc 07). No change made.
