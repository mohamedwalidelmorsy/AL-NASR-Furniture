# 01 — Current-State Audit (production website)

> **Status:** PLANNING ONLY. No application code, catalog data, image or Drive file was changed while producing this package.
> Audit date: 2026-11-09. Evidence labels: **[Confirmed]** read directly from files/Drive · **[Inferred]** deduced · **[Not verified]** not checked.

## 1. What was inspected

`README.md`, `docs/SOURCE-AUDIT.md`, `docs/DEPLOYMENT.md`, `package.json`, `next.config.ts`, `src/lib/catalog/{types,index}.ts`, `src/data/catalog/{products,categories,styles}.json`,
`src/lib/{page-ctx,product-cards}.ts`, `src/components/pages/Home.tsx`, `src/components/views/{DetailView,CategoryView,CollectionsView,InquiryView}.tsx`, `src/components/ui/Img.tsx`,
`src/features/inquiry/storage.ts`, `src/features/rfq/schema.ts`, `scripts/import-drive-catalog.ts`, `data/catalog-import/drive-inventory.json`, `tests/` and `e2e/` (file list + the catalog-count assertions), Git log (3 commits; only `AGENTS.md` untracked).

**Not done:** no browser session was run, so the visual/UX audit of §10 of the brief is **code-based** (inline styles, aspect ratios, components), not screenshot-based. The existing `test-results/` folder was not analysed. No Lighthouse/CWV numbers exist anywhere in the repo ([DEPLOYMENT.md](../../DEPLOYMENT.md) says the same).
No test suite was executed for this audit (not needed for a plan; do not read this document as a statement that tests currently pass).

