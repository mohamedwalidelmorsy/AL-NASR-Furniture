# 02 — Google Drive Asset Inventory (live audit, 2026-11-09)

Source folder: `الكتالوج` — `1K6J5ucRbYKr1anMzRVLHQTcQ9o4aIdsE` (owner account `boudyshehap43@gmail.com`, shared to the business account; read-only access used).
**Nothing in Drive was moved, renamed, modified or deleted.** Full per-file listing (137 rows, all Drive file IDs, folder IDs, bytes, type, role guess, inspection flag): [`data/drive-inventory-2026-11-09.csv`](data/drive-inventory-2026-11-09.csv).

## 1. Method and its limits (read first)

| Aspect | What was actually done |
|---|---|
| Listing | Drive connector `search_files` (owner + `mimeType image/*`, split by creation date to avoid truncation) plus `get_file_metadata` for every parent folder ID; folder paths rebuilt from `parentId`. Pagination was followed. **Duplicate rows across page boundaries were detected and removed** (7 repeats → 137 unique IDs). |
| Not listed | Non-image files (docs, videos) were not enumerated. Images owned by a different account or created outside the two date windows would be missed — **[Not verified]**; none were seen. The connector cannot return image width/height or hashes; dimensions below exist only for downloaded files. |
| Visual verification | **18 images were downloaded and actually opened** (plus the hero PNG). They are marked `yes` in the CSV. The other **119 are metadata-only** (name, size, folder). Everything about them beyond that is an inference and is labelled so. |
| Image bytes | Binary download works through the connector (saved to a scratch folder, base64 → image). Doing this for all 137 files was judged impractical; a local script with a Drive token (existing `catalog:import`) is the right tool and is part of the roadmap. A `gcloud` token attempt in this session was blocked by the permission classifier and was not pursued. |

## 2. Verified counts

| Measure | Value |
|---|---|
| Unique image files found by the connector | 137 (212.5 MB) — **of which 20 are deleted-by-decision (Trash)** |
| **Active source of truth** | **117 images** (170.4 MB) — the only images counted as available; subject to a fresh inventory before implementation |
| In **active** folders | **117** (170.4 MB) |
| In **trashed** folders (`اطفال/عربي`, `اطفال/انجليزي`) | 20 — intentionally deleted by the owner; excluded |
| Discrepancy with the external "≈133" | 133 is between 117 (active) and 137 (incl. trash); the exact figure depends on whether trashed files are counted. The Drive may change again — re-run the inventory before implementation. |
| Old inventory (repo) | 94 PNG. Only **14** of those Drive file IDs still exist (all China/Dining). 54 have a **byte-identical** file today (matched by exact size + name pattern; not a hash check): 14 China/Dining, 20 Arabic corner/living (now re-sorted between `ركن` and `انتريه`), 20 in the trashed kids folders. **40 old files have no counterpart**: 10 bedroom-AR, 10 bedroom-EN, 10 corner-EN, 10 living-EN. |

## 3. Folder tree and counts

