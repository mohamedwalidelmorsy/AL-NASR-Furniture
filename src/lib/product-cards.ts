import type { Locale } from '@/i18n/routing';
import { allMessages } from '@/lib/messages';
import { href } from '@/lib/links';
import { categoryById, galleryFor, loc, styles, activeProducts, unitKindOf, type Product, type Unit, type UnitKind } from '@/lib/catalog';

/** Serializable, locale-resolved product summary for client components. */
export interface ProductCard {
  id: string;
  slug: string;
  href: string;
  name: string;
  code: string;
  cat: string;
  catSlug: string;
  style: string;
  unit: Unit;
  unitKind: UnitKind;
  img: string;
  w?: number;
  h?: number;
  /** Card image box: landscape room renders use 4/3, portrait posters 3/4. */
  box: '4/3' | '3/4';
  /** cover for room renders that fit the box, contain for posters/wide shots (nothing important is cropped). */
  fit: 'cover' | 'contain';
  /** Short chip, e.g. "Custom sizes available". */
  chip: string;
  alt: string;
  /** Lower-cased haystack (both languages) for client-side search. */
  search: string;
}

export function toProductCard(p: Product, lang: Locale): ProductCard {
  const t = allMessages[lang];
  const c = categoryById(p.categoryId)!;
  const im = galleryFor(p, lang)[0];
  const box = c.cardRatio ?? '3/4';
  const aspect = im ? im.width / im.height : 0.75;
  const fit = box === '4/3' && aspect >= 1.2 && aspect <= 1.75 ? 'cover' : 'contain';
  const custom = c.dimensionProfile !== undefined;
  return {
    box, fit, chip: custom ? t.detail.customSizes : '',
    id: p.id, slug: p.slug, href: href(lang, `collections/${c.slug}/${p.slug}`),
    name: loc(p.name, lang), code: p.code, cat: loc(c.name, lang), catSlug: c.slug,
    style: p.style ? loc(styles[p.style], lang) : t.illustrative, unit: p.unit, unitKind: unitKindOf(p),
    img: im?.card ?? '', w: im?.width, h: im?.height, alt: `${loc(p.name, lang)} — ${t.illustrativeAlt}`,
    search: [p.name.en, p.name.ar, p.code, c.name.en, c.name.ar].join('\u0001').toLowerCase(),
  };
}

export const getProductCards = (lang: Locale): ProductCard[] =>
  activeProducts().filter((p) => categoryById(p.categoryId)).map((p) => toProductCard(p, lang));
