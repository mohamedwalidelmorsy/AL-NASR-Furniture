# Source audit — Claude Design prototype → production

**Source:** `Al Nasr Furniture prototype (1).zip` (Downloads, 2026-11-07 21:23, 13.6 MB, `unzip -t` clean), extracted to `_source/` (95 files, made read-only).
An older archive (`Al Nasr Furniture prototype.zip`, Oct 27, 85 KB: no images, 111 KB template, 46 KB content, 3.5 KB notes) was inspected and **not used** —
the newest archive is a strict superset. The original ZIP is untouched in Downloads.

## 1. Source inventory

| Path | Role |
|---|---|
| `Al Nasr Furniture.dc.html` (141 KB, 1593 lines) | Whole site as one `<x-dc>` template (`sc-if`/`sc-for` + `{{ }}` bindings, inline styles with `style-hover/-focus`) and a `Component extends DCLogic` (routing, state, RFQ, gallery) |
| `site-content.js` (103 KB) | `window.ALNASR`: config, countries, categories, styles, 18 preview products, `i18n.{en,ar}` (37 namespaces) |
| `support.js` (69 KB) | Generated "dc-runtime" (loads/renders the template). Prototype tooling only — not ported |
| `IMPLEMENTATION-NOTES.md` | Phases 4 / 5a decisions, claim-control rules, pending-data checklist |
| `uploads/01–03-*.md`, `uploads/source_doc-*.md` | Blueprint, wireframes, design system, approved Arabic business content |
| `assets/furniture/**` (72 WebP) | 36 images × 640/1400 px for 18 products (AR + EN variant each) |
| `catalog-import/` | `drive-inventory.json` (94 files with Drive IDs, folders, visual audit), `preview-catalog.json`, 10 contact sheets |

**Phase 4 / 5a changes verified present in the source:** new Home (positioning, 6 categories, offer, 4-stage process, projects teaser, RFQ CTA);
About (3-para narrative, vision, network); Sourcing & Export (10-step timeline, QC, inspection examples, guide cards, FAQ);
`shipping-payment` (payment terms, Incoterms EXW/FOB/CFR/CIF, ports, containers, CBM, transit) and `custom-manufacturing` pages;
6 categories incl. Corner Sofas and China Cabinets; RFQ with inquiry type, delivery/payment term, destination port and `?type=` presets;
18 illustrative preview products; AR/EN content parity (key trees equal — enforced by a test).

## 2. Route mapping

| Prototype (hash) | Production | Rendering |
|---|---|---|
| `#/{l}/` | `/{l}` | static |
| `#/{l}/collections` | `/{l}/collections` | static + client search |
| `…/collections/{cat}` | `/{l}/collections/{cat}` (6 × 2) | static (`generateStaticParams`) + client filter |
| `…/collections/{cat}/{product}` | `/{l}/collections/{cat}/{slug}` (18 × 2) | static + client gallery/inquiry |
| `about`, `sourcing-export`, `shipping-payment`, `custom-manufacturing`, `privacy` | same under `/{l}/` | static |
| `contact[?type=…]`, `inquiry` | same under `/{l}/` | static shell + client form / list |
| anything else | `[...rest]` → localized **404 (real status)** | |
| — | `POST /api/rfq`, `/sitemap.xml`, `/robots.txt` | new |

`/` redirects to `/en` (next-intl proxy). Language switch keeps the path.

## 3. Design-preservation strategy

1. **Mechanical markup port.** A one-off converter (not shipped) turned every template section into JSX, preserving the prototype's inline styles,
   class-free structure, copy bindings and ARIA exactly; `style-hover/focus` became generated CSS (`src/app/states.generated.css`, `!important` to match inline-override semantics).
2. **Logic re-expressed, not re-designed:** JS `window.innerWidth` switches → CSS media queries at the same breakpoints (640 / 1024 / 1140), which also removes the hydration flash.
3. **Design tokens** (palette, fonts) are exposed to Tailwind (`@theme`); Tailwind preflight is intentionally not imported so the prototype's reset is the only base.
4. **Evidence:** full-page screenshots of production vs the running prototype at 1280 px and 390 px, EN and AR, for 10 page types = 40 views.
   Document heights are **identical on all 40**; text-only pages differ by ≤0.3 % of pixels (font rasterisation), image pages by ~0.7–15.6 % (re-encoded/resampled images, `next/image`).
   Visual side-by-side inspection of Home (desktop + mobile) showed no layout differences.
5. Deliberate deviations (all improvements, none visual): SSR `<html lang dir>`, `next/font` instead of the Google Fonts `<link>`, `next/image`, real links instead of hash routes,
   WhatsApp accessible name now contains the visible word "WhatsApp" (axe WCAG 2.5.3 — the prototype's markup has the same mismatch in Arabic), logo link name matches its visible text.

## 4. Content & translation architecture

All copy lives in `messages/{en,ar}.json` (generated 1:1 from `i18n.*`). Server components read the full tree; client components receive only the namespaces
they need (`CLIENT_NAMESPACES` in `src/lib/messages.ts`); long static-page copy (about, sourcing, shipping, custom, privacy, home sections) never ships to the browser as JSON. Business config (brand, entity, WhatsApp, e-mail) is in `src/lib/site-config.ts` with env overrides.
`term` (English trade term shown next to Arabic steps/payments) is intentionally Arabic-only.

## 5. Catalog & images

18 products / 6 categories / 36 images (preview). Every image is an **AI-generated marketing poster** with embedded unverified text; the UI labels products
"Illustrative design", pieces/materials/dimensions stay empty ("Set contents to be confirmed"), codes `PV-xx-nn` are internal preview IDs. Source traceability:
each image keeps its Drive file ID (`gallery[locale][].source.driveFileId`); a test asserts every ID exists in the 94-file inventory.

## 6. Inquiry List / RFQ (prototype behaviour → production)

Same storage key and item shape; same dedupe/quantity/note/undo semantics; draft saved to `alnasr.rfqDraft.v1`. Validation moved to a shared Zod schema (browser + server).

## 7. Technical risks & unresolved dependencies

See [DEPLOYMENT.md → Launch blockers](DEPLOYMENT.md#launch-blockers). Highlights: no WhatsApp number / sales e-mail / domain / privacy text; no e-mail provider credentials;
58 of 94 Drive images not yet imported and awaiting a classification decision; AR product names transcribed at low resolution; in-memory rate limiter is per-instance.
