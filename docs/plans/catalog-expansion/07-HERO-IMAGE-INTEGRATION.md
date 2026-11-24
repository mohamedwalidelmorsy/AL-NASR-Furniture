# 07 — Hero Image Integration: `Warm Neutral Luxury Living Room (1).png`

## 1. Source file (confirmed, opened, not modified)

| Property | Value |
|---|---|
| Path | `/Users/mohamedwalid/Downloads/Warm Neutral Luxury Living Room (1).png` (found by exact filename search; one match) |
| Format / size | PNG, sRGB, no alpha, 1672 × 941 px (**16:9**, 1.777:1), 2,722,180 bytes; SHA-256 starts `70361746e800c6d9` |
| Content (viewed) | Cream fluted-upholstery 3-seater sofa + armchair with brass details, walnut-and-marble round coffee table, olive tree, large abstract wall art, walnut slat panels, left window with sheer curtain, warm side light. Soft, high-key, warm. **No text/logo, no people.** |
| Focal content | Sofa spans ≈ 40–94 % of width, armchair ≈ 5–26 %, table ≈ 20–54 %; the light source is the left window; right edge has a floor lamp and a plant in the bottom-right corner |
| Provenance | Looks AI-rendered (same style family as the catalog). Treat as an **illustrative concept** like the rest of the site; it shows a living-room set that is **not a catalog product** (no matching record found) — see Q9 in doc 09 |

**Not done:** the file was not edited, recompressed in place, moved or imported into the project. Derived sizes below were generated into a scratch folder only to measure them.

## 2. Current Hero (confirmed from `Home.tsx:8–25`, `page-ctx.ts:64–73`)

Two-column `auto-fit` grid, `minmax(min(100%,400px),1fr)`; left: eyebrow, `h1` (max 16ch), body, two buttons, note; right: a **4:5** frame (`maxHeight 640px`, radius 10, bg `#E9E4DC`) with `Img priority`, `sizes="(min-width:1200px) 560px,(min-width:640px) 50vw,100vw"`, `objectFit: contain`. Image source = first bedrooms product's first image + "illustrative" alt. On narrow screens the columns stack (text, then image).

## 3. Options

| Option | Result | Verdict |
|---|---|---|
| **A. Keep the 2-column hero; swap the image; change the frame ratio from 4:5 to 3:2 and `contain` → `cover`** | Layout, typography, buttons, spacing untouched; only the visual frame's proportions change. Landscape source fills it with ≤ 16 % horizontal crop | **Recommended** |
| B. Same frame at 4:5 with `contain` | 16:9 inside 4:5 → ~64 % of the box would be empty bars; looks broken | Reject |
| C. 4:5 frame with `cover` | Keeps only 36 % of the width (≈ sofa fragment) | Reject |
| D. Full-width background behind the text with a scrim | New look; text would sit on a busy, bright image → needs gradient overlay + contrast work; changes the approved layout | Reject unless you ask for a redesign |

Crop evidence (rendered from the real file in the scratch folder and viewed): 3:2 centred keeps the whole sofa (right arm tip trimmed by ~2 % width) and ~80 % of the armchair; 4:3 @65 % loses half the armchair and the sofa's right end; 5:4 and 1:1 crop the sofa and drop the armchair. → **3:2, `object-position: 50% 50%`** (single value for desktop and mobile; fallback `55% 50%` if you prefer more sofa).

## 4. Proposed implementation (not applied)

