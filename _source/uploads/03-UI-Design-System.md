# AL NASR FURNITURE — UI Design System & Responsive Interaction Specification

**Document:** `03-UI-Design-System.md`  
**Version:** 1.0 | **Date:** 2026-10-25  
**Phase:** 3 — Visual Identity & UI Design System  
**Audience:** Claude (design + website implementation), owner, QA  
**Status:** Steps 1–3 founder-approved; Step 4 is the recommended implementation specification in this handoff, pending explicit owner sign-off. Remaining brand artwork, operational data and actual assets are **PENDING** for Phase 4.

## 0. Authority, priorities and dependencies
Read with `01-Website-Blueprint.md` and `02-UX-Wireframes.md`. **Latest owner decisions supersede earlier provisional language in those documents.** The owner has now approved Phase 2 entirely, including About, Sourcing & Export, Contact, mobile and bilingual UX. The inquiry list is a **dedicated page**, **not** a drawer. Never manufacture contact details, inventory, product specifications, shipping claims, factory ownership, certifications, testimonials, prices or legal statements.

Business is **AL NASR FURNITURE / النصر للأثاث**: Egyptian asset-light **B2B wholesale furniture trading and export coordination** for showrooms, importers, distributors and commercial buyers, initially focused on GCC. Site: corporate + online product catalog, leads captured via onsite RFQ, with separate direct WhatsApp chat. No public price, e-commerce checkout, payments, downloadable PDF catalog or retail cart.

### Approved visual decisions
- **Visual concept:** Editorial + Corporate Minimalism, refined and functional; product-led imagery; spacious but conversion-focused.
- **Logo direction:** **Wordmark**, no separate AN monogram or abstract symbol. The final artwork and Arabic treatment remain **PENDING**; text-based wordmark placeholder only until approved.
- **Palette:** Ivory / Linen / Walnut / Charcoal / Muted Gold, exact tokens below.
- **English font:** Manrope. **Arabic font:** IBM Plex Sans Arabic.
- **Layout:** responsive 12 / 8 / 4-column conceptual grid, with exact rules below.
- **UI component style:** approved standard buttons, sticky header, category & collection cards, product gallery, filters, dedicated inquiry page, compact RFQ, WhatsApp affordance.

## 1. Color tokens
| Token | Hex | Role |
|---|---|---|
| `--color-ivory` | `#FAF9F6` | Default page background |
| `--color-linen` | `#E9E4DC` | Alternate surfaces / panels |
| `--color-walnut` | `#584838` | Primary actions / brand text |
| `--color-charcoal` | `#252525` | Main typography |
| `--color-gold` | `#A58B64` | Restrained decorative accents, **not** low-contrast body text |
| `--color-white` | `#FFFFFF` | Cards / contrast surfaces |
| `--color-muted-text` | `#625C54` | Secondary copy, verify contrast |
| `--color-border` | `#D8D2C9` | Dividers / borders |
| `--color-error` | `#B42318` | Errors on light backgrounds |
| `--color-success` | `#24634B` | Confirmed success states |

Design usage: ~75–85% light neutrals, charcoal for copy, walnut for major CTAs. Gold for sparing separators and microdetails only. Accessible contrast (WCAG AA target) must be tested against the actual backgrounds; do not assume all token pairs pass. Avoid large decorative gradients and overly luxurious gold styling.

## 2. Typography
- Font stack EN: `'Manrope', system-ui, sans-serif` (load only required weights 400, 500, 600, 700).
- Font stack AR: `'IBM Plex Sans Arabic', sans-serif` (same practical weights); use appropriate font subsets, `font-display: swap` and fallback sizing where possible.
- Apply fonts by `lang` at page or content container level; mark product codes, email, phone and reference identifiers as LTR where helpful.

| Type token | Desktop | Mobile | Suggested line-height | Weight |
|---|---:|---:|---:|---:|
| Hero H1 | 56px | 36px | 1.15 EN / ~1.35 AR | 600 |
| Page H1 | 48px | 32px | 1.2 EN / ~1.4 AR | 600 |
| Section H2 | 36px | 28px | 1.25 EN / ~1.45 AR | 600 |
| H3 | 26px | 22px | 1.3 EN / ~1.45 AR | 600 |
| Collection title | 20px | 18px | 1.4 | 600 |
| Body | 16px | 16px | 1.65 EN / ~1.85 AR | 400 |
| Small | 14px | 14px | 1.5 EN / ~1.7 AR | 400 |
| Button | 15px | 15px | 1.3 | 600 |

