# 06 — Business Content: Standard Dimensions & Customization (EN / AR)

Status: **dimension facts approved (2026-11-09); copy wording still proposed.** Numbers below are exactly those you supplied (cm). Nothing else is invented: **no wardrobe depth**, no other heights/lengths, no materials.

## 1. Fact base (what we may and may not say)

| Item | Approved fact | Interpretation rule |
|---|---|---|
| Bedroom wardrobe | **250 cm width × 230 cm height — CONFIRMED** | Depth is **not specified** and must never appear (no "60 cm", no "× D"). Copy labels width and height explicitly |
| Bedroom bed | 160 cm | "160 cm bed" (stated size). Do **not** write "160 × 200", "queen", "width" or mattress size |
| Bedroom nightstands | two, 50 cm each | "Two nightstands, 50 cm each" |
| Dressing table (bedroom) | 120–150 cm | range |
| Kids beds | two, 120 cm each | "Two beds, 120 cm each" |
| Kids wardrobe | 150 cm | stated size |
| Kids nightstand | one | no size stated → say "one nightstand", no number |
| Kids dressing table | available on request | |
| Customization | all standard sizes can be changed to customer requirements and manufacturing feasibility | selling point |
| Dressing Rooms | **no standard dimensions provided** | copy must say made-to-measure, nothing numeric |

**Hard rules for the UI:** (0) the wardrobe line is **"250 cm wide × 230 cm high"** everywhere (card chips never show it; the detail block only); (1) label the block "Standard reference dimensions", never "this product's dimensions"; (2) show the block only on products tagged `dimensionProfile`; (3) a product that visibly lacks a component (e.g. bedroom room 4 shows a **bench** that is not in the standard list; room 1 has **no bench**) still shows the standard block but with the line "Included pieces vary by design — confirmed in your quotation"; (4) product-specific confirmed sizes in `pieces[].dims` always override and hide the standard line for that piece; (5) kids standard is *not* applied to kids designs that visibly show a single bed (e.g. kids room 8) — the block still reads "Standard reference", and the quotation confirms (Q6).

## 2. Block A — Bedroom Sets

**EN**
> **Standard dimensions & customization**
> Our standard bedroom set is built around these reference sizes (in cm):
> - Wardrobe: 250 cm wide × 230 cm high
> - Bed: 160
> - Two nightstands: 50 each
> - Dressing table: 120–150
>
> These are standard reference sizes, not fixed ones. Every size can be adjusted to your requirements, subject to production feasibility. Wardrobe depth and other unspecified dimensions are confirmed in your quotation. The pieces included in each design and the final specifications are confirmed in your quotation.
> [Request a quotation →] [Ask on WhatsApp →]

**AR**
> **المقاسات القياسية وإمكانية التخصيص**
> تعتمد غرفة النوم القياسية لدينا على المقاسات المرجعية التالية (بالسنتيمتر):
> - الدولاب: عرض ٢٥٠ × ارتفاع ٢٣٠
> - السرير: ١٦٠
> - كومودينو عدد ٢: ٥٠ لكل منهما
> - التسريحة: من ١٢٠ إلى ١٥٠
>
> هذه مقاسات مرجعية قياسية وليست ثابتة؛ يمكن تعديل جميع المقاسات حسب احتياجات العميل، وبما يتوافق مع إمكانيات التصنيع. وتُؤكَّد القطع المتضمَّنة في كل تصميم والمواصفات النهائية ضمن عرض السعر، ويُحدَّد عمق الدولاب وأي أبعاد غير مذكورة عند إعداد العرض.
> [اطلب عرض سعر ←] [تواصل عبر واتساب ←]

(Arabic numerals: site copy elsewhere should be checked for Western vs Eastern digits for consistency — open question Q7; the plan uses Eastern digits here only as a draft.)

## 3. Block B — Kids' Bedroom Sets

