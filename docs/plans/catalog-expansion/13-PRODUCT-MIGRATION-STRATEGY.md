# 13 — Product Migration Strategy (revised 2026-11-09, round 4)

PLAN ONLY. **Supersedes the earlier "archive all 18" rule.** Governing decisions: the active Drive (after a fresh inventory) is the source of truth; the 20 deleted images are deny-listed; the current application stays untouched until replacement data and images are verified.

## 1. Classification rule (owner correction)

| Class | Definition | What happens | Identity |
|---|---|---|---|
| **A — Superseded** | the old product is replaced by a **genuinely different** furniture design | **Archive.** ID and slug reserved forever | never reused |
| **B — Continuing** | the underlying design is the same | **Keep ID, slug and URL.** Update Drive references, name, description, image metadata and images in place | unchanged |
| **C — Uncertain** | equivalence to a current Drive design is **not verified** | **No remap, no redirect, no archive.** Stays active and unchanged; flagged for visual review with side-by-side evidence | unchanged until decided |
A C product becomes B (owner confirms "same design") or A (owner confirms "different"). Visual look-alikes found by the assistant are evidence, never a decision. Equivalence is recorded in data as `equivalence: { status: 'confirmed' | 'rejected' | 'pending', evidence: path, confirmedBy, date }`.
**No replacement records are created merely to refresh content or image references** — refreshing a B product edits that product.

## 2. Product migration matrix (18 legacy products)

Evidence images: `evidence/` (compare-1…4). "Verified" below = proven by identical file bytes; "visual" = looked alike in side-by-side images I opened, **not** business-confirmed.

| Legacy product | Class (now) | Evidence | Proposed outcome |
|---|---|---|---|
| `pv-br-01` Soft Arc Bedroom Set | **C** — strong visual candidate: room 8 render #1 | compare-1: same arched LED headboard, striped bedding, silver bench with circular medallions, oval vanity mirror; wardrobe in room 8 render has curved inlays | owner confirms → **B** (keep ID/URL; gallery from room 8); else A |
| `pv-br-02` Curve Bedroom Set | **C** — strong visual candidate: room 4 | compare-2: same swooping curved headboard, stepped side bench with drawer, nightstands | owner confirms → B; else A |
| `pv-br-03` Upholstered Bedroom Set | **C** — plausible candidate: room 5 (weaker) | compare-3: tall padded headboard in wood frame, front bench | visual review needed |
| `pv-br-04` Luxe Bedroom Set | **C** — plausible candidate: room 3 (weaker) | compare-3: cream headboard, marble-look wall, bench with wood inset, dark-door wardrobe, round vanity mirror | visual review needed |
| `pv-kb-01` Arch Line Kids | **C leaning A** — no matching active room among the images opened (one per room) | compare-4 | confirm A after all kids images are reviewed |
| `pv-kb-02` Butterfly Charm Kids | **C leaning A** — butterfly headboard not seen in any active room | compare-4 | same |
| `pv-kb-03` Study Nook Kids | **C** — low-confidence partial look-alike: kids room 8 (teddy bears, mirror-door wardrobe) | compare-4 | visual review |
| `pv-co-01/02/03` Corner Sofas | **B — verified** (Arabic poster byte-identical to an active file); EN counterpart orphaned (local file only) | doc 02/11 | keep ID/URL; update provenance; EN pairing eye-checked |
| `pv-lr-01/02/03` Living Rooms | **B — verified** (same) | same | same; **category/name mismatch flagged** (names say "Corner Sofa" but category is Living Rooms; `pv-co-03` file sits in the `انتريه` folder) → naming/category review, **not** a replacement |
| `pv-cc-01/02/03` China Cabinets | **B — verified** (AR + EN files unchanged, same IDs) | doc 11 §2 | keep; no change except provenance status `valid` |
| `pv-dr-01/02` Dining Rooms | **B — verified** | same | keep |

Resulting counts: **B verified: 11 · C: 7 (4 bedroom, 3 kids) · A: 0 confirmed yet.** If the four bedroom candidates are confirmed → B = 15 and Phase 3 only adds 4 genuinely new bedroom designs (rooms 1, 2, 6, 7).

## 3. Category policy (owner decisions)

- **Corner Sofas, Living Room Sofa Sets, Dining Rooms, China Cabinets:** retain existing records. The 14 not-yet-catalogued corner/living posters are *additional* products (new IDs), classified visually; they are not replacements.
- **Bedroom Sets and Kids' Bedrooms:** proceed with the new mapping (doc 03), but the **current application and legacy records stay as they are** until replacement data and images are verified. No archival happens before verification and cut-over.
- Because legacy products remain active while C is unresolved, **no category can empty** at any point; per-category cut-over only flips products that were confirmed A.

