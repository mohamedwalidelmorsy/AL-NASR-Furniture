# 06 — Hero (Warm Neutral Luxury Living Room) responsive review

Asset: `Warm Neutral Luxury Living Room (1).png` (1672×941, no text, no people). Delivered as `/images/hero/warm-neutral-living-room-1672.webp` (231 KB) through `next/image` in a **3:2 frame, `object-fit: cover`, centre focus**; two-column layout unchanged. Not modified in this audit.

## Measurements (real browser, `evidence/data/hero.json`)
| Viewport | Lang | DPR | Frame (css px) | Ratio | Served width (`w=`) | px per css px | Sharp? | CLS | Side-by-side | Overflow |
|---|---|---|---|---|---|---|---|---|---|---|
| 1440 | en | 2 | 564×376 | 1.5 | 1280 | 2.27 | yes | 0 | yes | 0 |
| 1440 | ar | 1 | 564×376 | 1.5 | 640 | 1.13 | yes | 0 | yes | 0 |
| 1280 | en | 2 | 568×379 | 1.5 | 1280 | 2.25 | yes | 0 | yes | 0 |
| 1280 | ar | 1 | 568×379 | 1.5 | 640 | 1.13 | yes | 0 | yes | 0 |
| 768 | en | 2 | 707×471 | 1.5 | 768 | 1.09 | **soft** | 0 | stacked | 0 |
| 768 | ar | 1 | 707×471 | 1.5 | 480 | 0.68 | **soft** | 0 | stacked | 0 |
| 390 | en | 2 | 350×233 | 1.5 | 1024 | 2.93 | yes | 0 | stacked | 0 |
| 390 | ar | 1 | 350×233 | 1.5 | 480 | 1.37 | yes | 0 | stacked | 0 |
| 360 | en | 2 | 320×213 | 1.5 | 768 | 2.4 | yes | 0 | stacked | 0 |
| 360 | ar | 1 | 320×213 | 1.5 | 360 | 1.12 | yes | 0 | stacked | 0 |

CLS = 0 in all ten runs; no horizontal overflow; LCP element is the hero image on desktop (served as `_next/image … w=1280/640`).
Screenshots: `evidence/hero/hero-{en,ar}-{1440,1280,768,390,360}.png`, frame-only crops `hero-frame-only-*.png`.

## Visual review
- **Focal point / furniture visibility (1440, 1280):** sofa, armchair, coffee table, plant and wall art all visible; the crop removes ≈ 16 % of the width (left curtain edge, a sliver of the sofa's right arm and the lamp) — composition remains balanced and brand-consistent (warm beiges/walnut/brass match the site palette `#584838`/`#A58B64`).
- **Text readability:** unaffected — text never overlays the image.
- **Sharpness:** desktop and phones are served at ≥ 1× the needed pixels (2.2× on DPR 2). **Tablet (768 px) is soft:** the frame is 707 css px wide but the `sizes` hint says `50vw` (384 px), so Next serves 768 w (DPR 2 → needs 1414) or 480 w (DPR 1 → 0.68×). **ISSUE IMG-02 (Medium).**
- **Layout shift:** none (intrinsic width/height supplied, aspect-ratio fixed).
- **Mobile/tablet composition:** columns stack text-first, so the hero image appears below the first screen on 768×1024 (top at y≈687) and 390×844 (y≈833). This is inherited from the approved layout (UX-04, Low); the floating WhatsApp pill overlaps the hero footnote on 390 px (UX-05).
- **RTL:** AR mirrors correctly (image on the left of the text); the same image is used (no text inside it).

## 3:2 vs the previous 4:5 (visual evidence)
`evidence/hero/hero-PREVIOUS-4x5-emulated-{1280,768,390}.png` re-creates the old frame at runtime (audit-only DOM override of the same page: 4:5, `contain`, the legacy Soft Arc poster, 640 px cap). The old frame showed a marketing poster with printed claims inside a tall box (very tall at 768/390); the new frame shows a clean lifestyle scene in a compact 3:2 box, and the hero fits above the fold on desktop.

**Recommendation: keep the 3:2 frame.** It fits the approved two-column design, is lighter (≈ 60–120 KB served), and removes the dependency on a legacy product. Fix only the `sizes` hint (see 10, P1-2). Do not create a product from this image (no matching catalog record).
