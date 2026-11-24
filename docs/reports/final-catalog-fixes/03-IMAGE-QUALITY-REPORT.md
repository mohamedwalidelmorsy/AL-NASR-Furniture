# 03 — Image Quality Report

- **No fake upscaling**: renditions use `min(target, source width)`; verified in the builder. Detail crops of 300–560 px stay small.
- **Display limit**: product page main image and lightbox are capped at ≈1.15× native size (`displayLimit` in `DetailView.tsx`), so small details render crisp rather than stretched. Test: `e2e/final-fixes.spec.ts` (verified on desktop and 3× DPR mobile).
- **Edge slivers**: automatic detection (outer line ≤ 6 px, ≥ 90 % near-white, content 4 px inside < 60 % bright) trimmed 27 JPEG sources by 1–4 px; list in `data/catalog-import/edge-trim-report.json`. Only derived WebP renditions are cropped; originals untouched. PNG sources were not analysed — any remaining sliver there is not proven and was not cropped.
- **Hero**: 3:2 retained; tablet softness was the `sizes` rule. Measured at DPR 1: 360→served 360 (css 320), 390→480 (350), 768→768 (707), 1280→640 (568), 1440→640 (564). All ≥ rendered CSS width.
- **Loading**: first three category/collection cards `eager`, the rest lazy; hero `priority`.
- **Posters**: unverified EN posters of `pv-lr-01/02/03` replaced by the clean existing AR poster.
- **Not done / honest limits**: no Lighthouse run; edge trimming was validated by the detector and spot-checked in screenshots, not by an exhaustive per-image eyeball; images remain AI-generated concept renders (flagged "Illustrative design").