Prefer fluid `clamp()` scaling between mobile and desktop, not abrupt leaps; test Arabic wrapping, avoid rigid-height heading blocks. Limit readable prose width to ~680px; use clear semantic H1–H3 hierarchy. Minimum essential copy size 14px; form inputs at least 16px on phones to avoid browser zoom.

## 3. Grid, spacing and sizing
- **Breakpoints (CSS viewport):** mobile `<640px`, middle `640–1023px`, desktop `>=1024px`; large desktop `>=1440px` with centered max-width.
- **Grid mental model:** mobile 4 columns / `20px` side padding / `16px` gutters; medium 8 columns / `32px` side padding / `20px` gutters; desktop 12 columns / max content width `1200px` / `24px` gutters. At width 1440px, centered content has 120px margins. At narrower desktop widths use responsive gutters (e.g. 40px), not negative margins.
- **Spacing scale:** 8, 16, 24, 32, 48, 64, 96px (plus 4px micro-spacing).
- **Section vertical spacing:** 96px desktop, 56px mobile. Headline-to-content 32/24px; card gap 24/16px; card internal padding 24/16px.
- **Header height:** 80px desktop; 64px mobile. Account for sticky header on hash anchor and scroll-to-error.
- **Radii:** buttons 6–8px; cards 8–12px; form controls 8px; avoid oversized pill shapes as a default except filter chips.
- **Content layout:** Home hero split text/image 50/50 desktop and stacked text then image mobile. Collections category overview 3 cards per desktop row, responsive 2 then 1/2 mobile depending on actual width. Category listing 3 collection cards desktop, 2 on sufficiently wide mobile, 1 for narrow phones. Detail gallery/info 60/40 desktop, stacked mobile. RFQ content constrained to readable width with inquiry summary beside it desktop and stacked mobile.

## 4. Image and media rules
- All launch product imagery must come from **approved, genuine supplier inventory**; placeholders only in drafts, clearly marked. Do not substitute AI-created product images as real inventory.
- Layout aspect ratio guidelines: **category** 4:3; **collection cards** 3:4 when suitable (fall back gracefully for horizontal complete-room photography); **wide hero** 16:9 if the image is genuinely suitable; **detail gallery** adapt to source/original ratio.
- Protect product fidelity. Do not crop out wardrobe edges, beds, dimensions, or product components for aesthetic consistency. Use `object-fit: contain` / matte background where needed. Thumbnails can crop subtly only when a recognizable composition survives.
- Images: responsive `srcset/sizes`, AVIF/WebP where supported, lazy-load below-the-fold, prioritize hero/LCP, include informative alt in both languages, provide width/height to prevent shifts.
- Gallery: visible thumbnails, click-to-enlarge/fullscreen dialog, Escape-close, focus restoration, arrow navigation where reasonable, swipe gestures mobile; never mix images from different sets.

## 5. UI component inventory (approved styling principles)

### 5.1 Header / navigation
- Sticky 80px desktop / 64px mobile, Ivory background, 1px subtle border, no heavy shadow. Text-based **AL NASR FURNITURE** wordmark until approved final file arrives.
- Primary links: Home, Collections, About Us, Sourcing & Export, Contact. Leading action: Request a Quote. Secondary controls: `EN / AR`, inquiry list link/count (may show 0 or appear on first item, preserve obvious navigation), mobile hamburger.
- Clear current-page state, visible focus, properly labeled mobile menu button; mobile menu closes on route change/Escape; keyboard trap if modal-style menu; respect safe area.
- Language switching preserves current logical page and item, or uses a deliberate localized fallback if translation unavailable; preserve inquiry state.

