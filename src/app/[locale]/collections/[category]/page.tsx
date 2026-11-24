import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { CategoryView } from '@/components/views/CategoryView';
import { PageHeader } from '@/components/layout/PageHeader';
import { A } from '@/components/ui/A';
import { categories, categoryBySlug, categoryById, loc, productsInCategory, styles } from '@/lib/catalog';
import { fmt } from '@/lib/messages';
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
  const related = cat.relatedCategoryId ? categoryById(cat.relatedCategoryId) : undefined;
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
      {related && cat.relatedNote && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px) clamp(48px,6vw,80px)", boxSizing: "content-box" }}>
          <p data-testid="related-category" style={{ margin: "0", padding: "20px 24px", border: "1px solid #D8D2C9", borderRadius: "10px", background: "#fff", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 24px", fontSize: "16px" }}>
            <span>{loc(cat.relatedNote, locale)}</span>
            <A href={href(locale, `collections/${related.slug}`)} style={{ fontWeight: "600", color: "#584838", textDecoration: "none" }}>{fmt(t.category.relatedCta, { cat: loc(related.name, locale) })} <span aria-hidden="true">{t.arrow}</span></A>
          </p>
        </div>
      )}
    </>
  );
}
