# AL NASR FURNITURE — UX Flows & Wireframe Specification
**Document:** `02-UX-Wireframes.md`  
**Version:** 1.0 | **Date:** 2026-10-25  
**Phase:** 2 — UX Flows & Wireframes  
**Purpose:** Design handoff to Claude; NOT a final visual mockup or production implementation.

## Status and decision authority
- **APPROVED:** Phase 1 requirements in `01-Website-Blueprint.md`; Homepage section layout INCLUDING “Why Work With Us”; business model B2B wholesale; Arabic + English; Modern & Minimal; real product photos; collection detail pages; no prices; no PDF catalog at launch; multi-product inquiry; WhatsApp and on-site RFQ as independent contact methods.
- **CLARIFIED BY FOUNDER:** Clicking WhatsApp opens a chat with sales directly. On-site RFQ collects the buyer's needs and contact details; sales follows up afterward. RFQ is not checkout, purchase, or order confirmation.
- **PROPOSED IN THIS DOCUMENT (needs design review before being called final):** detailed About, Sourcing & Export, Contact layout; responsive breakpoints and fine behaviors; default field-level validation and copy; some empty/loading/error states.
- **PENDING ASSETS / OPERATIONS:** verified brand logo, approved company story and claims, contact information, product inventory/media/details, image rights, buyer inquiry destination (email/CRM/backend), privacy-policy text, final market/country list, supported manufacturing customization, preferred default language.

## 1. Core UX principles
1. The site is a **B2B corporate site + browsable furniture catalog**, not a retail store.
2. Each page should help international wholesale buyers: understand the company, inspect furniture, or contact sales.
3. Two independent conversion paths: **WhatsApp** (open an external chat) and **Request a Quote (RFQ)** (submit an onsite lead). Neither requires registration.
4. Avoid displaying prices, retail ordering language, unsupported minimum order quantities, unverifiable claims, testimonials, certifications, country shipping promises or factory ownership.
5. Show real, authorized furniture images. Product specs must come from verified data; hide missing specs or label “Available on request.”
6. Accessibility: keyboard navigable, visible focus, semantic labels, sufficient contrast, form errors in text, reduced-motion support; mobile touch targets sized appropriately.

## 2. Global structure / navigation
**Header:** brand logo → Home / Collections / About Us / Sourcing & Export / Contact → language switcher → Request a Quote action. Show a subtle Inquiry List indicator after at least one item added. Sticky header is a preferred UX direction, not final UI styling. **WhatsApp** floating action must not obscure form actions or mobile controls.

**Footer:** company identification, navigation, contact channels once verified, legal/privacy link, language switcher. Avoid invented business addresses and social accounts.

**Suggested routes** (coordinate with Phase 1):
- `/{lang}/` Home
- `/{lang}/collections` Category overview
- `/{lang}/collections/{category}` Category listing
- `/{lang}/collections/{category}/{collection}` Collection details
- `/{lang}/about` About Us
- `/{lang}/sourcing-export` Sourcing & Export
- `/{lang}/contact` Contact / general RFQ
- `/{lang}/inquiry` Review multi-product inquiry and RFQ
- `/{lang}/privacy` Privacy statement (content pending legal review)

## 3. Homepage — APPROVED conceptual wireframe
Order from top to bottom:
1. **Header / Nav:** minimal logo and high-visibility RFQ navigation.
2. **Hero:** editorial split layout recommendation: descriptive text on one side, real furniture hero photo opposite. Clear B2B / Egypt sourcing messaging; `Explore Collections` primary discovery CTA and `Request a Quote` sales CTA. Final wording and exact hero option still subject to visual review.
3. **Featured Categories:** 3–4 real category cards with clear `View All` link; do not pretend unverified categories/products exist.
4. **Company Introduction:** brief explanation of AL NASR's commercial supply role with link to About Us.
5. **Why Work With Us — APPROVED addition:** three concise, truthful benefits: furniture selection; supplier/production coordination; export process coordination (actual claims need verification).
6. **How We Work:** Explore → Inquire → Discuss/Quote → Coordinate; clarify that RFQ does not confirm a sale.
7. **Conversion CTA:** `Request a Quote` and `WhatsApp Sales` options.
8. **Footer.**

