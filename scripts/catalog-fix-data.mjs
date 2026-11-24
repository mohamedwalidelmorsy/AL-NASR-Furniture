/** Owner-approved catalog fixes (2026-11-09): data tables used by apply-approved-fixes.mjs. Descriptions describe only what the images visibly show. */
export const SUFFIX = {
  en: 'Illustrative design — final pieces, materials, finishes and dimensions are confirmed during quotation.',
  ar: 'تصميم توضيحي — تُؤكَّد القطع والخامات والتشطيبات والمقاسات النهائية عند إعداد عرض السعر.',
};

/** Approved duplicate pairs: legacy record keeps its id/URL and receives the duplicate's clean gallery. */
export const MERGES = [
  { keep: 'pv-br-01', dup: 'pv-br-12', evidence: 'docs/reports/full-website-audit/evidence/compare/case1-softarc-vs-arc-headboard.jpg' },
  { keep: 'pv-br-02', dup: 'pv-br-08', evidence: 'docs/reports/full-website-audit/evidence/compare/case2-curve-vs-curved-headboard.jpg' },
  { keep: 'pv-br-03', dup: 'pv-br-09', evidence: 'docs/reports/full-website-audit/evidence/compare/case3-upholstered-vs-padded.jpg' },
  { keep: 'pv-br-04', dup: 'pv-br-07', evidence: 'docs/reports/full-website-audit/evidence/compare/case4-luxe-vs-cream-panel.jpg' },
];
export const ARCHIVE = ['pv-kb-01', 'pv-kb-02', 'pv-kb-03'];
/** Primary-category corrections (same product id; old URLs redirect 308). */
export const MOVES = { 'pv-lr-01': 'corner-sofas', 'pv-lr-02': 'corner-sofas', 'pv-lr-03': 'corner-sofas', 'pv-co-03': 'living-rooms' };
/** Legitimate cross-listing (one record, canonical URL under its primary category). */
export const ALSO_IN = { 'pv-dr-01': ['china-cabinets'], 'pv-dr-02': ['china-cabinets'] };
/** Legacy corner-sofa EN posters carried marketing claims; the clean bilingual poster of the same design (AR file) is used for both languages. */
export const POSTER_FROM_AR = ['pv-lr-01', 'pv-lr-02', 'pv-lr-03'];

export const UNIT_KIND = { bedrooms: 'bedroom-set', 'kids-bedrooms': 'kids-set', 'dressing-rooms': 'dressing-room', 'corner-sofas': 'corner-sofa', 'living-rooms': 'sofa', 'china-cabinets': 'display-cabinet', 'dining-rooms': 'dining-set' };
export const UNIT_OVERRIDE = { 'pv-lr-09': 'chaise', 'pv-lr-06': 'sofa-set' };
export const COARSE_UNIT = { 'bedroom-set': 'set', 'kids-set': 'set', 'dining-set': 'set', 'sofa-set': 'set', 'display-cabinet': 'set', 'dressing-room': 'piece', 'corner-sofa': 'piece', sofa: 'piece', chaise: 'piece' };

export const NAMES = {
  'pv-br-07': { ar: 'طقم غرفة نوم بألواح كريمية' },
  'pv-co-01': { ar: 'كنبة زاوية معيارية كاكاو' }, 'pv-co-02': { ar: 'كنبة زاوية بيضاء مينيمال' },
  'pv-lr-01': { en: 'Soft Arc Corner Sofa', ar: 'كنبة زاوية بقوس ناعم' },
  'pv-lr-02': { en: 'Teal Line Corner Sofa', ar: 'كنبة زاوية تيل لاين' },
  'pv-lr-03': { en: 'Royal Contrast Corner Sofa', ar: 'كنبة زاوية رويال كونتراست' },
  'pv-co-04': { ar: 'كنبة زاوية حرف L عصرية' }, 'pv-co-05': { ar: 'كنبة زاوية كونتور' }, 'pv-co-06': { ar: 'كنبة زاوية حرف U كبيرة' }, 'pv-co-07': { ar: 'كنبة زاوية بلاش لوكس' },
  'pv-lr-06': { ar: 'طقم كنب هارموني' },
  'pv-cc-01': { ar: 'طقم بوفيه وخزائن عرض أنيق' }, 'pv-cc-03': { ar: 'طقم خزائن عرض منحنية' }, 'pv-cc-04': { ar: 'طقم بوفيه وخزائن عرض مودرن' },
  'pv-dg-01': { ar: 'غرفة ملابس بأبواب زجاجية' }, 'pv-dg-02': { ar: 'غرفة ملابس بألواح بيج داكن' }, 'pv-dg-03': { ar: 'غرفة ملابس ركنية بأبواب زجاجية وتسريحة' },
  'pv-dg-05': { ar: 'وحدة ملابس مفتوحة بأبواب زجاجية' }, 'pv-dg-06': { ar: 'وحدة ملابس بألواح مضلعة' },
  'pv-kb-04': { ar: 'طقم غرفة نوم أطفال بهيدبورد رمادي' }, 'pv-kb-05': { ar: 'طقم غرفة نوم أطفال توأم بحائط مذاكرة' }, 'pv-kb-06': { ar: 'طقم غرفة نوم أطفال توأم بلون وردي وأقواس' },
  'pv-kb-07': { ar: 'طقم غرفة نوم أطفال توأم بلون فاتح' }, 'pv-kb-08': { ar: 'طقم غرفة نوم أطفال بركن مذاكرة' }, 'pv-kb-09': { ar: 'طقم غرفة نوم أطفال توأم بطابع الغابة' },
  'pv-kb-10': { ar: 'طقم غرفة نوم أطفال توأم متماثل' }, 'pv-kb-11': { ar: 'طقم غرفة نوم أطفال بطابع الدببة' },
};

