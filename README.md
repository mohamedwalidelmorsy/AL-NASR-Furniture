# AL NASR FURNITURE — production website

Bilingual (Arabic RTL / English LTR) B2B furniture catalog and lead-generation site for an Egyptian furniture export brand.
No checkout, cart or public pricing: the conversion flows are **WhatsApp** and **Request a Quotation**.

This is a faithful production port of the approved Claude Design prototype (archived read-only in [`_source/`](_source/)).
See [`docs/SOURCE-AUDIT.md`](docs/SOURCE-AUDIT.md) for the audit, route map and design-preservation strategy and
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for configuration, deployment and launch blockers.

## Run locally

```bash
npm install
cp .env.example .env.local      # optional — everything works without it (WhatsApp/e-mail show "PENDING")
npm run dev                     # http://localhost:3000  → redirects to /en
```

| Command | What it does |
|---|---|
| `npm run build && npm start` | production build / server |
| `npm run lint` · `npm run typecheck` | ESLint · `tsc --noEmit` (strict) |
| `npm test` | Vitest unit + component tests |
| `npm run test:e2e` | Playwright (builds, starts the app on :3100, desktop + mobile projects; first run: `npx playwright install chromium`) |
| `npm run catalog:import` | Drive catalog importer (status by default; see script header for `--download/--convert`) |
| `npm run catalog:extract` | Re-derive `messages/*.json` and `src/data/**` from `_source/site-content.js` (one-time migration tool) |

## Stack

Next.js 16 App Router · React 19 · TypeScript (strict) · Tailwind CSS 4 (design tokens + utilities) · next-intl 4 (routing,
messages, hreflang) · React Hook Form + Zod · Route Handler for the RFQ API · `next/image` · Vitest · Playwright (+ axe-core).
Modular monolith: no database, CMS, state library or microservice.

## Structure

```
_source/                      archived Claude Design export (read-only; never edited)
messages/{en,ar}.json         all UI + business copy (migrated 1:1 from site-content.js)
data/catalog-import/          Drive inventory (94 files, IDs, audit), contact sheets, import report
public/assets/furniture/…     catalog renditions (640 / 1400 WebP, per category and language)
scripts/                      extract-prototype-data.mjs · import-drive-catalog.ts (+ lib)
src/
  app/[locale]/…              routes: / collections[/category[/product]] about sourcing-export
                              shipping-payment custom-manufacturing contact inquiry privacy (+404)
  app/api/rfq/route.ts        POST /api/rfq  (thin wrapper over features/rfq/server/handler)
  app/{sitemap,robots}.ts · app/states.generated.css · app/globals.css
  components/{layout,pages,views,ui}   server page sections · client interactive views · A / Img wrappers
  data/catalog/*.json · data/countries.json   typed catalog source (products, categories, styles)
  features/inquiry/           localStorage-backed Inquiry List (useSyncExternalStore store)
  features/rfq/               shared Zod schemas · payload builder · browser client · server handler + delivery adapter
  i18n/                       next-intl routing + request config · proxy.ts (locale redirect)
  lib/                        catalog API, messages, links, SEO helpers, site config, rate limiter, page context
tests/                        Vitest (content, routing, inquiry, RFQ, gallery)
e2e/                          Playwright (navigation, language/RTL, catalog, inquiry, RFQ, responsive, integrity, a11y)
```

## Key behaviours

- **URLs** are identical to the prototype's hash routes, now real paths: `/{en|ar}/…`. Switching language keeps the page, product
  and Inquiry List; Arabic uses the Arabic image variant of the same product record.
- **Catalog** (`src/data/catalog/*.json`, typed in `src/lib/catalog`): product id/slug/code, category, localized name/description,
  optional `pieces`/`materials` (never invented), per-locale image gallery with `driveFileId` provenance.
- **Inquiry List** keeps the prototype storage key/shape (`alnasr.inquiry.v1`), so existing selections carry over; unknown (stale)
  IDs are ignored but not deleted.
- **RFQ** never fakes success: the browser only shows "Request received" after a real 2xx from `/api/rfq`.
- **Indexing is off** (`robots.txt` disallow + `noindex`) until `NEXT_PUBLIC_ALLOW_INDEXING=true` — deliberate while content is placeholder/illustrative.