**EN**
> **Standard dimensions & customization**
> Our standard kids' bedroom set includes (sizes in cm):
> - Two beds: 120 each
> - Wardrobe: 150
> - One nightstand
> - Dressing table: available on request
>
> Standard sizes can be changed to suit your requirements and what production allows. Included pieces and final specifications are confirmed in your quotation.

**AR**
> **المقاسات القياسية وإمكانية التخصيص**
> تتضمن غرفة الأطفال القياسية لدينا (المقاسات بالسنتيمتر):
> - سريران: ١٢٠ لكل منهما
> - الدولاب: ١٥٠
> - كومودينو واحد
> - التسريحة: متاحة عند الطلب
>
> يمكن تغيير المقاسات القياسية بما يناسب احتياجاتكم وإمكانيات التصنيع. وتُؤكَّد القطع المتضمَّنة والمواصفات النهائية ضمن عرض السعر.

## 4. Block C — Dressing Rooms (no numbers)

**EN** — *Made to measure.* "Dressing rooms are planned around your space. Layout, dimensions, finishes and accessories are defined with you and confirmed in the quotation, subject to production feasibility."
**AR** — *تصنيع حسب المقاس.* "تُصمَّم غرف الدريسينج بما يناسب مساحتكم؛ ويتم تحديد التقسيم والمقاسات والتشطيبات والإكسسوارات معكم وتأكيدها ضمن عرض السعر، وبما يتوافق مع إمكانيات التصنيع."

## 5. Short forms (card chip / Inquiry note placeholder / WhatsApp)

| Use | EN | AR |
|---|---|---|
| Card chip (bedroom/kids/dressing) | "Custom sizes available" | "متاح بمقاسات حسب الطلب" |
| Detail page sub-line under the title | "Standard sizes · customizable" | "مقاسات قياسية · قابلة للتعديل" |
| Inquiry note placeholder | "Preferred sizes or changes (optional)" | "المقاسات أو التعديلات المطلوبة (اختياري)" |
| WhatsApp prefill suffix | "I'd like to discuss custom sizes." | "أرغب في مناقشة مقاسات مخصصة." |
| Custom-manufacturing page line | "All standard sizes can be adapted to your specification, subject to production feasibility." | "يمكن تعديل جميع المقاسات القياسية وفق مواصفاتكم، وبما يتوافق مع إمكانيات التصنيع." |

## 6. Claim-control checklist (keeps the page truthful)

- Do **not** write "made in our factory", "own production" or similar — the business is asset-light via partners.
- Do **not** show the kids infographic's "120 × 200", "Premium Fabric", "Melamine Counter" (unconfirmed).
- Always keep the "Illustrative design" badge on concept renders; standard-dimension copy must not suggest the image is a certified specification.
- No prices, lead times or MOQ in this block.

## 7. Implementation notes

Add keys under `messages/{en,ar}.json` → `dimensions.bedroom|kids|dressing|short.*`; the existing AR/EN key-parity test covers them. Render in `DetailView` from `product.dimensionProfile`. Effort S; priority P1 (copy approval is the gate). Acceptance: block visible only on tagged products, RTL list order correct, no number appears that is not in §1.

## 8. Data representation of the approved numbers (no invented fields)

Standard dimensions are stored **once**, not per product (doc 04 §2). Unspecified values are explicit `null`, never a guess:

```ts
const STANDARD_DIMENSIONS = {
  'bedroom-standard': {
    wardrobe:    { width: 250, height: 230, depth: null },
    bed:         { size: 160 },                 // meaning of "160" not further specified
    nightstand:  { count: 2, size: 50 },
    dressingTable: { min: 120, max: 150 },
  },
  'kids-standard': {
    beds:        { count: 2, size: 120 },
    wardrobe:    { size: 150 },
    nightstand:  { count: 1 },
    dressingTable: 'on-request',
  },
  unit: 'cm', customizable: true,
} as const;
```
A test asserts that no rendered dimension string contains a number outside this object, and that `wardrobe.depth` is never rendered while `null`.