/** [English, Arabic] design-specific sentence per product (visible features only). Merged bedroom pairs describe the clean gallery. */
export const DESC = {
  'pv-br-01': ['Bedroom set in a silver-grey tone with a stacked arch headboard and light strip, striped bedding, an upholstered bench, a round-mirror dressing table with pouf, nightstands and a wardrobe with a mirror panel and curved inlay lines.', 'طقم غرفة نوم بدرجة الرمادي الفضي بهيدبورد قوسي متدرج وشريط إضاءة، مع بنش مُنجَّد وتسريحة بمرآة مستديرة وبوف وكومودات ودولاب بلوح مرآة وخطوط منحنية.'],
  'pv-br-02': ['Bedroom set with a swooping padded headboard in a wood-tone frame, a stepped bench with drawers, nightstands, a multi-door wardrobe and a dressing table with a framed mirror and pouf.', 'طقم غرفة نوم بهيدبورد مبطن منحني بإطار بدرجة الخشب، مع بنش متدرج بأدراج وكومودات ودولاب متعدد الأبواب وتسريحة بمرآة بإطار وبوف.'],
  'pv-br-03': ['Bedroom set with two stacked rounded padded headboard panels in a wood-tone frame, a front bench, bedside units with gold-tone handles, a wardrobe with a shaped mirror panel and a dressing table with pouf.', 'طقم غرفة نوم بهيدبورد من لوحين مبطنين مستديري الحواف بإطار بدرجة الخشب، مع بنش أمامي وكومودات بمقابض ذهبية ودولاب بلوح مرآة بتصميم منحني وتسريحة وبوف.'],
  'pv-br-04': ['Bedroom set with a cream padded headboard against a marble-look wall, a front bench with a wood-tone inset, a wardrobe with fluted panels and dark glass, and a dressing table with a round mirror.', 'طقم غرفة نوم بهيدبورد مبطن كريمي أمام جدار بمظهر الرخام، مع بنش أمامي بحشوة بدرجة الخشب ودولاب بألواح مضلعة وزجاج داكن وتسريحة بمرآة مستديرة.'],
  'pv-br-05': ['Bedroom set with a padded headboard in a wood-tone frame, ivory-and-wood two-tone wardrobe panels, nightstands and a dressing table with pouf.', 'طقم غرفة نوم بهيدبورد مبطن بإطار بدرجة الخشب، ودولاب بألواح ثنائية اللون عاجي وخشبي، مع كومودات وتسريحة وبوف.'],
  'pv-br-06': ['Glossy ivory bedroom set with an arched headboard, an upholstered bench, a wardrobe with mirror panels, nightstands and a round-mirror dressing table.', 'طقم غرفة نوم عاجي لامع بهيدبورد مقوس، مع بنش مُنجَّد ودولاب بألواح مرآة وكومودات وتسريحة بمرآة مستديرة.'],
  'pv-br-10': ['Bedroom set with an upholstered grey bed and panelled headboard with dark inserts, a grey wardrobe with glass-door panels and interior lighting, and a dressing table with a lit mirror and display tower.', 'طقم غرفة نوم بسرير رمادي مُنجَّد وهيدبورد بألواح وإضافات داكنة، مع دولاب رمادي بأبواب زجاجية وإضاءة داخلية وتسريحة بمرآة مضاءة وبرج عرض.'],
  'pv-br-11': ['Bedroom set in wood tones with a large headboard, nightstands, a wardrobe with a tall mirror panel and a dressing table with an octagon mirror.', 'طقم غرفة نوم بدرجات الخشب بهيدبورد كبير، مع كومودات ودولاب بلوح مرآة طويل وتسريحة بمرآة ثمانية الأضلاع.'],
  'pv-kb-04': ["Kids' bedroom set with a grey-and-cream padded headboard, a wood-tone wardrobe with an illuminated mirror panel and a vanity.", 'غرفة نوم أطفال بهيدبورد مبطن رمادي وكريمي، مع دولاب بدرجة الخشب بلوح مرآة مضاء وتسريحة.'],
  'pv-kb-05': ["Twin kids' bedroom set with padded headboards and a wardrobe wall with a built-in study desk and shelves.", 'غرفة نوم أطفال توأم بهيدبورد مبطن، مع حائط دواليب يضم مكتب مذاكرة وأرفف مدمجة.'],
  'pv-kb-06': ["Pink twin kids' bedroom set with scalloped headboards, arched wardrobe doors, a vanity niche and a shelf unit.", 'غرفة نوم أطفال توأم بلون وردي بهيدبورد مموج وأبواب دولاب مقوسة وركن تسريحة ووحدة أرفف.'],
  'pv-kb-07': ["Twin kids' bedroom set in light tones with a wardrobe wall with a mirror door and a desk with drawers.", 'غرفة نوم أطفال توأم بألوان فاتحة، مع حائط دواليب بباب مرآة ومكتب بأدراج.'],
  'pv-kb-08': ["Kids' bedroom set with a wardrobe wall with shelves, a study desk with a mirror and wall shelves.", 'غرفة نوم أطفال بحائط دواليب وأرفف، مع مكتب مذاكرة ومرآة وأرفف حائط.'],
  'pv-kb-09': ["Jungle-theme twin kids' bedroom set with green scalloped headboards, painted animal motifs and a wardrobe with desk.", 'غرفة نوم أطفال توأم بطابع الغابة بهيدبورد أخضر مموج ورسومات حيوانات ودولاب بمكتب.'],
  'pv-kb-10': ["Symmetrical twin kids' bedroom set with padded headboards, a central wardrobe in a light wood tone and side drawers.", 'غرفة نوم أطفال توأم متماثلة بهيدبورد مبطن ودولاب مركزي بدرجة الخشب الفاتح وأدراج جانبية.'],
  'pv-kb-11': ["Kids' bedroom set with a padded headboard in a wood-tone frame, a wardrobe with mirror doors, a nightstand and teddy-bear wall art.", 'غرفة نوم أطفال بهيدبورد مبطن بإطار بدرجة الخشب، مع دولاب بأبواب مرآة وكومود ولوحات دببة على الجدار.'],
  'pv-dg-01': ['Corner dressing room with glass-door units, warm lighting and a tufted bench.', 'غرفة ملابس ركنية بوحدات بأبواب زجاجية وإضاءة دافئة وبنش مكسو.'],
  'pv-dg-02': ['Taupe flat-panel wardrobe wall with mirror doors and vertical light strips.', 'حائط دواليب بلوح مسطح بدرجة البيج الداكن، بأبواب مرآة وشرائط إضاءة رأسية.'],
  'pv-dg-03': ['Corner glass-door dressing room with warm lighting and a vanity niche with an oval mirror.', 'غرفة ملابس ركنية بأبواب زجاجية وإضاءة دافئة، مع ركن تسريحة بمرآة بيضاوية.'],
  'pv-dg-04': ['White wardrobe wall with a lit oval-mirror vanity niche, drawers and a glass display tower.', 'حائط دواليب أبيض بركن تسريحة بمرآة بيضاوية مضاءة وأدراج وبرج عرض زجاجي.'],
  'pv-dg-05': ['Open wardrobe bay with drawers between two glass-door units.', 'وحدة ملابس مفتوحة بأدراج بين وحدتين بأبواب زجاجية.'],
  'pv-dg-06': ['White wardrobe doors with a slatted shelf panel and a glass display tower.', 'أبواب دولاب بيضاء مع لوح أرفف مضلع وبرج عرض زجاجي.'],
  'pv-co-01': ['Brown L-shaped corner sofa with a chaise.', 'كنبة زاوية بنية بشكل حرف L مع شيزلونج.'],
  'pv-co-02': ['White L-shaped corner sofa with a chaise and slim legs.', 'كنبة زاوية بيضاء بشكل حرف L مع شيزلونج وأرجل رفيعة.'],
  'pv-co-03': ['Olive-green curved sofa with rounded cushions.', 'كنبة منحنية بلون الزيتي بوسائد مستديرة.'],
  'pv-co-04': ['Dark grey L-shaped corner sofa with cushions and ottomans.', 'كنبة زاوية رمادية داكنة بشكل حرف L مع وسائد وبوفات.'],
  'pv-co-05': ['Cream curved corner sofa with dark piping.', 'كنبة زاوية كريمية منحنية بحواف داكنة.'],
  'pv-co-06': ['Large beige U-shaped corner sofa.', 'كنبة زاوية كبيرة بيج بشكل حرف U.'],
  'pv-co-07': ['Blush-pink L-shaped corner sofa with matching ottomans.', 'كنبة زاوية وردية بشكل حرف L مع بوفات متناسقة.'],
  'pv-lr-01': ['Brown curved corner sofa with a soft arc silhouette and wood-tone base.', 'كنبة زاوية بنية بخط منحنٍ ناعم وقاعدة بدرجة الخشب.'],
  'pv-lr-02': ['Teal L-shaped corner sofa with raised headrests and a chaise.', 'كنبة زاوية تيل بشكل حرف L مع مساند رأس وشيزلونج.'],
  'pv-lr-03': ['Blue-and-ivory corner sofa with quilted side detail.', 'كنبة زاوية بالأزرق والعاجي بتفصيلة مبطنة على الجانب.'],
  'pv-lr-04': ['Cream channelled sofa with large bolster-style cushions and a wood-tone arm inlay.', 'كنبة كريمية بوسائد كبيرة بتقسيم طولي وتفصيلة بدرجة الخشب على الذراع.'],
  'pv-lr-05': ['Grey sofa with a slim wood-tone frame.', 'كنبة رمادية بإطار رفيع بدرجة الخشب.'],
  'pv-lr-06': ['Living-room set with a sofa, two round armchairs and coffee tables.', 'طقم كنب يضم كنبة وفوتيهين دائريين وطاولات قهوة.'],
  'pv-lr-07': ['White ribbed-cushion sofa with rolled arms and tapered metal-tone feet.', 'كنبة بيضاء بوسائد مضلعة وأذرع ملفوفة وأرجل مدببة بلون معدني.'],
  'pv-lr-08': ['Burnt-orange curved sofa.', 'كنبة منحنية بلون البرتقالي المحروق.'],
  'pv-lr-09': ['White chaise longue with dark tapered legs and a bolster cushion.', 'شيزلونج أبيض بأرجل داكنة مدببة ووسادة أسطوانية.'],
  'pv-lr-10': ['Ivory ribbed-cushion sofas with rolled arms and tapered metal-tone feet, shown as a two-sofa arrangement.', 'كنبتان عاجيتان بوسائد مضلعة وأذرع ملفوفة وأرجل مدببة بلون معدني، بتنسيق كنبتين.'],
  'pv-lr-11': ['Ivory bouclé-look curved sofa with wooden accents.', 'كنبة منحنية عاجية بمظهر البوكليه مع لمسات خشبية.'],
  'pv-lr-12': ['Emerald-green ribbed sofa.', 'كنبة خضراء زمردية بوسائد مضلعة.'],
  'pv-lr-13': ['Pearl-toned ribbed sofa with a gold-tone base.', 'كنبة بدرجة اللؤلؤ بوسائد مضلعة وقاعدة بلون ذهبي.'],
  'pv-cc-01': ['Buffet with two display vitrines and oval wall mirrors, in dark wood tones.', 'بوفيه مع فاترينتين للعرض ومرايا بيضاوية، بدرجات الخشب الداكنة.'],
  'pv-cc-02': ['Mirrored sideboard with a tall mirrored display cabinet and oval wall mirrors.', 'بوفيه بمرايا مع خزانة عرض طويلة بمرايا ومرايا بيضاوية للجدار.'],
  'pv-cc-03': ['Curved display cabinets with illuminated shelves, a buffet and a shaped wall mirror.', 'خزائن عرض منحنية برفوف مضاءة مع بوفيه ومرآة جدارية بتصميم منحنٍ.'],
  'pv-cc-04': ['Beige display cabinets with a buffet and a shaped wall mirror.', 'خزائن عرض بيج مع بوفيه ومرآة جدارية بتصميم منحنٍ.'],
  'pv-dr-01': ['Oval dining table with six upholstered chairs, display cabinets and a sideboard.', 'طاولة سفرة بيضاوية مع ستة كراسي مكسوة وخزائن عرض وبوفيه.'],
  'pv-dr-02': ['Square dining table with upholstered chairs, a sideboard and display cabinets.', 'طاولة سفرة مربعة مع كراسي مكسوة وبوفيه وخزائن عرض.'],
};