## 2. Architecture [Confirmed]

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind 4 (tokens only; the approved prototype's inline styles are preserved in JSX) · next-intl 4 · React Hook Form + Zod · `next/image` · Vitest + Playwright/axe. Modular monolith — no DB/CMS.
Routes (per locale `en|ar`): `/`, `collections`, `collections/[category]`, `collections/[category]/[slug]`, `about`, `sourcing-export`, `shipping-payment`, `custom-manufacturing`, `contact`, `inquiry`, `privacy`, `[...rest]`→404; `POST /api/rfq`, `sitemap.xml`, `robots.txt`. Build = 70 static pages (per DEPLOYMENT.md). Indexing is deliberately off.

## 3. Catalog as it exists [Confirmed]

| Item | Fact |
|---|---|
| Categories | 6 (id = slug): `bedrooms`, `kids-bedrooms`, `corner-sofas`, `living-rooms`, `china-cabinets`, `dining-rooms`; a category is only listed if it has ≥1 product (filter in `src/lib/catalog/index.ts`). The brief's 7-category list = these 6 + **Dressing Rooms**. |
| Products | **18** (`pv-br-01..04`, `pv-kb-01..03`, `pv-co-01..03`, `pv-lr-01..03`, `pv-cc-01..03`, `pv-dr-01..02`), all `illustrative: true`, `pieces: []`, `materials: null` |
| Images | 36 WebP pairs (640/1400 px) — **one image per product per locale**; every image is an AI-generated *poster* with embedded marketing text |
| Provenance | `gallery[locale][].source.driveFileId` per image; a test asserts every ID exists in the 94-file inventory |
| Hero | `page-ctx.ts:64` takes the **first bedrooms product's first gallery image** (a poster) and renders it in a 4:5 box with `object-fit: contain` (`Home.tsx:23`) |
| Product ID quirk | Code prefixes and categories don't always match intuition (`pv-co-*` "cocoa/minimal/olive" sofas sit in **corner-sofas**; `pv-lr-*` "soft-arc *corner* sofa / teal sectional / luxury *corner* sofa" sit in **living-rooms**) — the Drive folders were already inconsistent (DEPLOYMENT.md blocker 5). |

## 4. Page-level image handling [Confirmed from code]

| Surface | Current treatment | Consequence for the new catalog |
|---|---|---|
| Home hero | 4:5 box, `contain`, `priority`, sizes `(min-width:1200px) 560px…` | A 16:9 landscape image letterboxes inside 4:5 (see doc 07) |
| Home / Collections category cards | 4:3, `cover`, `objectPosition: center 38%` | Wide room shots (2.3–2.8:1) lose both sides; poster images are cropped mid-body |
| Category page & Collections product cards | `aspectRatio 3/4`, `contain`, bg `#E9E4DC/#FAF9F6`, "Illustrative design" badge | Portrait posters fit; **landscape room shots and 1:1 details get heavy letterboxing** |
| Product detail main | 4:5, `contain`, `maxHeight 80vh` | Same |
| Product detail thumbnails | **Numbered placeholder tiles (`01`, `02`…) with a hatch background — not real image thumbnails** (`DetailView.tsx:156`) | Must become real thumbnails once galleries have >1 image (P0 for multi-image products) |
| Lightbox | Exists (`data-testid="lightbox"`, keyboard handler, focus return) | Reusable as-is |
| Inquiry List | 3:4 `contain` thumb of the card image | Works if `card` rendition is kept per product |
| Image wrapper | `Img` → `next/image` with default width/height 1024×1280 unless given; `formats: [avif, webp]`, `deviceSizes: 360…1600` | OK. Note: pre-converted WebP are fed through the Next optimizer again (double processing) |

## 5. Data model limits vs. the new requirements [Confirmed]

`Product` has: `id, slug, code, categoryId (single), style, unit, sort, illustrative, name, description, pieces[], materials, gallery{en,ar}[]`. `ProductImage` has `card, full, width, height, source{driveFileId, locale}`.
Missing for the new catalog: image **role** (main/detail/variant), image **alt text per image**, **multi-category** membership (`categoryId` is a single string), **standard dimensions / customization block**, **verification status** beyond the boolean `illustrative`, `featured` flag, per-image `hasEmbeddedText`, language-neutral images (today every image is duplicated per locale), and `relatedProducts` is "same category, first 3".
Details and a minimal schema delta are in doc 04.

## 6. Inquiry List / RFQ [Confirmed]

localStorage key `alnasr.inquiry.v1` → `[{id, qty, note}]` (qty 1–99999, note ≤300). Unknown IDs are ignored but retained. RFQ validates items against the catalog **server-side** ("items must exist in the catalog", DEPLOYMENT.md).
Implications: (a) **never delete or rename a `pv-*` ID** without a redirect/alias strategy — a buyer's stored list would silently show nothing and a submitted RFQ would 4xx; (b) product slugs are used in URLs (36 detail URLs asserted by `e2e/integrity.spec.ts:38` = 18 × 2 locales).

## 7. Tests that will need deliberate updates when implementation is approved [Confirmed]

- `tests/content.test.ts:90` hard-codes `inv.files` length **94**; the "PNG originals" test (line ~75) validates originals against the inventory.
- `e2e/integrity.spec.ts:38` hard-codes **36** product URLs.
- Any category-count/name assertions in `e2e/catalog.spec.ts` — **[Not verified]** line by line; review at implementation time.

## 8. Existing importer [Confirmed]

`scripts/import-drive-catalog.ts` works from `drive-inventory.json` (94 PNG, old folder tree, `imageId` naming such as `img-bedroom-sets-ar-01`), assumes **PNG** originals, converts to 640/1400 WebP, needs a Google OAuth token. It will not understand the new tree (JPG/JPEG/PNG mix, nested room folders, no AR/EN folder split). It needs a rewrite or a new inventory file; see doc 08.

## 9. Current limitations summary (ranked)

1. **Catalog identity is image-based, not design-based** (1 image = 1 product); no gallery depth.
2. **Drive provenance is stale**: 26 of the 36 site image records reference Drive file IDs that no longer exist (10 valid, 6 remappable, 14 orphaned, 6 deleted-by-decision — doc 11 §2) (doc 02 §4).
3. Gallery thumbnails are placeholders.
4. Aspect-ratio handling assumes portrait posters.
5. Hero is a product poster, not a dedicated lifestyle hero.
6. No dimensions/customization content; no Dressing Rooms category.
7. Tests/importer pinned to the old 94-file inventory.
8. Launch blockers unrelated to this plan remain (WhatsApp number, e-mail, privacy text, domain, Resend).
