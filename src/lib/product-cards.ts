import type { Locale } from '@/i18n/routing';
import { allMessages } from '@/lib/messages';
import { href } from '@/lib/links';
import { categoryById, galleryFor, loc, styles, allProducts, type Product, type Unit } from '@/lib/catalog';

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
  img: string;
  w?: number;
  h?: number;
  alt: string;
  /** Lower-cased haystack (both languages) for client-side search. */
  search: string;
}

export function toProductCard(p: Product, lang: Locale): ProductCard {
  const t = allMessages[lang];
  const c = categoryById(p.categoryId)!;
  const im = galleryFor(p, lang)[0];
  return {
    id: p.id, slug: p.slug, href: href(lang, `collections/${c.slug}/${p.slug}`),
    name: loc(p.name, lang), code: p.code, cat: loc(c.name, lang), catSlug: c.slug,
    style: p.style ? loc(styles[p.style], lang) : t.illustrative, unit: p.unit,
    img: im?.card ?? '', w: im?.width, h: im?.height, alt: `${loc(p.name, lang)} — ${t.illustrativeAlt}`,
    search: [p.name.en, p.name.ar, p.code, c.name.en, c.name.ar].join('\u0001').toLowerCase(),
  };
}

export const getProductCards = (lang: Locale): ProductCard[] =>
  allProducts().filter((p) => categoryById(p.categoryId)).map((p) => toProductCard(p, lang));
