# AL NASR FURNITURE — Website Blueprint
**Document:** 01-Website-Blueprint.md  
**Version:** 1.0 | **Date:** 2026-10-25  
**Phase:** 1 — Website Requirements & Information Architecture  
**Status:** Phase 1 baseline approved; specified design/content/operational decisions pending later phases

## 0. Purpose and authority
This document is a handoff-ready requirements baseline for the designer/developer (Claude). It specifies **what** the website must do, without prescribing final wireframes, visual components, copy, tech stack, or implementation. It is based on the user's October 25, 2026 Business Overview & Strategic Operating Brief and decisions in this conversation. Where not explicitly sourced, items are labeled as **UX recommendation** or **pending**. Do not treat assumptions or provisional taxonomy as verified business claims.

## 1. Business and audience
- **Public brand:** AL NASR FURNITURE / النصر للأثاث (supersedes EL OSTAZ FURNITURE). The latter is a supply/manufacturing partner name, not the customer-facing brand.
- **Business:** Asset-light Egyptian **B2B furniture trading, wholesale sourcing and export coordination** with manufacturing/supply and export partners.
- **Initial geography:** GCC countries; exact market ranking not yet selected.
- **Primary buyers:** furniture showrooms, importers, wholesalers, distributors, retail chains.
- **Primary commercial objective:** qualified B2B inquiries and quote requests; follow-up happens with a human sales representative.
- **Important representation rule:** Never state that the brand owns the factory, executes every export function itself, or has certifications/licenses/guarantees unless approved and documented. The legal entity is مؤسسة النصر للاستيراد والتصدير, subject to verification of permissions and wording. Partner names/logos/facilities only with authorization.

### Core user needs
1. Establish that this is a legitimate professional Egyptian furniture supply contact.
2. Browse product categories and real photos quickly.
3. See accurate product set specifications (where provided).
4. Select multiple collections, quantities and customization notes.
5. Submit one quote request, or contact sales on WhatsApp.
6. Understand the general sourcing/order coordination journey.

### Core conversion events
- RFQ successfully submitted (primary).
- WhatsApp sales inquiry initiated (primary).
- Collection page viewed; item added to inquiry list; contact form sent (supporting).
Do not invent business conversion rates or fabricate social proof.

## 2. Approved product and design scope
- **Modern & Minimal**; calm, credible, product-led.
- **Multi-page**; responsive mobile/tablet/desktop.
- **Arabic & English**, full RTL/LTR direction and translated functional labels.
- Use **real approved furniture images**; any placeholders labeled provisional.
- All available genuine furniture types may be represented in the catalog, subject to an actual product inventory and rights to use images.
- **Each collection has a dedicated detail page**, and categories have browsable listing pages.
- **No public prices**: quote only, dependent on volume/specifications/destination.
- **Web catalog only** for launch; no PDF download/request flow as a launch requirement.
- **Multi-product inquiry list** that gathers one or more collections into one RFQ.
- **WhatsApp and RFQ** are the two main conversion paths.
- No retail checkout, cart, online payment, consumer single-item sales flow, or consumer shipping calculator in the launch scope.

## 3. Information architecture (approved baseline)

### Main navigation — 5 destinations
1. **Home** — `/en/` or `/ar/`
2. **Collections** — `/en/collections` or `/ar/collections`
3. **About Us** — `/en/about` or `/ar/about`
4. **Sourcing & Export** — `/en/sourcing-export` or `/ar/sourcing-export`
5. **Contact / Request a Quote** — `/en/contact` or `/ar/contact`

### Contextual/internal routes (not top-level nav)
- **Category page** — `/[lang]/collections/[category-slug]`
- **Collection detail** — `/[lang]/collections/[category-slug]/[collection-slug]`
- **Inquiry list / RFQ** — `/[lang]/inquiry` (reachable from persistent header action and product detail pages)
- **Privacy policy** — `/[lang]/privacy` (needed before collecting personal information; final text subject to legal review)
- **404 / error / form status** — routes or states as appropriate.

Route paths are **recommended information architecture**, not a final stack/routing decision. Use stable IDs and localized labels; URLs may retain English slugs consistently.

### Navigation behavior
- Primary nav: logo, five destinations, language switcher, prominent Request a Quote action; WhatsApp visible without dominating layout.
- Inquiry list shows selected-item count and remains accessible across browsing.
- Footer: essential links, contact info when supplied, language choices, privacy policy, company/legal details only after approval.
- Mobile: accessible collapsed navigation and clearly reachable inquiry and WhatsApp actions.

## 4. Page requirements (functional content matrix)

### 4.1 Home
**Purpose:** Introduce brand, prove relevance to overseas wholesale buyers, direct visitors to browsing or inquiry.
**Required content blocks (order provisional until Phase 2):** hero with clear B2B Egyptian furniture sourcing proposition; featured real collections; category shortcuts; concise company/business introduction; sourcing/export process overview; quality/materials/partner capabilities only with evidence; quote/WhatsApp call to action; footer.
**Primary CTA:** Explore Collections and Request a Quote.
**Avoid:** unfounded factory ownership, certification badges, fabricated testimonials, unsupported shipping promises.