### 5.2 Buttons and links
- **Primary:** Walnut background/white text; height 48px; radius 6–8px; 15px semibold; effective touch area >=44×44px.
- **Secondary:** transparent/ivory background with walnut border/text, 48px.
- **Tertiary:** text link with hover underline/arrow, suitable for view details.
- Focus-visible must be apparent independent of color; disabled visibly distinct but not an all-purpose replacement for explaining required fields; loading state cannot duplicate submissions.
- Copy/action distinction: `Request a Quote` submits a lead; `Add to Inquiry` builds a shortlist; WhatsApp directly opens chat; never label an RFQ `Place Order` or `Checkout`.

### 5.3 Cards and taxonomy
- **Category card:** true category imagery/name, CTA to listing. **Collection card:** approved set photo, verified name, stable reference code if provided, `View Details`. Never show invented prices, star ratings, discounts, fake sold counts or unjustified "best seller" claims.
- Use subtle hover image treatment (e.g. 1.02x) only on hover-capable pointer devices; the card/link should remain usable without hover.
- Support long Arabic labels and absent optional metadata.

### 5.4 Search / filters / breadcrumbs
- Search categories/collections by localized name, plus verified product code; clearable input and `no results` state.
- Filters depend on genuine catalog fields; hide/disable unavailable facets; active chips removable; preserve selection across pagination where appropriate.
- Breadcrumbs use actual category and collection hierarchy; localized, keyboard accessible, no hard-coded English breadcrumb trails on Arabic pages.

### 5.5 Inquiry list — **dedicated page only**
- Route: `/{lang}/inquiry`; no side drawer. Header item indicator displays unique collection count (do not misrepresent item count as quantity).
- Selected entries show thumbnail, name, reference code when available, requested quantity **with units** (sets/pieces as product dictates), optional notes, edit/remove action; quantity must be integer >=1 unless sales workflow decides otherwise. Do not fabricate minimum order quantity.
- Adding existing same collection should have explicit behavior: update existing entry / ask to revise quantity, **not** silently duplicate. Confirm removal only if necessary; offer easy undo if removal is accidental.
- Persist draft inquiry when navigating and reloading in the same browser (implementation mechanism selected later); do not promise cross-device sync or permanent storage without accounts.
- Empty state: explanatory text + `Explore Collections`; clear selected items after successful RFQ only with intentional confirmation/UX handling, not on submission failure.
- No per-line price, monetary subtotal, delivery calculator or payment step.

### 5.6 RFQ / Contact form
- Same underlying quotation flow whether visitor came from Inquiry List (prefilled collection/quantities) or Contact (general inquiry with no preselected items).
- Fields: buyer name (required), destination country (required), company name (optional), **email and WhatsApp/phone separate fields with at least one valid contact method required**, preferred contact method (select based on available values), optional message/customization details, and selected collections with quantities if present.
- Input errors inline, text-described, linked to fields; validate international phone/email format sensibly without rejecting legitimate numbers. Country dropdown searchable if list long. Support Arabic/English labels; use proper keyboard/input types.
- Show privacy notice / link (text **PENDING legal review**) and any necessary consent according to final chosen processing setup. Never imply a submission happened before server confirms acceptance.
- On submit: prevent double submit; show progress; on confirmed success show a concise thank-you and generic follow-up expectation, plus reference ID **only if backend supplies one**. On failed submission keep all inputs and selected collections, show retry.
- Actual lead destination, email/CRM/storage, consent terms, notifications, spam protection, retention, and security are **PENDING Phase 4/implementation**; front-end mock success is not an acceptable production workflow.

### 5.7 WhatsApp floating action
- Opens the verified official business chat externally without mandatory form. Contextual collection link can prefill product code/name; never include private buyer data in a URL without deliberate consent. Phone number **PENDING**.
- Accessible label `Chat with Sales on WhatsApp`; position bottom corner logical to writing direction without overlaying forms, cookie/privacy notices or sticky mobile CTA; account for safe-area insets. No unexpected auto-open or pop-ups.

### 5.8 System elements
- Toast confirmations for adding/removing items (polite live region), skeletons matching content proportions, helpful empty states, accessible dialogs for image viewing, minimal accordions where helpful.
- Footer: wordmark, grouped nav, verified contact channels, legal/privacy link, language switcher. Socials/address only once verified.

