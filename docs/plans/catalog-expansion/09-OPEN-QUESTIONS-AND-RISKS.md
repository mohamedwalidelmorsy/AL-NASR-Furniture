# 09 — Open Questions and Risks (updated 2026-11-09)

> Open decisions now live in **doc 12** (register). Q1, Q2, Q5, Q14 are closed by owner decisions. The table below is historical context.

## Questions for the owner

| # | Question | Why it matters | Default if unanswered |
|---|---|---|---|
| Q1 | The 4 existing bedroom products (`pv-br-01…04`) no longer exist in Drive (all 8 images, AR+EN). Keep, hide, or retire? | Their IDs may sit in buyers' Inquiry Lists; hiding needs a redirect + "no longer available" state | Keep as-is (no code change) |
| Q2 | ~~Restore the Trash kids images?~~ **RESOLVED 2026-11-09: deleted on purpose; do not recover/use.** | — | closed |
| Q3 | `Bedroom/room 8/WhatsApp Image 2026-10-31…jpeg` looks like a real photo. Is it a real manufactured piece, and do the 5 renders in that folder depict it? | Determines `verification` status and what may be called "real" | Treat everything as concept renders |
| Q4 | For bedroom rooms 2, 3, 7, 8 and kids rooms 4–6 (only PNGs): are the files alternates of **one** design, or different designs? | One product vs several; not verified (files not opened) | Review sheets (P0-3) then ask |
| Q5 | Is the bedroom wardrobe "250 × 230" **width × height**? Depth? Is the 160 cm bed the bed width? | Wording in doc 06 stays unlabeled until confirmed | Unlabeled numbers only |
| Q6 | Do the kids standard dimensions apply to designs that show a single bed (kids room 8, room 1)? | Block text "two beds" could contradict the image | Block says "standard reference"; included pieces confirmed at quotation |
| Q7 | Arabic numerals in copy: Eastern (٢٥٠) or Western (250)? Check consistency with existing Arabic pages | Consistency | Match the rest of the site |
| Q8 | Names for the new designs (EN + AR) and the category name for "Dressing Rooms" (AR: غرف الدريسينج / غرف الملابس؟) | AR names transcribed from posters were already a blocker | Descriptive placeholders |
| Q9 | Is the hero's sofa/armchair set a real catalog item? | A hero showing a non-catalog set invites enquiries | Keep "illustrative" alt; optionally add as a Living Room product |
| Q10 | Dressing rooms 1, 2, 5, 6 have no main image (and details ≤ 443 px wide). Supply main images, or publish only designs 3 and 4? | Publish gate (≥ 3 covers) | Don't publish the category until 3 covers exist |
| Q11 | Kids room 1 main image has a stitched thumbnail strip at the bottom; kids room 3 is an infographic with unconfirmed text. Replace, crop, or exclude? | Quality / truthful content | Exclude from covers |
| Q12 | Corner/living English posters are gone. Accept bilingual (AR+EN printed) posters shown in both languages, or supply clean images? | EN site would otherwise lose 6 current EN images' provenance (files remain locally) | Show the poster in both languages |
| Q13 | Category order and whether Dressing Rooms sits right after Bedroom Sets | Nav/Collections order | After Bedroom Sets |
| Q14 | ~~Image count~~ **RESOLVED:** baseline = 117 active images (the 20 deleted ones don't count); refresh inventory before implementation | — | closed |

## Technical risks (see doc 08 for mitigations)

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Drive changes again | inventory/IDs stale | High (it changed between 2026-10-27 and 2026-11-08) | re-run inventory in P0-1; record the date in the import report |
| 119 of 137 images not opened | misclassification | Medium | P0-1/P0-3 before data entry |
| Detail crops low-res | blurry lightbox | High | native-size policy, no upscale |
| Poster text claims (e.g. "Premium Fabric", dimensions) | false specifications | Medium | prefer clean images; never copy poster specs |
| Brand/claims: AI renders presented as product | trust / legal | Medium | keep "Illustrative design" labels; owner confirms what is real |
| Tests pinned to 94 files / 36 URLs | CI fails on first import | Certain | Phase 1 replaces pins |
| Drive bulk download blocked in the AI session (token minting was denied by the permission classifier) | P0-1 must be user-run | Certain | user runs the one-line `gcloud` command or provides a token |
| This audit's limits | see doc 01 §1 & doc 02 §1 | — | no browser audit; 18 images visually checked; no test run |

## Risk register additions (migration, 2026-11-09)

| Risk | Impact | Likelihood | Mitigation (doc) |
|---|---|---|---|
| Old ID/slug reused for a different design | buyer's stored list or bookmark points to the wrong product | Medium if unguarded | reserved-ID list + test (13 §1) |
| Inquiry entry silently mapped to a new design | wrong RFQ | Medium | no rewriting; archived row state; `archived_item` (13 §4) |
| Archiving before replacement is live | category vanishes (list is data-driven), tests break | High if sequenced wrong | per-category cut-over (13 §2, 08 Ph.4) |
| Redirect based on a look-alike | wrong product shown | Medium | redirects only with `equivalentId` set by owner |
| Removing local images too early | broken pages, e2e failures | Medium | cleanup is a separate later PR (08) |
| Hero still depends on legacy `pv-br-01` | hero breaks on archive | Certain until Ph.5 | swap hero first or at cut-over (08) |
| Corner/Living/China have no new designs | empty/hidden categories | High | open decision A |
| Deleted Drive images re-imported | violates owner decision | Low | deny-list + test |
| Wardrobe depth shown/implied | invented specification | Low | `depth: null`, render test (06 §8) |
| Tests pinned to soft-arc URL, 36 products, 94 files | CI red at cut-over | Certain | derive from data (08 Ph.1/4) |

## Acceptance & test strategy (summary; full lists)
Catalog: doc 13 §7–8 · dimensions: no number outside `STANDARD_DIMENSIONS`, depth never rendered · hero: doc 07 §6 · gallery/cards: doc 05 · roadmap gates: doc 08.

## Risk register additions (round 4)
| Risk | Mitigation |
|---|---|
| Over-archiving continuing products (breaking URLs, forcing needless new IDs) | A/B/C rule; no replacement records to refresh content (doc 13 §1) |
| Treating look-alikes as equivalence | evidence sheets + owner confirmation; `equivalence.status` |
| Updating a B product's images to a different design by mistake | verification table + eye pass; B only with byte-identical or confirmed equivalence |
| Category/name mismatch in B products (e.g. "Corner Sofa" in Living Rooms) | separate naming/category review, not replacement |
| Kids room 1 crop altering the owner's image | crop is a rendition (source untouched) and needs approval |
| Dressing category looks thin | publish threshold decision (doc 14 §6) |