### 4.2 Collections directory
**Purpose:** Discover all available furniture types and featured collections.
**Features:** browse categories; listing cards with real photo/name; filter by category; lightweight search if product data supports it; empty state; jump to category and individual collections.
**Taxonomy — provisional until actual inventory reviewed:** Bedrooms, Kids' Bedrooms, Dining Rooms, Living Rooms, Classic Salons, Individual Furniture. Expand or adjust based on actual offerings, e.g., wardrobes, storage, office furniture, etc. Never display empty or unsupported categories as real offerings.

### 4.3 Category listing
**Purpose:** Narrow a large catalog by furniture type.
**Features:** category heading and contextual description, collection grids, optional filters relevant to verified metadata, link to detail and inquiry.
**Navigation:** breadcrumb Home > Collections > Category.

### 4.4 Collection detail
**Purpose:** Provide enough evidence/specification for B2B purchase consideration.
**Fields where available:** collection name/ID, category, multiple real images, constituent pieces, dimensions **per piece with units**, material/finish, customization availability as verified, product description, optional minimum order quantity only if confirmed, availability/lead time only if confirmed.
**Actions:** Add to Inquiry (quantity and notes optional at this stage); Request a Quote; WhatsApp with safe prefilled collection ID/name.
**State:** missing specifications are omitted or clearly 'Contact for details', not invented. Do not show public price.

### 4.5 About Us
**Purpose:** Build trust and accurately communicate commercial identity.
**Contents:** company positioning, Egypt origin, commercial management role, network of supply/manufacturing/export partners, approach to quality/coordination, approved photos and partner references when authorized.
**Avoid:** false tenure, unverifiable metrics, client logos, ownership claims.

### 4.6 Sourcing & Export
**Purpose:** Explain how trade inquiries turn into orders and which elements are coordinated.
**Indicative flow:** Browse/submit inquiry → discuss specifications & quantity → bespoke quotation and commercial terms → confirm order → production/supply coordination → export/shipment coordination.
**Contents:** available product categories, customization subject to capability, general coordination process, FAQ for wholesale buyers with only substantiated answers. No blanket promise of delivery time, customs handling, or specific Incoterm until decided.

### 4.7 Contact / RFQ
**Purpose:** Generate qualified sales leads and provide human contact.
**Contact channels:** WhatsApp Business (number pending), business email (pending), contact form.
**RFQ fields (initial UX recommendation; refine in Phase 2):** buyer name, company (optional or required by policy decision), buyer type, business email, WhatsApp/phone (optional with country code), destination country, selected collection IDs and per-collection quantities, customization/specification notes, free-text requirements, consent to data processing (wording pending legal review).
**Form behavior:** validate required fields; clear success/failure feedback; preserve data on failed submission; bot protection; no false success message before actual delivery. Processing destination (email/CRM/backend), retention, spam handling and notification workflow are pending technical/business selection.

### 4.8 Inquiry list (RFQ workspace)
**Purpose:** Consolidate multiple collections into ONE wholesale quote request.
**Actions:** add/remove products, adjust quantity per product, optional notes, continue browsing, submit via RFQ form.
**Must not resemble a priced shopping cart:** no totals, checkout, payments, delivery calculation.
**Persistence:** at least browsing-session durability; final storage approach in later implementation brief; avoid losing selected products when switching languages.

## 5. Representative user journeys
**Journey A — Qualified inbound buyer:** Home → Collections → Category → Collection detail → Add to Inquiry → Add another collection → Inquiry List → RFQ → confirmed submission → sales follow-up.

**Journey B — Direct sales outreach:** Linked sales link → Collection detail → Request a Quote or WhatsApp message with collection reference.

**Journey C — Credibility-focused importer:** Home → About → Sourcing & Export → Collections → Contact.

**Journey D — Mobile Arabic buyer:** Arabic entry → menu/categories → collection page → inquiry → Arabic RFQ success state.

## 6. Functional requirements & acceptance criteria
**FR-01** Both languages available throughout all user-facing routes; Arabic RTL and English LTR, including form labels, menus, error/success states and metadata.
**FR-02** A visitor can traverse full catalog via categories to detail pages without a login.
**FR-03** Every published collection has at least a valid title, category, approved primary image and unique ID/slug. Missing optional specifications are not fabricated.
**FR-04** Price information is never displayed publicly.
**FR-05** Visitor can add two or more different collections to one inquiry, edit per-item quantities, remove items, and submit one RFQ.
**FR-06** RFQ submission associates selected collection identifiers and quantities, contact information and notes with one inquiry record/message.
**FR-07** Validation prevents empty/invalid submissions, preserves input on recoverable errors and only confirms success after server receipt.
**FR-08** WhatsApp message/link uses correct number when provided and includes product reference when launched from a collection.
**FR-09** No consumer checkout/cart/payments anywhere.
**FR-10** Mobile navigation and core conversion actions work without horizontal overflow, unreadable text, or obscured controls.
**FR-11** User can switch languages while retaining relevant context where localized pages exist.
**FR-12** All content/capability/partner/legal claims require approval before publication.
**FR-13** Product images have useful alt text; controls support keyboard navigation and visible focus; accessible labels and form error messages.
**FR-14** Page titles/descriptions and localized SEO metadata are planned for each page; technical SEO implementation defined in Phase 4.