## 4. Collections overview wireframe
- Breadcrumb `Home / Collections`.
- Page title and brief wholesale-focused intro.
- Visual grid of all **verified** furniture categories; each tile: real cover image, category name, optional collection count only if accurately derived.
- Clicking tile opens category page. A global search can be included if it searches the actual collection inventory; avoid redundant filter UI on an overview-only screen.
- Empty categories should not appear publicly until populated.

## 5. Category listing wireframe
- Breadcrumb, category title/intro, collection result count if accurate.
- Search by verified name/code; optional filters by style, material, finish ONLY if structured inventory supports them.
- Grid cards: image, name, stable collection reference code, `View Details`; no prices, sales badges, or invented ratings.
- Responsive: desktop multi-column / mobile compact single- or two-column depending on readability.
- `Load More` or pagination when catalog volume warrants it, with visible loading and empty search feedback.

## 6. Collection detail wireframe
- Breadcrumb back to category.
- Large image gallery with thumbnails, zoom and full-photo view; avoid cropping critical furniture parts; support keyboard interactions.
- Product code, name, introductory description.
- Included pieces, dimensions **per piece**, materials/finish, confirmed customization notes; omit anything not verified.
- Quantity input in **sets**, positive integer, with clear ability to edit later; clarify units if future products use pieces instead.
- `Add to Inquiry` action: adds or updates this group, shows non-intrusive feedback and a path to inquiry list.
- Separate `Ask on WhatsApp` action: opens chat, optionally prepopulates verified product name/code and source URL; never imply on-site RFQ already submitted.
- Related collections from same category if available.

## 7. Multi-product Inquiry List
- Always accessible after item selection via nav indicator; accessible through a direct `Request a Quote` route as well.
- For each item display cover image, accurate name/code, editable requested quantity, optional item-specific customization note, remove action.
- Prevent duplicate lines for the same collection; allow adding to existing quantity rather than creating confusing duplicates.
- Buyer can continue browsing and return with selections preserved through route changes / refresh as technically feasible; don't rely solely on component-level state.
- Empty state: `Your inquiry list is empty` + `Browse Collections` and a link to general contact inquiry.
- No price totals, checkout labels, cart icon, shipping cost estimates or payment controls.

## 8. RFQ and contact model — FOUNDER CLARIFICATION
### Independent paths
**Path A — WhatsApp:** icon/CTA → external WhatsApp chat with sales. No compulsory form; clicks do not mean a lead or order has been created in the site. Use real verified WhatsApp number only.

**Path B — Website RFQ:** from an inquiry list OR general contact → form with selected products (if any) → submit → acknowledge successful receipt → staff contacts buyer using provided method. Sending RFQ is **not** an order or pricing commitment.

### Recommended form structure (pending field-level approval)
- Full name — required.
- Company name / buyer organization — encouraged, may be optional for now pending business approval.
- Destination country — required.
- Email and international phone/WhatsApp: at least **one valid contact method**, not necessarily both. Mark preferred follow-up method.
- If products selected: item codes, quantities, per-item notes; allow adjustments.
- General inquiry text or additional requirements — optional, but required if there are no selected items and otherwise message would be empty.
- Privacy consent/notice appropriate to approved legal policy (details pending).
- No signup / account requirement.

### Form submission interaction
- Show validation near incorrect fields and a summary accessible to screen readers.
- Disable repeated sends while in progress, while allowing accessible feedback.
- Only show `Request received` after backend acknowledgement. Include reference number **only** if issued by real system.
- Error: keep input and inquiry items intact with clear retry, not a false success state.
- Send the lead to an agreed operational channel (CRM, email, database, etc.): **destination not yet specified**; Claude should not silently choose one.
- Prevent avoidable spam; final controls must be decided during implementation.
- On success, explain human sales follow-up; do not guarantee response time unless documented.

## 9. About Us wireframe — RECOMMENDED
1. Hero: `About AL NASR FURNITURE` with a factual Egypt-based B2B description and approved real photo.
2. `Who We Are`: short company profile, with accuracy around asset-light operation and partners.
3. `Our Approach`: product access, commercial contact, order coordination; avoid invented timeline/founding date.
4. `Who We Serve`: international showrooms, importers, wholesalers, distributors, retail chains.
5. Optional partner/facility imagery or achievements **only after documented permission and verification**.
6. CTA: `Explore Collections` / `Talk to Sales`.