## 6. Responsive & interaction rules — Step 4 proposal
These details are recommended defaults; owner has requested a detailed Step 4 and its review, **not yet issued final sign-off**.

### 6.1 Screen-specific behavior
| Area | Mobile <640px | Tablet 640–1023px | Desktop >=1024px |
|---|---|---|---|
| Nav | 64px sticky, hamburger, inquiry badge, language in accessible menu | compact nav / hamburger if overcrowded | 80px sticky, complete navigation and primary RFQ CTA |
| Hero | stack text then image; CTA early and clearly visible | flexible two columns if legible | split 50/50 editorial layout |
| Catalog | flexible single/two-card grid based on minimum card width; no tiny cards | two cards | three cards |
| Detail | full-width gallery then details/specifications/quantity/actions | adaptive two-column only if practical | approx. 60% gallery, 40% specifications/CTA |
| Inquiry | one entry per row, easy quantity controls; sticky actions only if non-obstructive | generous full-width table/cards | wider list + summary/form accompaniment |
| RFQ | single-column form; software keyboard must not cover Submit | one/two columns according to space | concise two-column fields + readable inquiry summary |
| Floating WhatsApp | obey safe area; avoid sticky CTA overlap | bottom corner | bottom corner |

Recommended minimum card width ~220–260px; allow natural wrap instead of forcing two small cards on narrow phones. No horizontal overflow from Arabic/English mixed copy, tables or long product codes.

### 6.2 Interaction state matrix
| Element | Default | Hover / Focus | Loading / Disabled | Error / Success |
|---|---|---|---|---|
| Navigation | current route visible | underline/focus ring | not needed normally | 404 fallback |
| Add to Inquiry | action available | obvious focus | prevent repeated activation during update | confirmation via non-blocking toast; quantity badge updates |
| Search/Filter | results visible | focus border | skeleton if remote | actionable no results / retry on load error |
| Image gallery | selected thumb emphasized | visible arrows/focus | placeholder while loading | fallback alt + next image if one missing |
| RFQ | editable validated fields | prominent field focus | submit pending state, one request | field errors; saved form after server error; success on real receipt |
| WhatsApp | accessible external action | focus/hover | disable or omit until verified number provided | no fabricated chat success |

### 6.3 Motion and scroll
- Animations restrained: ~150–250ms for micro-interactions; easing natural; no forced parallax or scroll-jacking.
- Respect `prefers-reduced-motion: reduce`: disable zoom/animated transitions except essentials.
- Route changes return scroll to top by default; back to catalog preserves reasonable list context; in-page anchor respects sticky header.
- On opening dialog/menu, manage focus and scroll lock appropriately; close with Escape and restore focus.

### 6.4 Accessibility, localization and content handling
- Target WCAG 2.2 AA: text contrast >=4.5:1 for regular text and >=3:1 for large text/non-text UI where applicable; verify automated and manual.
- Visible `:focus-visible`, semantic buttons/links, form labels, text error associations, aria-live for asynchronous feedback, keyboard support.
- Pointer targets at least 44px where practical, never smaller than WCAG AA minimum. No hover-only access.
- `lang="en" dir="ltr"` and `lang="ar" dir="rtl"` by locale; do not mirror product photography, logos, numerals, or phone codes. Keep page/context when switching locale. Translations are reviewed by a human; avoid pseudo-English in Arabic labels.
- Use responsive content/image dimensions and font load strategy to meet performance goals (aim Core Web Vitals: LCP <=2.5s, CLS <=0.1, INP <=200ms at 75th percentile where measured; not an unverified launch claim).
- SEO: semantic headings, locale-aware paths, appropriate hreflang/canonical mappings, descriptive titles and alt text; sitemap and legal data only after real content ready.

### 6.5 Edge-case flows to QA
1. Guest adds two separate sets, edits quantities, refreshes, and retains inquiry draft.
2. Same product added twice does not create ambiguous duplicate lines.
3. From an empty inquiry, the visitor can still open general RFQ from Contact.
4. Switching from English detail URL to Arabic preserves relevant item and inquiry list.
5. RFQ missing both email and phone reports a clear inline error.
6. Network failure retains selections/entered contact values and allows retry without duplicate submission.
7. Successful submission is shown only after accepted backend response; account registration not required.
8. Phones at 320–390px show no clipped text, hidden CTAs, keyboard obstruction or horizontal scroll.
9. Long Arabic titles/specifications display correctly; IDs/phone/email remain readable LTR.
10. Gallery with one image, absent material specification, or broken image degrades gracefully.
11. WhatsApp link opens only verified number; absent config hides/disables with clear fallback.
12. User with reduced-motion preference and keyboard-only navigation can complete all primary journeys.