## 7. Boundaries and non-goals
### In scope for initial website
Professional branded corporate website, product catalog and detail pages, bilingual UX, RFQ with multiple collections, WhatsApp contact, responsive experience, basic discoverability and contact/legal pages.

### Explicitly out of scope at launch
B2C checkout, online payment, inventory/pricing engine, public price lists, retail deliveries and returns workflows, accounts/login, PDF catalog, multilingual beyond Arabic+English, shipping-rate calculators, advanced customer portal, real-time order tracking, unverified testimonials/certifications.

## 8. Data schema — minimum usable catalog (recommendation)
- **Category:** id, slug, localized display names, description (optional), cover_image, sort_order, is_published.
- **Collection:** id, slug, category_id, localized title, description, approved_images[], pieces[] (piece name, dimension values and units), materials/finishes if verified, customization notes (if verified), availability flags if verified, sort_order, is_published.
- **Inquiry:** inquiry_id, customer/contact fields, destination_country, items[] ({collection_id, quantity, notes}), message, consent metadata as required, created_at, delivery/processing status.
Model is conceptual, not a mandate for a database or CMS in Phase 1.

## 9. Decisions deliberately reserved for upcoming phases
### Phase 2 — UX & Wireframes
- Home section exact order and priorities; hero composition.
- Detailed navigation interaction, filters/search and inquiry-list exposure.
- RFQ field layout, mandatory vs optional fields, inline validation and success/error states.
- Mobile journeys, category/detail layouts, empty states, breadcrumbs.
- Optional comparison/inquiry friction reduction; accessibility interaction details.
**Output:** `02-UX-Wireframes.md`.

### Phase 3 — UI Design System
- Logo assets/clear space, final palette and typography for both languages.
- Visual language, layout grid, spacing, breakpoints, image ratios, UI components, interactive states, motion guidance.
- Final desktop/mobile page treatment and references.
**Output:** `03-UI-Design-System.md`.

### Phase 4 — Content, Assets & Claude Handoff
- Approved bilingual copy, final product category inventory and collection details, real photos and photo permissions.
- WhatsApp/business email/contact details, approved legal/footer claims, privacy policy.
- Domain/hosting details; CMS/data source selection; RFQ receiving mechanism (email/CRM/backend); anti-spam, analytics, SEO and deployment choices.
- Testing checklist and Claude execution instructions; acceptance tests.
**Output:** `04-Claude-Implementation-Brief.md` and organized content/assets.

## 10. Unresolved inputs / no-blockers distinction
**Does not block entering Phase 2:** exact logo file, all collection photos, every dimension, final copy, domain, email/WhatsApp number, legal review. Use clearly marked placeholders in wireframes.

**Must be solved before public release:** actual contact routes, working RFQ delivery, verified/authorized published content and images, privacy/consent obligations, approved company/legal wording, actual collection inventory, domain deployment.

**Information to confirm before detailed collection wireframes:** number and actual names of product categories, sample collection content completeness, whether large product sets consist of multiple item types with separate dimensions; basic RFQ priorities/required fields (propose defaults in Phase 2).

## 11. Instructions for Claude
1. Use this blueprint as the authoritative Phase 1 architecture and feature scope.
2. Do not treat this as a request to build or publish the website now.
3. Keep all unverified business statements and contact details as explicit placeholders.
4. No B2C store, public prices, cart or payments.
5. The inquiry list is a **multi-product quote builder**, not checkout.
6. Maintain bilingual/RTL usability and genuine product photography as design requirements.
7. Wait for Phase 2 wireframes, Phase 3 design system and Phase 4 implementation brief before final implementation.
8. Escalate genuine contradictions instead of inventing operational policy.

## 12. Source/decision traceability
- **Source:** user-supplied *AL NASR FURNITURE — Business Overview & Strategic Operating Brief*, dated 25 Oct 2026.
- **Conversation-approved:** Modern & Minimal; multi-page; Arabic+English; real product photography; collection detail pages; WhatsApp + RFQ; **hidden prices**; **web-only catalog**; **multi-product inquiry**; show all genuinely available furniture types.
- **UX recommendations:** five-item top-level sitemap with internal category/detail/inquiry routes, multi-product quote workspace, initial section matrix, routes, schema and acceptance criteria. Provisional until refined in Phase 2–4.
