import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { CategoryView } from '@/components/views/CategoryView';
import { PageHeader } from '@/components/layout/PageHeader';
import { categories, categoryBySlug, loc, productsInCategory, styles } from '@/lib/catalog';
import { locales, type Locale } from '@/i18n/routing';
import { href } from '@/lib/links';
import { getPageCtx } from '@/lib/page-ctx';
import { toProductCard } from '@/lib/product-cards';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale; category: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => locales.flatMap((locale) => categories.map((c) => ({ locale, category: c.slug })));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = categoryBySlug(category);
  if (!cat) return {};
  return pageMetadata({ locale, path: `collections/${cat.slug}`, title: loc(cat.name, locale), description: loc(cat.desc, locale) });
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const cat = categoryBySlug(category);
  if (!cat) notFound();
  const { t, links } = getPageCtx(locale);
  const list = productsInCategory(cat.id);
  const styleKeys = [...new Set(list.map((p) => p.style).filter((s): s is string => !!s))];
  return (
    <>
      <PageHeader
        t={t}
        crumbs={[{ label: t.crumbs.home, href: links.home }, { label: t.nav.collections, href: links.collections }, { label: loc(cat.name, locale) }]}
        pageHead={{ eyebrow: t.nav.collections, title: loc(cat.name, locale), intro: loc(cat.desc, locale) }}
      />
      <CategoryView
        products={list.map((p) => ({ ...toProductCard(p, locale), styleKey: p.style }))}
        catTabs={categories.map((c) => ({ href: href(locale, `collections/${c.slug}`), name: loc(c.name, locale), current: c.id === cat.id }))}
        styleOptions={styleKeys.map((key) => ({ key, label: loc(styles[key], locale) }))}
      />
    </>
  );
}