```
الكتالوج  1K6J5ucRbYKr1anMzRVLHQTcQ9o4aIdsE
├─ اوض نوم  1DBRVHq3V03vhNWYZbSTmlGiLomD2Ocio
│  ├─ اوض نوم  1wKcc4JToFuN473SLd5TkID3o-MF3hCpw   → room 1…room 8                 (44 images)
│  └─ دريسينج  1gg8BMEbR2i26l4fQ1yMmgT6xPOylAfn1
│     └─ After  1kpUDcZ6Z3_WUvTTs22OgV6JWjbYjBuoH → folders 1…6                   (7 images)
├─ اطفال  1cvuqRiOSXvkRuJEOQYM67eO9dUo4jaAs
│  ├─ New folder  1SqlC5swYsd2-iQPAwiNtWzLOVP3OS82G → room 1…room 8               (32 images)   [note: "room8" without space]
│  ├─ عربي  1IQ9u1cZCxXARg4ndxBLIcoWHpYVDDeKk  [IN TRASH]                          (10)
│  └─ انجليزي  1ZzmdLIQejanPERKGiVkeH-mLuSFBQOA2  [IN TRASH]                       (10)
├─ ركن  1kLNgqf7mrjFMdMH5hCWpRNwTYsg8n_G6
│  └─ عربي  1paEbm96AS6prXZBR-zYO0dLrZJIlBoXM                                      (9)   — no English folder any more
├─ انتريه  10nd0AZccOUOpvY3cObm0akKeS3TWiYYU
│  └─ عربي  1TyFNZ2axBbpsISNLYPHq53LIe3K8xByG                                      (11)  — no English folder any more
└─ نيش و سفرة  1MiTnkJVimQqxHYot-agyMafqDSr_MMx5
   ├─ عربي  1tcM5iofwrSgPB4n-oDcq7JLhNn2maMKM                                      (7)
   └─ انجليزي  1SwHgiU5IT3UmGxTlAGrRczgOWjrkvd1A                                   (7)
```

| Folder | Folder ID | Images | Types | MB | Visually opened |
|---|---|---|---|---|---|
| Bedroom/room 1 | `1US4jsa_EuF4jOxnivPVzzjaJrua1sjxX` | 5 | jpg×5 | 0.8 | 1 |
| Bedroom/room 2 | `1Is3kiu3jBcePj00eiIdQk2t8fDQmZOSo` | 5 | png×5 | 12.5 | 0 |
| Bedroom/room 3 | `1ggYeOQGXyWBDgFrGefynq47EFAZM2Cj0` | 4 | png×4 | 9.6 | 0 |
| Bedroom/room 4 | `1a6E8dGRcdDeGdQ50AVuNZCfQHQVrBlFZ` | 7 | jpg×7 | 0.9 | 1 |
| Bedroom/room 5 | `1dlgW4aETlVEXAY9PS58lP5jjAo11VFPz` | 6 | jpg×6 | 1.0 | 1 |
| Bedroom/room 6 | `1gtZei35qT-sK2fn1TxyCONAv83-SXz9Q` | 7 | jpg×7 | 0.9 | 1 |
| Bedroom/room 7 | `11uRaHTlnbK-kqD7mED6V-YatxXAGoopN` | 4 | png×4 | 9.6 | 0 |
| Bedroom/room 8 | `1Eu5YR-PDCXOuoyGZAOfLP58CXO5859sM` | 6 | png×5/jpeg×1 | 13.3 | 2 |
| China/Dining (نيش و سفرة/انجليزي) | `1SwHgiU5IT3UmGxTlAGrRczgOWjrkvd1A` | 7 | png×7 | 15.1 | 0 |
| China/Dining (نيش و سفرة/عربي) | `1tcM5iofwrSgPB4n-oDcq7JLhNn2maMKM` | 7 | png×7 | 15.3 | 1 |
| Corner Sofas (ركن/عربي) | `1paEbm96AS6prXZBR-zYO0dLrZJIlBoXM` | 9 | png×9 | 21.2 | 1 |
| Dressing/After/1 | `1rySyQz2EeNvLRqbG4fwbq58vWfZjDXZs` | 1 | jpg×1 | 0.1 | 1 |
| Dressing/After/2 | `1CFwFeRuVGj4gm19WxSTWd-MXTZsj26gB` | 2 | jpg×2 | 0.1 | 0 |
| Dressing/After/3 | `1hz-R2CyNM_ICPjJp_vaw9eeM0oekbxwe` | 1 | jpg×1 | 0.4 | 1 |
| Dressing/After/4 | `1ifCCUsuebSgyGQek7IndwkzW9aB9j7jo` | 1 | jpg×1 | 0.3 | 1 |
| Dressing/After/5 | `15K-heoR6v0VnhsOqhxqwRB6dJrF-AaET` | 1 | jpg×1 | 0.1 | 1 |
| Dressing/After/6 | `1TrLP-0Pxz3aP4psYDQ9iKwG9V0ZRAFWy` | 1 | jpg×1 | 0.1 | 1 |
| Kids OLD/انجليزي [TRASHED] | `1ZzmdLIQejanPERKGiVkeH-mLuSFBQOA2` | 10 | png×10 | 20.7 | 0 |
| Kids OLD/عربي [TRASHED] | `1IQ9u1cZCxXARg4ndxBLIcoWHpYVDDeKk` | 10 | png×10 | 21.3 | 0 |
| Kids/New folder/room 1 | `1tcrKUJt1quCGJd4poLR0yL0jSIXmuhUr` | 4 | jpg×4 | 0.9 | 1 |
| Kids/New folder/room 2 | `1B6hLbrc2-inas5B_zdMer2aevaN6DYZ-` | 7 | jpg×7 | 0.8 | 0 |
| Kids/New folder/room 3 | `1p14PgPBupgn2WWwQ-wNm9yrTB7faZG7U` | 6 | png×6 | 13.6 | 1 |
| Kids/New folder/room 4 | `1LWLvs63QbtYt1YhPGD_mgl2TLhwTtDCb` | 2 | png×2 | 4.6 | 0 |
| Kids/New folder/room 5 | `155S4TpR4raKnTXFs4AgpPsSLyNnBSln-` | 2 | png×2 | 4.3 | 0 |
| Kids/New folder/room 6 | `1CDiZQ0A9HsHf0CDVo3wIwAIA83U2CV3I` | 5 | png×5 | 10.7 | 0 |
| Kids/New folder/room 7 | `1mV4RR64UK1DCk06zS0h5cRrhPk2Yu9Ef` | 2 | png×2 | 3.7 | 1 |
| Kids/New folder/room 8 | `1mbbzKI66N8TvZoPg-pBLpU9SQyKpDuKg` | 4 | jpg×3/png×1 | 3.5 | 1 |
| Living Room Sofa Sets (انتريه/عربي) | `1TyFNZ2axBbpsISNLYPHq53LIe3K8xByG` | 11 | png×11 | 27.1 | 1 |

