import categoriesJson from '@/data/catalog/categories.json';
import productsJson from '@/data/catalog/products.json';
import stylesJson from '@/data/catalog/styles.json';
import type { Locale } from '@/i18n/routing';
import type { Category, Localized, Product, ProductImage } from './types';

export * from './types';

export const styles = stylesJson as Record<string, Localized>;
const products = productsJson as unknown as Product[];

/** Categories that actually have products, in display order (matches the approved prototype). */
export const categories: Category[] = (categoriesJson as Category[])
  .slice()
  .sort((a, b) => a.sort - b.sort)
  .filter((c) => products.some((p) => p.categoryId === c.id));

export const allProducts = (): Product[] => products;
export const categoryById = (id: string) => categories.find((c) => c.id === id);
export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
export const productsInCategory = (categoryId: string) =>
  products.filter((p) => p.categoryId === categoryId).sort((a, b) => a.sort - b.sort);
export const productById = (id: string) => products.find((p) => p.id === id);
export const productBySlug = (categorySlug: string, slug: string) => {
  const c = categoryBySlug(categorySlug);
  return c ? products.find((p) => p.categoryId === c.id && p.slug === slug) : undefined;
};

/** Localized gallery with fallback to the other language, so a missing variant never breaks a page. */
export function galleryFor(p: Product, locale: Locale): ProductImage[] {
  const own = p.gallery[locale];
  if (own?.length) return own;
  return p.gallery.en?.length ? p.gallery.en : (p.gallery.ar ?? []);
}

export const relatedProducts = (p: Product, limit = 3) =>
  products.filter((x) => x.categoryId === p.categoryId && x.id !== p.id).slice(0, limit);

export const loc = (o: Localized | null | undefined, locale: Locale): string => (o ? (o[locale] ?? o.en) : '');

export function matchesQuery(p: Product, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  const c = categoryById(p.categoryId);
  return [p.name.en, p.name.ar, p.code, c?.name.en, c?.name.ar].some((v) => String(v ?? '').toLowerCase().includes(query));
}