## 7. Page-to-component mapping
| Page | Key reusable elements |
|---|---|
| Home | Header, split Hero, category cards, Why Work With Us, sourcing steps, conversion CTA, Footer |
| Collections | Category cards, breadcrumbs, clear taxonomy, Footer |
| Category | Search, real-data filter chips, collection cards, empty/loading/error states |
| Collection Details | Gallery, specifications, quantity, Add to Inquiry, WhatsApp, related sets |
| Inquiry | Dedicated item list, quantity controls, remove, continuation to RFQ; no drawer |
| About Us | editorial image/text blocks, grounded proof/partner explanation, CTA |
| Sourcing & Export | capability blocks, process steps, commercial inquiry CTA |
| Contact / RFQ | contact channels, RFQ form, selected collection summary where applicable |

## 8. Data contract expectations for later build (not invented data)
- Category: stable slug, localized name/description, approved image, display order.
- Collection: stable id/slug, verified reference code if any, category, localized name/description, **approved images associated with that actual set**, units (sets/pieces), optional detailed pieces/dimensions/material/finishes, customization availability **only when confirmed**.
- Inquiry entry: collection id/ref, quantity, unit, optional notes, at most one mutable entry per collection (unless meaningful variants require separate entries).
- RFQ lead: selected entries, name, country, contact method(s), preferred outreach, free-form requirements, consent fields as applicable, server receipt status/reference if real.

## 9. Items explicitly **PENDING** for Phase 4 or launch
1. Final wordmark logo files, Arabic logo lockup and usage/clear-space rules; until then use text placeholder.
2. Signed-off product catalog taxonomy, item names, unique codes, real photos, pieces, dimensions, materials and supplier permissions.
3. Verified WhatsApp sales number, business email, social profiles, company address (if to appear), domain and official legal wording.
4. Business-approved bilingual final copy, export capabilities, geographic/service claims, and translated content.
5. RFQ delivery implementation (backend / inbox / CRM), lead privacy notice and handling, spam controls, validation requirements beyond basic UX, source of truth and analytics.
6. Any shipping availability, MOQ, lead time, warranty, certifications, production volume, customer logos, testimonials; display only if verified and approved.
7. Final review/sign-off of Step 4 responsive/interaction recommendations and any supporting implementation platform choices.

## 10. Design QA / acceptance criteria
- All pages adhere to logo direction, palette, typography, spacing and image treatment.
- Dedicated Inquiry page and multi-product RFQ work without authentication, prices, cart, checkout or payment.
- Direct WhatsApp and onsite RFQ are separate functioning paths; RFQ never simulates production success.
- No false claims or invented content; missing fields fail gracefully.
- Tested EN and AR at 320, 390, 768, 1024, 1440 and wider viewports, with keyboard, reduced motion and form errors.
- All product photos use actual matching assets when provided and preserve composition.
- No inaccessible controls or overlaps on mobile; layout follows design tokens.

## 11. Claude handoff sequence
1. Read `01-Website-Blueprint.md`, `02-UX-Wireframes.md`, then this document in order, resolving conflicts in favor of **latest approved owner decisions** listed in Section 0.
2. First produce a design/implementation plan and list of unresolved Phase 4 assets. **Do not silently invent missing production data.**
3. Implement reusable tokens and components, then page structures and locale-aware navigation, then inquiries/RFQ integration against the chosen real backend.
4. Use clearly marked temporary content only in previews, never in a live release, and validate the acceptance criteria.
5. Seek owner approval for any divergence from locked IA, UX or visual-direction decisions.

---
**End of Phase 3 design document.** Steps 1–3 are owner-approved; Step 4 is the recommended default pending final acknowledgement. Phase 4 will finalize content/assets/operational integrations and the implementation brief.
