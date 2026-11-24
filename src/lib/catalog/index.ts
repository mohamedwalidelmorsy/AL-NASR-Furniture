import categoriesJson from '@/data/catalog/categories.json';
import productsJson from '@/data/catalog/products.json';
import expansionJson from '@/data/catalog/products.expansion.json';
import stylesJson from '@/data/catalog/styles.json';
import standardDimensionsJson from '@/data/catalog/standard-dimensions.json';
import type { Locale } from '@/i18n/routing';
import type { Category, DimensionProfile, Localized, Product, ProductImage, UnitKind } from './types';

export * from './types';

export const styles = stylesJson as Record<string, Localized>;
/** Every record, in any lifecycle state (legacy first, then the catalog expansion). Ids and slugs are unique across both files. */
const products = [...(productsJson as unknown as Product[]), ...(expansionJson as unknown as Product[])];
export const standardDimensions = standardDimensionsJson as {
  unit: 'cm';
  customizable: boolean;
  profiles: Record<DimensionProfile, Record<string, unknown>>;
};

const isPublic = (p: Product) => (p.status ?? 'active') === 'active';

const listedIn = (p: Product, categoryId: string) => p.categoryId === categoryId || (p.alsoIn ?? []).includes(categoryId);

/** Categories that actually have public products, in display order (matches the approved prototype). */
export const categories: Category[] = (categoriesJson as Category[])
  .slice()
  .sort((a, b) => a.sort - b.sort)
  .filter((c) => products.some((p) => isPublic(p) && listedIn(p, c.id)));

/** All records that have a category, including archived/draft ones (they stay resolvable by id and URL). */
export const allProducts = (): Product[] => products;
/** Public catalog only. */
export const activeProducts = (): Product[] => products.filter(isPublic);
export const archivedProducts = (): Product[] => products.filter((p) => p.status === 'archived');
export const mergedProducts = (): Product[] => products.filter((p) => p.status === 'merged' && p.mergedInto);
/** Approved duplicate → continuing product id map (e.g. pv-br-12 → pv-br-01). Used to canonicalise old Inquiry Lists explicitly. */
export const mergeMap = (): Record<string, string> => Object.fromEntries(mergedProducts().map((p) => [p.id, p.mergedInto as string]));
export const categoryById = (id: string) => categories.find((c) => c.id === id);
export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
/** Public products listed under a category (primary category or `alsoIn`). */
export const productsInCategory = (categoryId: string) =>
  products.filter((p) => isPublic(p) && listedIn(p, categoryId)).sort((a, b) => a.sort - b.sort);
export const productById = (id: string) => products.find((p) => p.id === id);
/** Resolves by URL (primary category slug). Archived records resolve too, so old links never 404. */
export const productBySlug = (categorySlug: string, slug: string) => {
  const c = categoryBySlug(categorySlug) ?? (categoriesJson as Category[]).find((x) => x.slug === categorySlug);
  return c ? products.find((p) => p.categoryId === c.id && p.slug === slug && p.status !== 'draft' && p.status !== 'merged') : undefined;
};
export const isActive = isPublic;

/** Effective unit wording of a product (product override, else its category default, else a neutral set). */
export function unitKindOf(p: Product): UnitKind {
  return p.unitKind ?? (categoriesJson as Category[]).find((c) => c.id === p.categoryId)?.unitKind ?? 'bedroom-set';
}

/** Effective dimension profile of a product (product override, else its category's). */
export function dimensionProfileOf(p: Product): DimensionProfile | null {
  if (p.dimensionProfile !== undefined) return p.dimensionProfile;
  return (categoriesJson as Category[]).find((c) => c.id === p.categoryId)?.dimensionProfile ?? null;
}

/** Localized gallery with fallback to the other language, so a missing variant never breaks a page. */
export function galleryFor(p: Product, locale: Locale): ProductImage[] {
  const own = p.gallery[locale];
  if (own?.length) return own;
  return p.gallery.en?.length ? p.gallery.en : (p.gallery.ar ?? []);
}

export const relatedProducts = (p: Product, limit = 3) =>
  products.filter((x) => isPublic(x) && x.categoryId === p.categoryId && x.id !== p.id).sort((a, b) => a.sort - b.sort).slice(0, limit);

export const loc = (o: Localized | null | undefined, locale: Locale): string => (o ? (o[locale] ?? o.en) : '');

export function matchesQuery(p: Product, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  const c = categoryById(p.categoryId);
  return [p.name.en, p.name.ar, p.code, c?.name.en, c?.name.ar].some((v) => String(v ?? '').toLowerCase().includes(query));
}
