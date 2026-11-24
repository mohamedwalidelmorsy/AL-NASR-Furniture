import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { DetailView, type DetailProduct } from '@/components/views/DetailView';
import { JsonLd } from '@/components/json-ld';
import { allProducts, categoryById, dimensionProfileOf, unitKindOf, galleryFor, loc, productBySlug, relatedProducts, styles } from '@/lib/catalog';
import { ArchivedProductView } from '@/components/pages/ArchivedProductView';
import { buildDimensions } from '@/lib/dimensions';
import { allMessages } from '@/lib/messages';
import { locales, type Locale } from '@/i18n/routing';
import { href } from '@/lib/links';
import { getPageCtx } from '@/lib/page-ctx';
import { toProductCard } from '@/lib/product-cards';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale; category: string; slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () =>
  locales.flatMap((locale) => allProducts().filter((p) => p.status !== 'draft' && p.status !== 'merged').flatMap((p) => { const c = categoryById(p.categoryId); return c ? [{ locale, category: c.slug, slug: p.slug }] : []; }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const p = productBySlug(category, slug);
  if (!p) return {};
  return pageMetadata({ locale, path: `collections/${category}/${slug}`, title: `${loc(p.name, locale)} (${p.code})`, description: loc(p.description, locale), noindex: p.status === 'archived' });
}

export default async function ProductPage({ params }: Props) {
  const { locale, category, slug } = await params;
  setRequestLocale(locale);
  const p = productBySlug(category, slug);
  const cat = p && categoryById(p.categoryId);
  if (!p || !cat) notFound();
  const { t, links } = getPageCtx(locale);
  const catHref = href(locale, `collections/${cat.slug}`);
  if (p.status === 'archived') {
    return <ArchivedProductView ctx={getPageCtx(locale)} code={p.code} catName={loc(cat.name, locale)} catHref={catHref} />;
  }
  const crumbs = [
    { label: t.crumbs.home, href: links.home },
    { label: t.nav.collections, href: links.collections },
    { label: loc(cat.name, locale), href: catHref },
    { label: loc(p.name, locale) },
  ];
  const product: DetailProduct = {
    id: p.id, name: loc(p.name, locale), code: p.code, desc: loc(p.description, locale),
    style: p.style ? loc(styles[p.style], locale) : t.illustrative, unit: p.unit, unitKind: unitKindOf(p),
    catName: loc(cat.name, locale), catHref, imgAlt: `${loc(p.name, locale)} — ${t.illustrativeAlt}`,
    images: galleryFor(p, locale).map((i) => ({ full: i.full, card: i.card, width: i.width, height: i.height, label: i.alt ? loc(i.alt, locale) : undefined })),
    dimensions: (() => { const dp = dimensionProfileOf(p); return dp ? buildDimensions(dp, allMessages[locale]) : null; })(),
    pieces: p.pieces.map((x) => ({ name: loc(x.name, locale), qty: x.qty, dims: x.dims })),
    materials: loc(p.materials, locale),
  };
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, ...('href' in c && c.href ? { item: absoluteUrl(c.href) } : {}) })),
        }}
      />
      <DetailView key={product.id} product={product} related={relatedProducts(p).map((x) => toProductCard(x, locale))} crumbs={crumbs} />
    </>
  );
}
