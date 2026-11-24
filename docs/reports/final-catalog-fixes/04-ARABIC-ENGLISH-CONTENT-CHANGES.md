# 04 — Arabic / English Content Changes

- **Plurals** (`src/lib/plural.ts`): AR 1 / 2 (dual) / 3–10 (plural) / 11+ (singular). e.g. "8 مجموعات", "11 مجموعة", "مجموعتان". Applied to collections, category, results and Inquiry counts.
- **Terminology** (GCC): غرف النوم، غرف ملابس (Dressing Rooms; "دريسينج" removed from content), غرف نوم أطفال، كنب زاوية، أطقم كنب، خزائن عرض، غرف سفرة، الكومود.
- **Names**: `pv-lr-02` Teal Line Corner Sofa / كنبة زاوية تيل لاين; `pv-lr-03` Royal Contrast Corner Sofa / كنبة زاوية رويال كونتراست; `pv-br-07` AR "طقم غرفة نوم بألواح كريمية".
- **Units** (`unitLabel`): bedroom set, kids set, dressing room, corner sofa, sofa, chaise longue, sofa set, dining set, display cabinet — singular/plural, EN and AR, on product page, Inquiry and RFQ UI. The RFQ payload keeps the coarse `unit` (`set|piece`).
- **Descriptions**: every active product has a unique, design-specific EN/AR sentence plus the standard disclosure ("Illustrative design — final pieces, materials, finishes and dimensions are confirmed during quotation."). No commercial claims, prices, materials or dimensions added.
- **Archived wording**: "This design is no longer available (for new inquiries)" / «هذا التصميم لم يعد متاحًا».
- **Chaise `pv-lr-09`**: unit wording only; identity unchanged.
- **404**: localized `<title>` ("Page not found" / «الصفحة غير موجودة»).
