# 07 — Arabic / English review

Reviewed: all UI strings in `messages/ar.json` vs `en.json` for catalog, product, inquiry, dimensions, archived, hero, nav, footer and CTA namespaces; all 55 product names (EN/AR); Arabic screenshots of home, categories, product, inquiry, about, shipping, contact (RTL).

## What is correct
- Full RTL mirroring (header, breadcrumbs, grids, thumbnails, arrows, form labels); Arabic typeface (IBM Plex Sans Arabic) applied; Latin trade terms (L/C, T/T, EXW/FOB/CFR/CIF, CBM, reference codes) correctly kept LTR inside Arabic text.
- **Western digits are used consistently** in Arabic UI and dimensions (no mixed Eastern/Western digits).
- Approved dimensions render exactly: EN "250 cm wide × 230 cm high", "160 cm", "2 pieces, 50 cm each", "120–150 cm"; kids "2 beds, 120 cm each", "150 cm", "1 nightstand", "Available on request"; AR "عرض 250 سم × ارتفاع 230 سم", "160 سم", "عدد 2، 50 سم لكل منهما", "من 120 إلى 150 سم", kids "عدد 2، 120 سم لكل سرير"… **No depth, length or material is invented** (a unit test enforces it). Customization wording matches the approved copy, with the wardrobe-depth note.
- Inquiry List, RFQ validation and archived-item wording read naturally in Arabic; category names consistent between menu, tabs, cards, breadcrumbs.

## Defects
| ID | Sev. | Finding | Where | Fix |
|---|---|---|---|---|
| AR-01 | Medium | Plural agreement: counts ≥ 11 use the plural noun ("**12 مجموعات**", "**14 مجموعات**", also "{n} مجموعات مختارة", "{n} بنود غير متاحة"). Arabic requires singular after 11–99 ("12 مجموعة"). Visible now because categories hold 11–14 items. | `collections.count`, `category.count`, `inquiry.selected`, `inquiry.archivedNotice` | plural helper by n (1, 2, 3–10, 11+) |
| AR-02 | Low | Adjective agreement: "طقم غرفة نوم بألواح **كريمي**" → "كريمية". | `pv-br-07` AR name | edit name |
| AR-03 | Low | EN and AR names of two legacy products disagree: `pv-lr-02` EN "Teal Sectional Sofa" / AR "ركنة تيل لاين" (poster: "Teal Line Corner Sofa"); `pv-lr-03` EN "Luxury Corner Sofa" / AR "ركنة رويال كونتراست" (poster: "Royal Contrast Corner Sofa"). | catalog | align names (owner) |
| AR-04 | Owner | Terminology is Egyptian: الانتريهات، النيش، دريسينج، كومودينو، ركنة. For GCC importers consider الكنب/المجالس، فتارين العرض، غرف الملابس، طاولة جانبية، كنب زاوية. | category/product names | owner decision |
| AR-05 | Low | Unit "أطقم/sets" is used for every product, including single sofas/chaise ("الكمية (أطقم)"). | `unit` data | `piece` for single items |
| AR-06 | Low | Product descriptions/meta are the same generic sentence for all 55 products in both languages. | catalog | write per-product text (no new facts) |
| EN-01 | Low | "1 results for “PV-DG-03”" (singular missing). Naming style: legacy "Kids Bedroom Set" vs new "Kids' Bedroom Set". | `collections.results`, names | `results` plural helper; unify apostrophe |
| CONT-01 | Low | Marketing copy lists categories without Dressing Rooms (Home "What we offer", About paragraph, Custom page chips; also omits Kids on the Custom page). | `messages` | add Dressing Rooms |