Subfolder counts match the brief: 8 bedroom rooms, 6 dressing designs, 8 kids rooms (in the active tree).

## 4. Findings that change the plan (all [Confirmed] unless noted)

1. **The old Drive IDs in production are largely dead.** 26 of the 36 image records in `products.json` point to file IDs that are gone: all 8 bedroom images (4 products × AR/EN), all 6 kids images (source intentionally deleted by the owner), the 3 corner-sofa EN, 3 living-room EN images (no counterpart at all), and the 3+3 Arabic corner/living images (bytes survive under new IDs). Only the 10 China/Dining images (`pv-cc-*`, `pv-dr-*`) still match by ID. Breakdown of the 36: **10 valid · 6 remappable** (Arabic corner/living: bytes exist in active folders under new IDs) **· 14 orphaned** (8 bedroom, 3 corner-EN, 3 living-EN) **· 6 deleted-by-decision** (kids; source intentionally deleted). The website keeps working (local WebP), but the provenance test and traceability need a remap table — see doc 03 §7.
2. **Language structure changed.** Bedroom, kids, dressing now have **no AR/EN split** (one set of images per room). Corner and living have **Arabic-only** poster folders; English poster variants are gone. Only China/Dining still has paired AR/EN posters.
3. **Two completely different image styles coexist** (visually confirmed on the sample):
   - *Clean room renders / detail crops* (bedroom `01_Main_Room`, `02…07_*_Detail`, kids `01…07`, dressing `01_Main`/`0n_Detail`): JPG, 0.04–0.6 MB, **low resolution** — e.g. bedroom mains 1199–1547 px wide, **ultra-wide 2.3–2.8:1** (1536×658, 1312×585, 1547×545, 1199×516), detail crops 366–443 px wide (dressing) — too small to serve at 1400 px without upscaling (not recommended).
   - *ChatGPT PNG posters/renders* (corner, living, China/Dining, bedroom rooms 2/3/7/8, kids rooms 3–7): ~2 MB PNG, 1024×1536 or 1536×1024 or 1448×1086; the corner/living/China/kids-3 ones carry **embedded bilingual marketing text** ("MODERN LIVING COLLECTION", "Dining Room Set | طقم سفرة", "Premium Furniture", kids-3 even prints "Bed Size (Each) 120×200 cm", "Premium Fabric", "Melamine Counter").