1. **Assets** (in `public/assets/hero/`, names proposed): `living-room-640.avif|webp`, `living-room-1100.avif|webp`, `living-room-1672.avif|webp`. Measured with `sharp` on the real file (scratch only): **WebP q80: 39 KB @640, 106 KB @1100, 210 KB @1672; AVIF q55: 21 / 58 / 116 KB** (versus 2.7 MB original). Visual QA of the AVIF/WebP pair on the warm gradients (banding in the soft wall light) is a required acceptance step. Keep the original PNG archived outside `public/` (e.g. `assets-src/`, git-LFS or the Drive) — **never serve it**.
2. **Component:** in `Home.tsx` the right frame becomes `aspectRatio: "3/2"`, `objectFit: "cover"`, keep `borderRadius`, `background`, `priority`. Remove `maxHeight: 640px` (a 3:2 box at 560 px is 373 px tall; the cap becomes irrelevant) — confirm vertical balance with the text column in the browser.
3. **Data:** `ctx.heroImg` stops borrowing a product poster. Add `src/lib/hero.ts` (or a `site-config` entry) with `{src, width: 1672, height: 941, alt: {en, ar}}` and pass `width/height` to `Img` (the wrapper otherwise defaults to 1024×1280, which would give a wrong aspect hint before load).
4. **Responsive:** `sizes="(min-width:1200px) 560px,(min-width:640px) 50vw,100vw"` stays; `next/image` produces the 640/768/1024/1280/1600 variants from the 1672 master (device sizes already configured). On a 390 px phone (DPR 3) the image is ≈ 350 CSS px → the 1100 px variant; no 1672 download on phones.
5. **LCP/CLS:** the hero image is the LCP element → keep `priority` (preload + `fetchpriority=high`), AVIF/WebP, intrinsic `width/height` + CSS `aspect-ratio` → no layout shift. Expected payload on desktop ≈ 60–120 KB. **No Lighthouse/field data exists yet; do not claim a score** — measure after implementation on a production build (acceptance: LCP element is the hero image, CLS 0 attributable to the hero, image bytes ≤ 150 KB at 1280 px viewport).
6. **Contrast:** text stays on the page's own background beside the image (no overlay), so existing contrast values stay valid; image tones `#D8C9B2`-ish blend with the brand palette (`#E9E4DC`, `#A58B64`, `#584838`) — no new colours.
7. **Localization:** the image has no text, so one image serves EN/AR; RTL flips the columns (image on the left) — in RTL the crop focus is the same, composition remains balanced (window left, sofa right). Alt text: EN "Cream upholstered sofa and armchair with a walnut and marble coffee table in a sunlit living room — illustrative design"; AR "كنبة وفوتيه مُنجَّدان بلون كريمي مع طاولة قهوة من الخشب والرخام في غرفة معيشة مشمسة — تصميم توضيحي". Keys: `hero.imageAlt` in both message files.
8. **Overlays (optional, P2):** a small "Illustrative design" pill using the existing badge style, bottom-start of the frame, if you want the hero to carry the same disclosure as product cards. Not added by default.

## 5. Risks and mitigations

| Risk | Mitigation |
|---|---|
| The hero shows a sofa set that isn't in the catalog → buyers may ask for it | Add it as a product (Living Room) or keep the "illustrative" wording; Q9 |
| Warm gradients band in AVIF | compare q55 vs q65; fall back to WebP q82 |
| Changing frame ratio shifts hero height / pushes the fold on small laptops | verify at 1280×720 and 390×844; fix by capping `maxHeight` in `vh` |
| Image is 1672 px: 2× DPR at 560 px column is fine; at ≥1600 px viewport the column is still 560 px | OK; no upscaling needed |

## 6. Acceptance criteria / tests

- Hero shows the new image on `/en` and `/ar`; no other hero text/layout changes (visual diff only inside the image frame).
- `next/image` request for the hero returns AVIF/WebP ≤ 150 KB at 1280 px; `priority` present; no CLS.
- Axe passes; the image has localized alt text; Playwright responsive spec at 390/768/1280 px verifies the frame ratio ≈ 1.5 and image visible.
- Original PNG is **not** present under `public/`.

Priority **P1** · effort **S** (≈ 2–3 h incl. QA) · depends on: your approval of the 3:2 frame (the only visual change) and the asset pipeline (doc 08).

## 7. Visual comparison (round 4)
`evidence/hero-frame-comparison.jpg`: **A** current frame 4:5 `contain` (legacy poster) · **B** new image in the current frame (empty bars — rejected) · **C** proposed 3:2 `cover`. The two-column layout is retained; the 3:2 frame remains a **recommendation pending your visual approval**. No catalog product is created from this image (it stays an illustrative atmosphere image).