## 4. Inquiry List safety (persisted `alnasr.inquiry.v1` = `[{id, qty, note}]`)

| Aspect | Rule |
|---|---|
| Legacy identifiers | stored `id` is never changed. B/C products keep their ID, so existing lists keep working with no migration. Only confirmed **A** (archived) IDs need the rules below |
| Storage | same key and shape; **no migration script**; nothing is rewritten, merged or deleted automatically |
| Quantity and notes | preserved verbatim (qty 1–99999, note ≤ 300) for archived rows until the buyer removes the row; never carried to another product |
| Archived row display | greyed, name from the archived registry (`id → name EN/AR`), label "Sample design — no longer available" (EN/AR), link to the category, **Remove** button; no quantity stepper for submission |
| Submitting | archived rows are **excluded from the RFQ automatically and visibly**: a notice above the form says "N unavailable item(s) will not be included" with **Remove unavailable items**; the buyer can submit the remaining **active** items immediately. If only archived rows remain, submit is disabled with an explanation. Archived rows are never sent as items |
| Optional carry-over | a "Copy my notes into the message" button for archived rows (opt-in, buyer-initiated) so intent is not lost |
| Replacement suggestions | only if an owner-confirmed `equivalence` exists: "A replacement is available: <name>" with an **opt-in** "Replace in my list" (qty/note carried over by the buyer's click). Never automatic |
| Server | an archived ID in a payload → `422 archived_item` (distinct from `unknown_item`), nothing queued; the client never sends it, so this is a backstop |
| Header counter | counts active lines only; archived shown separately in the list |
| Unknown IDs | existing behaviour (ignored, kept) |

## 5. Routes

| Case | Behaviour |
|---|---|
| B / C product | URL unchanged, `200` |
| A product (archived) | `200` archived-product page, `noindex`, no add-to-list; excluded from sitemap/search/related/featured; still in `generateStaticParams` |
| A with **confirmed** equivalent | `308` to the equivalent; only from `equivalence.status = confirmed` |
| New design | new ID + new slug; reserved list (all 18 legacy IDs/slugs + any archived) enforced by test |

## 6. Migration sequence

1. Fresh inventory + verification + grouping on the active images (doc 11 §3, §6). 2. Side-by-side review sheets → owner decides C → A/B. 3. Data model: `status`, `equivalence`, reserved list, archived registry (no content change). 4. Update B products in place (provenance, images, metadata) and add genuinely new designs (new IDs). 5. For confirmed A only: remove code/test dependencies, archive, add archived page/redirect. 6. QA. 7. Later separate PR: remove unreferenced legacy image files. Rollback = revert data; no stored buyer data is ever altered.

## 7. Acceptance criteria

- No legacy product is archived, redirected or remapped unless `equivalence`/A is **confirmed** by the owner; C products are byte-for-byte unchanged in data and URL.
- B updates keep `id`, `slug`, URL and category; `driveFileId` values exist in the active inventory and are not on the deny-list.
- Reserved-ID test: no ID/slug of any legacy product is reused for a different design.
- New products have new IDs; every cover/gallery image comes from an active Drive file and passes the verification table.
- Inquiry List: seeded with {active B item, archived A item, unknown item}: active row normal; archived row visible with qty/note intact, removable, excluded from submission with a visible notice; the buyer can submit the active item; the archived ID is never sent; forced API call returns `archived_item`; nothing is mapped to another product. Persistence survives reload; storage shape unchanged.
- Archived pages: `200`, `noindex`, absent from sitemap; legacy URLs never `404`.
- Local legacy image files remain after cut-over; removal is a separate reviewed PR.
- Each phase leaves `typecheck`, `lint`, unit and e2e green.

## 8. Test strategy

Unit: reserved list, deny-list, classification/equivalence schema, `productById` (finds archived) vs `allActive()`, Inquiry row classifier (active/archived/unknown), RFQ handler `archived_item`. Component: Inquiry row states (EN/AR/RTL), archived page. E2E (desktop + mobile): B product URL unchanged after data refresh; C product unchanged; seeded Inquiry with archived row → remove → submit active; archived URL behaviour; sitemap; axe. Fixtures: replace hard-coded `soft-arc-bedroom-set` and the "36 URLs" pin with data-derived values only when/if those products are actually changed.
