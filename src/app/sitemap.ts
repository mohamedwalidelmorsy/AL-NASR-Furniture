import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { allProducts, categories, categoryById } from '@/lib/catalog';
import { absoluteUrl } from '@/lib/seo';

const STATIC = ['', 'collections', 'about', 'sourcing-export', 'shipping-payment', 'custom-manufacturing', 'contact', 'privacy'];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC,
    ...categories.map((c) => `collections/${c.slug}`),
    ...allProducts().flatMap((p) => { const c = categoryById(p.categoryId); return c ? [`collections/${c.slug}/${p.slug}`] : []; }),
  ];
  return paths.flatMap((p) =>
    locales.map((l) => ({
      url: absoluteUrl(`/${l}${p ? `/${p}` : ''}`),
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, absoluteUrl(`/${x}${p ? `/${p}` : ''}`)])) },
    })),
  );
}
