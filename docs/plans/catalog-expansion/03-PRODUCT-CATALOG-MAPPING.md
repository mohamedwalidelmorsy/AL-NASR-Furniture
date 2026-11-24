# 03 — Product Catalog Mapping (source designs → product records)

Grouping rule: **one product record = one furniture design/set**, with a gallery. Folder = design for bedrooms, dressing and kids (the owner's room-N structure). Poster folders (corner, living, China/Dining) are one *design per poster*.
Confidence: **High** = opened and consistent with folder; **Medium** = folder + filename pattern only; **Low** = unknown, needs the owner/visual review.
Proposed IDs follow the existing convention `pv-<cat>-NN` (internal preview IDs) so nothing existing is renamed. Proposed slugs are placeholders — names must be confirmed by the owner (Arabic names especially).

## 1. Categories (recommendation in §7)

| Category | Existing id | Source today | Designs found | Status |
|---|---|---|---|---|
| Bedroom Sets | `bedrooms` (4 products) | `اوض نوم/اوض نوم/room 1–8` | **8** | 4 existing designs have **no source in Drive any more**; 8 new designs |
| Dressing Rooms | *new* `dressing-rooms` | `دريسينج/After/1–6` | **6** | new, thin assets |
| Kids' Bedroom Sets | `kids-bedrooms` (3) | `اطفال/New folder/room 1–8` | **8** | 3 existing products' sources were **deleted on purpose** (see §4) |
| Corner Sofas | `corner-sofas` (3) | `ركن/عربي` | 9 posters | Arabic only |
| Living Room Sofa Sets | `living-rooms` (3) | `انتريه/عربي` | 11 posters | Arabic only; contents ≠ folder name |
| China Cabinets / Dining | `china-cabinets` (3), `dining-rooms` (2) | `نيش و سفرة/عربي+انجليزي` | 7 AR + 7 EN posters | unchanged, 5 products mapped |

## 2. Bedroom Sets (8 designs → 8 proposed products)

| Source folder (ID) | Imgs | Cover | Supporting images | Proposed ID / slug | Confidence | Notes |
|---|---|---|---|---|---|---|
| room 1 `1US4jsa_…` | 5 | `01_Main_Room (1).jpg` ✔ opened | 02 headboard, 03 wardrobe, 04 dressing table, 05 drawer wood | `pv-br-05` `walnut-ivory-bedroom-set` | High | 1536×658; walnut + ivory, 4-door wardrobe |
| room 2 `1Is3kiu3_…` | 5 | **unknown** (PNG ×5, not opened) | — | `pv-br-06` | Low | 5 PNG 2.1–2.9 MB; could be alternates/different sets |
| room 3 `1ggYeOQG_…` | 4 | unknown | — | `pv-br-07` | Low | 4 PNG |
| room 4 `1a6E8dGR_…` | 7 | `01_Main_Room (3).jpg` ✔ | 02 headboard, 03 wardrobe, 04 dressing table, 05 bench, 06 nightstand, 07 drawer | `pv-br-08` | High | 1312×585; curved headboard + bench |
| room 5 `1dlgW4aE_…` | 6 | `01_Main_Room (4).jpg` ✔ | 02 headboard, 03 wardrobe, 04 nightstand, 05 bench, 06 dressing table | `pv-br-09` | High | 1547×545 |
| room 6 `1gtZei35_…` | 7 | `01_Main_Room (4).jpg` ✔ | 02 headboard, 03 wardrobe, 04 dressing table, 05 footboard, 06 nightstand, 07 drawer | `pv-br-10` | High | 1199×516; grey/beige |
| room 7 `11uRaHTl_…` | 4 | unknown | — | `pv-br-11` | Low | 4 PNG |
| room 8 `1Eu5YR-P_…` | 6 | `ChatGPT Image Nov 1 … PM-1.png` ✔ (1448×1086) | 4 more PNGs (not opened) + a **WhatsApp photo** of a wardrobe | `pv-br-12` | Medium | mix of renders and a possible real photo → owner decision |

Existing `pv-br-01…04` are **class C (uncertain)** (doc 13): strong visual candidates `pv-br-01`≈room 8, `pv-br-02`≈room 4; plausible `pv-br-03`≈room 5, `pv-br-04`≈room 3 (evidence images in `evidence/`). **Nothing is remapped, redirected or archived until the owner confirms.** If confirmed (class B) they keep ID/slug/URL and receive the room gallery; rooms 1, 2, 6, 7 are then the genuinely new designs (new IDs). Rejected pairs become class A (archived, IDs reserved). Their source images (old bedroom posters) are no longer in Drive; they remain as local WebP. Redirects are not needed for confirmed B products (same URL). Matching any of `pv-br-01…04` to a new room design is **not possible by evidence** — no byte-identical file exists and no new file was matched visually (old poster files were not re-opened in this audit).

## 3. Dressing Rooms (6 designs → 6 proposed products)

| Folder | Imgs | Main image? | Files | Proposed ID | Comment |
|---|---|---|---|---|---|
| After/1 `1rySyQz2…` | 1 | **no** | `04_Detail_3.jpg` (366×492) | `pv-dg-01` | glass wardrobe interior + bench; only a detail |
| After/2 `1CFwFeRu…` | 2 | **no** | `03_Detail_2`, `04_Detail_3` | `pv-dg-02` | |
| After/3 `1hz-R2Cy…` | 1 | **yes** | `01_Main.jpg` 1122×862 ✔ | `pv-dg-03` | walk-in glass-door corner, lit vanity |
| After/4 `1ifCCUsu…` | 1 | **yes** | `01_Main.jpg` 1122×784 ✔ | `pv-dg-04` | white wardrobe wall + mirror niche |
| After/5 `15K-heoR…` | 1 | **no** | `02_Detail_1.jpg` 443×598 ✔ | `pv-dg-05` | wardrobe interior |
| After/6 `1TrLP-0P…` | 1 | **no** | `02_Detail_1.jpg` 389×604 ✔ | `pv-dg-06` | slatted shelf unit |

**ID clash avoided:** the prefix `pv-dr-` is already used by **Dining Rooms** (`pv-dr-01/02`), so Dressing Rooms use `pv-dg-01…06`. Suggested names to be confirmed: *Glass-Door Walk-in Dressing Room*, *Mirror-Niche White Dressing Wall*, etc.
**Visual gap:** only designs 3 and 4 have a usable cover. Designs 1, 2, 5, 6 should be **not published** (or published with a low-res detail as cover, which is poor) until main images are supplied. Detail crops (≤ 443 px wide) must not be upscaled for the 1400 px lightbox.

## 4. Kids' Bedroom Sets (8 designs → 8 proposed products)

| Folder | Imgs | Cover | Others | Proposed ID | Conf. | Notes |
|---|---|---|---|---|---|---|
| room 1 `1tcrKUJt…` | 4 | `01_Main_Room (8).jpg` ✔ (1199×840) | 02 wardrobe, 03 headboard, 04 vanity | `pv-kb-04` | High | main has a **collage strip artefact** at the bottom; needs owner decision |
| room 2 `1B6hLbrc…` | 7 | `01_Main_Room (6).jpg` | 02 wardrobe+study, 03 headboard, 04 nightstand+mirror, 05 bed foot, 06 storage shelf, 07 wardrobe interior | `pv-kb-05` | Medium | not opened |
| room 3 `1p14PgPB…` | 6 | **infographic** `Blush Glow Kids Bedroom Set (1).png` ✔ | 5 `ChatGPT Image Oct 31 … -2…-6.png` (not opened) | `pv-kb-06` | Medium | cover candidate is among the 5 clean PNGs *(unverified)*; the infographic carries unconfirmed specs |
| room 4 `1LWLvs63…` | 2 | not opened | | `pv-kb-07` | Low | 2 PNGs → thin gallery |
| room 5 `155S4TpR…` | 2 | `Cozy Warm-Lit Study Nook.png` (not opened) | `…02_16_26 PM-1.png` | `pv-kb-08` | Low | |
| room 6 `1CDiZQ0A…` | 5 | `Sunlit Jungle-Themed Twin Bedroom (1).png` (not opened) | 4 `ChatGPT Image Nov 2` PNGs | `pv-kb-09` | Medium | |
| room 7 `1mV4RR64…` | 2 | `Symmetrical Twin Bedroom with Oak Cabinetry.png` ✔ 1672×941 | `Warm Oak Dual Study Wall Unit.png` | `pv-kb-10` | High | twin beds + central wardrobe (fits "two beds 120 cm" standard *as a visual match only*) |
| room 8 `1mbbzKI6…` | 4 | `Warm Modern Bedroom Retreat-4.png` ✔ | `01_Bed.jpg`, `02_Wardrobe.jpg`, `03_Nightstand.jpg` | `pv-kb-11` | High | single large bed (not twin) |

Existing `pv-kb-01…03`: their source images were intentionally deleted and are never reused. They are **class C leaning A** (no clear match in the active kids rooms; `pv-kb-03` has a low-confidence look-alike in room 8). They stay active and untouched until the owner confirms A; then they are archived (IDs reserved) in the same release that publishes the new kids products so the category never empties. Local WebP files stay until dependencies are updated (doc 11 §2). No Drive reference to the deleted files appears in the mapping.
**Kids covers:** room 1 → crop above the stitched strip (owner approves) or interim detail image; room 3 → clean render `…10_45_56 PM-2.png`, infographic not shown (doc 14 §7).
The new kids folders have no EN/AR split — see §9 language rule.

## 5. Corner Sofas and Living Room Sets (20 Arabic posters)

The **folder labels are unreliable** (already noted in DEPLOYMENT.md): `ركن` has 9 files, `انتريه` 11, but the old inventory classed 10+10; Arabic posters moved between the two folders. Two opened examples: a blush **L-shaped corner sofa with ottomans** (in `ركن`) and a single **cream chaise longue** (in `انتريه`).

| Existing product | Old image | Current Drive location of identical bytes | Folder says | Note |
|---|---|---|---|---|
| `pv-co-01` Cocoa Modular Sectional | ar-06 | `ركن/عربي` `…11_46_11 AM-6.png` | corner | keeps category |
| `pv-co-02` Minimal White Sectional | ar-10 | `ركن/عربي` `…11_46_27 AM-10.png` | corner | |
| `pv-co-03` Olive Curve Sofa | ar-01 | **`انتريه/عربي`** `…11_45_56 AM-1.png` | **living** | folder ≠ website category |
| `pv-lr-01` Soft Arc Corner Sofa | ar-07 | **`ركن/عربي`** `…03_00_32 PM-7.png` | **corner** | |
| `pv-lr-02` Teal Sectional Sofa | ar-08 | **`ركن/عربي`** `…03_00_35 PM-8.png` | **corner** | |
| `pv-lr-03` Luxury Corner Sofa | ar-10 | **`ركن/عربي`** `…03_00_54 PM-10.png` | **corner** | |

Remaining 14 Arabic corner/living posters have **no product record** (58 of 94 old images were "not imported"; the same applies). Classification must be **visual**, not by folder: a short owner-reviewed sheet (type: L-corner / 3-seater set / chaise / armchair; poster text) is needed before records are created (doc 08 task P0-3).
English poster variants for corner/living no longer exist in Drive. The EN site currently shows EN posters for these 6 products — they remain as local files. For any new corner/living product, **an EN version exists only if the owner provides one**; otherwise either (a) show the Arabic poster in EN (poster text is Arabic+English bilingual, as opened: yes, both languages are printed) or (b) generate clean-image versions. See §9.

## 6. China cabinets & dining (7 AR + 7 EN posters; 5 products mapped)

Identical bytes/IDs confirmed for all 10 images in use (`pv-cc-01..03`, `pv-dr-01..02`), each pair mapped by number (AR n ↔ EN n). The folder holds 7 posters per language; **2 per language are not on the site** (`…-1`, `…-6` pairs).
- AR file `…03_33_39 PM-1.png` ↔ EN `…03_26_55 PM-1.png`; AR `…03_34_03 PM-6.png` ↔ EN `…03_27_06 PM-6.png` — same numeric suffix; **correspondence by suffix is the prior importer's assumption** and was **not re-verified visually** here (the earlier import noted AR/EN pairing as unverified). Confirm by opening both.
- Mixed dining/china-cabinet designs: the opened dining poster shows a table, 6 chairs, **two display vitrines and a sideboard in the same image**. Rule: **one product** (dining set) in `dining-rooms`, **also listed** in `china-cabinets` via multi-category membership, not two records (doc 04).

## 7. Old → new Drive ID remap (for provenance)

A machine-readable remap (old `imageId`/`driveFileId` → current ID, flagged `unchanged` / `byte-identical` / `no-counterpart`) must be generated in task P0-2. The audit already established, for the **36 image records in `products.json`**: **10 valid** (China/Dining), **6 remappable** (Arabic corner/living posters), **14 orphaned** (8 bedroom, 3 corner-EN, 3 living-EN) and **6 deleted-by-decision** (kids). For the old 94-file inventory: 14 unchanged, 20 byte-identical in active folders under new IDs, 20 deleted-by-decision, 40 with no counterpart. Matching was by exact byte size + name pattern, not SHA-256 — the remap script must hash to be certain.

## 8. Existing product → new source design (summary; classification in doc 13 §2)

| Existing product | New source design | Relationship |
|---|---|---|
| `pv-br-01…04` | candidates: 01≈room 8, 02≈room 4, 03≈room 5, 04≈room 3 (unconfirmed) | class C → B if confirmed (keep ID/URL), A if rejected |
| `pv-kb-01…03` | none confirmed (source deleted on purpose) | class C leaning A; archive only after confirmation |
| `pv-co-*`, `pv-lr-*` | same posters (same bytes) in `ركن`/`انتريه` | class B: **keep records**, update provenance; 14 extra posters = new products |
| `pv-cc-01…03`, `pv-dr-01/02` | unchanged posters/IDs | class B: keep |
| — | bedroom rooms 1–8 | **new** `pv-br-05…12` |
| — | dressing 1–6 | **new** `pv-dg-01…06` |
| — | kids rooms 1–8 | **new** `pv-kb-04…11` |
| — | 14 unmapped corner/living posters | new, pending visual classification |

Product count (doc 14 §4): 18 now → **up to 47 active** (+3 archived kids if confirmed A); bedrooms 8 (4 retained + 4 new if confirmed), kids 8, dressing 6, corner+living 20, dining+china 5; realistic first release (assets verified): **≈ 6 bedrooms + 2–6 dressing + 3–5 kids** new designs (rooms with usable covers) — see doc 08 phases.

## 9. Language rule (answering "never pair unrelated designs")

1. **Clean image with no embedded text → one image shared by both locales** (`locale: 'all'`; no duplication).
2. **Poster with bilingual text** (the new corner/living/China posters print EN + AR on the same image) → also shareable; mark `hasEmbeddedText: true`.
3. **Separate AR and EN images of one design** (China/Dining only) → locale-specific entries; pairing must be verified visually once.
4. If a locale has no image, fall back to the other locale (already implemented in `galleryFor`) — but never to a *different design*.

## 10. URLs and Inquiry List impact (see doc 13)

- **No existing URL stops answering and no ID is reused.** Legacy URLs become archived pages or verified redirects. New products add URLs (8+6+8 = 22 × 2 locales = **44 new detail URLs** at minimum) and one new category route (`/collections/dressing-rooms`) if approved.
- If any legacy product is hidden or retired: keep the ID resolvable (stored lists and server-side RFQ item validation), add a redirect from its detail URL to its category, and show the line in the Inquiry List with a "no longer available" label instead of dropping it silently. That requires code → P1.
- Slug stability: once published, slugs must not change (add `legacySlugs[]` if needed).

## 11. Provisional names
Proposed EN/AR names for all genuinely new designs: doc 14 §5 (not approved; no materials/sizes/certifications/availability claimed).