## 10. Sourcing & Export wireframe — RECOMMENDED
1. Hero: `Furniture Sourcing & Export Coordination` + brief credible description.
2. Capability cards: sourcing, specification coordination, production coordination, export arrangements — under real partner capabilities.
3. Process timeline: choose products → inquiry → clarify specifications and quotation → agree commercial terms → production/supply coordination → export/logistics as agreed.
4. Expectations/FAQ: Can specifications be customized? How are bulk orders discussed? What details improve RFQ? Avoid firm freight, lead-time, compliance and MOQ promises without confirmation.
5. CTA to `Request a Quote` and `WhatsApp`.

## 11. Contact wireframe — RECOMMENDED
1. Header with `Contact Our Sales Team` and clear wholesale orientation.
2. Two deliberate actions: `Chat on WhatsApp` (external) and `Request a Quote` (on-site form).
3. Reuse **one shared RFQ form system**; prepopulate selected inquiry items when present. For no items, support freeform sourcing requests.
4. Show verified email and other real contact details, not placeholder information disguised as fact.
5. Submission confirmation/error states as in §8.
6. Do not add a map or business hours unless there is a verified public-facing address/schedule.

## 12. Responsive / mobile UX — RECOMMENDED
- Desktop: spacious grids and split hero; prominent main CTA in header.
- Mobile: collapsed accessible nav, natural reading order, clear headline/CTA before excessive imagery, large photo cards, easy quantity inputs, no hover-only behavior.
- Keep key actions available without obstructing page content: no giant floating overlays; on RFQ pages remove/reposition floating WhatsApp if it interferes.
- Gallery thumbnails swipe/tap; maintain image quality with responsive assets.
- Test navigation, forms, validation, add/remove inquiry, success and error on mobile at common viewport widths.

## 13. Localization UX — RECOMMENDED
- Full **EN LTR** and **AR RTL** layouts: logical alignment, navigation direction, forms, breadcrumbs, arrows, and layout flips where appropriate.
- Don't reverse product photos or reorder image gallery data merely because RTL.
- Product codes, phone numbers, URLs and emails remain readable in either direction.
- Language switch keeps user on the equivalent page where translation exists; otherwise sensible fallback with explanation.
- Translate all form errors, confirmation messages, placeholders, product taxonomy and metadata; avoid half-English UI in Arabic mode.
- **Default language is pending founder decision.** Locale SEO structure and translation review are Phase 4/implementation responsibilities.

## 14. User flows to test
A. Home → Collections → Category → Detail → Add to inquiry → Select another → Review → Submit → Success.
B. Direct collection link from salesperson → product details → WhatsApp chat (no form).
C. Contact → general custom procurement inquiry without selected catalog products → submit.
D. RFQ invalid phone/email → inline correction → successful submission.
E. Failed network/server submission → error and preserved state → retry.
F. Mobile Arabic route → search category → select item → edit quantity → RFQ.
G. Empty inquiry list → browse catalog.
H. Switch language on details page without losing selected products.

## 15. Future phases / out of scope
### Phase 3 — UI Design System
Logo treatment, exact palette, fonts and typescale, component styling, pixel-specific layout, motion, spacing, breakpoints, page mockups, image crop guidance.

### Phase 4 — Content, Assets & Claude Handoff
Actual product inventory and category taxonomy; authorized photos and specifications; bilingual final copy; verified contact/WhatsApp; approved legal claims/privacy; RFQ destination architecture; final QA checklist and implementation prompts.

### Explicitly out of launch scope
Retail checkout, online payments, displaying product prices, consumer delivery estimator, unapproved PDF catalog, customer accounts, wishlist-as-retail-cart, invented testimonials or export certifications.

## 16. Review checklist / Phase 2 sign-off
- [x] Homepage section order with Why Work With Us approved.
- [x] Distinct WhatsApp vs website RFQ user journeys clarified.
- [x] Multi-product inquiry and separate collection details adopted.
- [ ] Founder review of About, Sourcing & Export, Contact proposed wireframes.
- [ ] Founder approval of precise RFQ required/optional fields and preferred method UI.
- [ ] Founder approval of mobile/localization refinements and final Phase 2 handoff.

**Instruction for Claude:** This is a UX specification, not permission to invent business data. Preserve APPROVED decisions and call out PENDING points. Wait for final Phase 2 sign-off before considering this document locked.