4. **Embedded claims need handling.** The kids-room-3 infographic prints dimensions/materials that are **not confirmed** business data (the owner's approved kids standard is two 120 cm beds, 150 cm wardrobe — no 200 cm length). Do not publish that image as a product image without owner review.
5. **A probable real photograph is mixed in.** `Bedroom/room 8/WhatsApp Image 2026-10-31 at 10.14.21 PM1.jpeg` (1080×1084) looks like a real showroom photo (wood floor, plug socket, real fabric) of a wardrobe with curved inlays, while the five `ChatGPT Image Nov 1` files in the same folder are renders. **[Inferred from viewing one render + the photo]** — ask the owner which is the real product and whether the renders depict it.
6. **Dressing rooms are thin.** 7 images for 6 designs: designs 3 and 4 have a main image; **1, 2, 5, 6 have only detail crops (1–2 each) and no main image**. Detail crops are 366–443 px wide.
7. **Room-folder completeness varies**: bedroom rooms 1, 4, 5, 6 follow a clean `01_Main_Room` + numbered detail naming (5–7 images); rooms 2, 3, 7, 8 contain only 4–6 ChatGPT PNGs whose roles (alternate views? different designs?) are **not verified** — they were not opened.
8. **Filename-only evidence is weak.** Kids rooms 3–7 mix descriptive names (`Sunlit Jungle-Themed Twin Bedroom (1).png`, `Warm Oak Dual Study Wall Unit.png`) with `ChatGPT Image Nov 2 …` names; kids room 8 mixes `01_Bed.jpg / 02_Wardrobe.jpg / 03_Nightstand.jpg` with `Warm Modern Bedroom Retreat-4.png` (opened: a complete bedroom render with teddy bears — a main image).
9. **Provenance:** every file name is either `ChatGPT Image <date>`, a descriptive ChatGPT-style title, `WhatsApp Image …`, or a numbered export (`01_Main_Room (n).jpg`). **No file is known to be a verified manufactured product** — treat all as *illustrative / concept* until the owner says otherwise (the production site already labels everything "Illustrative design").

## 5. Per-image classification

The 17 required attributes per image are in the CSV for those that can be stated from metadata (ID, name, path, type, size, category by folder, main/detail guess by filename, inspection flag). The attributes that need image bytes — dimensions, embedded text, render-vs-photo, visual similarity, duplicates — are **only filled for the 18 opened files**; a scripted pass over all files (dimensions, SHA-256, perceptual hash, OCR for embedded text) is a roadmap task (doc 08, task P0-1) rather than something to do by hand. 

### Opened images (visual verification done)

| Folder / file | Dimensions | What it is | Embedded text | Use |
|---|---|---|---|---|
| Bedroom/room 1 · 01_Main_Room (1).jpg | 1536×658 | Complete walnut/white bedroom render: bed, 2 nightstands, 4-door wardrobe, dressing table + pouf | none | cover (needs wide-aspect handling) |
| Bedroom/room 4 · 01_Main_Room (3).jpg | 1312×585 | Curved-headboard bed, bench, wardrobe, vanity | none | cover |
| Bedroom/room 5 · 01_Main_Room (4).jpg | 1547×545 | Upholstered bed, wavy-grain wardrobe, vanity | none | cover |
| Bedroom/room 6 · 01_Main_Room (4).jpg | 1199×516 | Grey/beige bed, glass-door wardrobe, vanity | none | cover |
| Bedroom/room 8 · ChatGPT Nov 1 01_52_41 PM-1.png | 1448×1086 | Silver-grey set with arc headboard, bench, round vanity mirror | none | cover (probable) |
| Bedroom/room 8 · WhatsApp Image 2026-10-31….jpeg | 1080×1084 | Photo-like grey wardrobe with mirror and curved inlays | none | **needs owner confirmation** |
| Dressing/After/3 · 01_Main.jpg | 1122×862 | Walk-in glass-door wardrobe corner with lit vanity niche | none | cover |
| Dressing/After/4 · 01_Main.jpg | 1122×784 | White wardrobe wall with mirror niche + shelf tower | none | cover |
| Dressing/After/1 · 04_Detail_3.jpg | 366×492 | Glass wardrobe interior, tufted bench | none | detail, **low-res** |
| Dressing/After/5 · 02_Detail_1.jpg | 443×598 | Open wardrobe interior with drawers | none | detail, **low-res** |
| Dressing/After/6 · 02_Detail_1.jpg | 389×604 | Slatted wall unit with shelves | none | detail, **low-res** |
| Kids/room 1 · 01_Main_Room (8).jpg | 1199×840 | Double-bed kids/teen room, sliding wardrobe | none; **a stitched strip of tiny thumbnails along the bottom edge** (collage artefact) | cover only after crop/regeneration decision |
| Kids/room 3 · Blush Glow Kids Bedroom Set (1).png | 1536×1024 | Pink twin-bed room **infographic** | **yes** (EN+AR, dimensions, materials, brand) | not as product image; clean room render needed |
| Kids/room 7 · Symmetrical Twin Bedroom with Oak Cabinetry.png | 1672×941 | Twin beds + central wardrobe, oak | none | cover |
| Kids/room 8 · Warm Modern Bedroom Retreat-4.png | 1536×1024 | Single-bed kids room with teddy bear, wardrobe, mirror | none | cover |
| China/Dining AR · …03_33_52 PM-3.png | 1024×1536 | Dining set + two vitrines + sideboard, **poster** | **yes** EN+AR ("MODERN HOME COLLECTION", "Dining Room Set \| طقم سفرة") | poster; thumbnail only if nothing cleaner |
| Corner Sofas AR · …03_00_51 PM-9.png | 1055×1491 | Blush corner sofa + pouf, **poster** | **yes** ("MODERN LIVING COLLECTION", "Blush Luxe Corner Sofa \| ركنة بلاش لوكس") | poster |
| Living Room AR · …11_46_08 AM-5.png | 1024×1536 | Poster of a single **cream chaise longue** ("Classic White Chaise \| شيزلونج أبيض كلاسيك") — a single seat, **not a sofa set**, despite sitting in the `انتريه` folder | **yes** (same "MODERN LIVING COLLECTION" template) | poster; shows folder labels ≠ content |
| **Hero** · `~/Downloads/Warm Neutral Luxury Living Room (1).png` | 1672×941 | Beige fluted sofa + armchair, walnut/marble round table, gold accents | none | hero (doc 07) |

## 6. Trashed folders — DECISION RECORDED (2026-11-09)

**Owner decision: the 20 files in the Trash were deleted on purpose. They must not be recovered, restored, copied or used, and are excluded from the active catalog and from every count that means "available".** `اطفال/عربي` and `اطفال/انجليزي` (10 PNG each) are those files; they were the source of `pv-kb-01..03`. The connector still lists them (their parent folders are trashed), so every inventory run must **filter out any file whose ancestor is trashed**. Nothing was or will be touched in Trash by this project.

## 7. What we cannot yet say

- Which bedroom-room-2/3/7/8 PNGs are alternates of the same set vs different sets (not opened).
- Whether detail crops are derived from the main image of the same room (likely, by naming and by the matching dark glass-wardrobe look in dressing 1/5 vs dressing 3 — **[Inferred]**).
- Exact dimensions/hash/embedded-text for 119 files.
