# 07 — Visual QA

Script: `scripts/visual-qa.mjs` (runs against the local dev server). Output: `evidence/after/<page>-<width>.png` (70 images) and `evidence/visual-qa-log.json`. Widths: 360, 390, 768, 1280, 1440. Pages: Home EN/AR, Bedrooms EN/AR, Corner Sofas, Living Rooms, Kids AR, product pages, archived kids EN/AR, dressing detail, 404, Inquiry with old saved lines (archived + merged).

- **Horizontal overflow**: 0 px on every page/width.
- **Hero served width**: see 03 (≥ rendered width at all five viewports).
- **Inquiry**: merged line shows combined quantity/note and disclosure; archived row shows "Sample design — no longer available", qty/note, removal control; summary counts only valid items.
- **Before**: audit screenshots in `../full-website-audit/evidence/screens/` (not duplicated). Side-by-side before/after pairs were not generated; compare by file name (same page names for 1280/390).
- Reviewed by eye: Inquiry 390 and Bedrooms AR 1280. The remaining screenshots were captured and overflow-checked but not each individually inspected — treat as spot-checked.
