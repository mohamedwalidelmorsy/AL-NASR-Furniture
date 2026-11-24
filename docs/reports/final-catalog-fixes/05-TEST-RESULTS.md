# 05 — Test Results (run 2026-11-09, local)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx eslint .` | clean |
| `npx vitest run` | 9 files, 89 tests passed |
| `npx next build` | succeeded |
| `npx playwright test` (production build on :3100, desktop + mobile, incl. axe) | 237 passed, 9 skipped, 0 failed |

New: `tests/final-fixes.test.ts` (merge map, duplicates not routable, counts add up to 48/3/4, both sofas active, generated 308s permanent/locale-preserving/loop-free, `migrateMergedItems` incl. both orders + idempotency, category moves, units, Arabic plurals, unique descriptions, hero `sizes`) and `e2e/final-fixes.spec.ts` (real 308s EN+AR, canonical/hreflang/sitemap, 8 bedrooms, archived pages EN+AR, persisted archived/merged Inquiry lines, RFQ excludes archived, API `archived_item`/`merged_item`, units, Arabic count, 404 title, hero served width, display limit).

Tests updated, not relaxed in intent: obsolete premises were replaced — class-B count 11→15 (4 approved merges), sofa dual-category test → single-category moves, `PV-KB-01` search → `PV-KB-04`, lightbox "single control" → focus stays inside dialog with N controls, language test uses a product that really has separate EN/AR artwork, AR Dressing h1 «غرف ملابس».

Not tested: real e-mail delivery (no Resend credentials), WhatsApp, production domain, Lighthouse.
