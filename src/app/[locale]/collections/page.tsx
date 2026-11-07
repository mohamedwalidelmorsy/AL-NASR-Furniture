import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { CollectionsView } from '@/components/views/CollectionsView';
import { PageHeader } from '@/components/layout/PageHeader';
import { allMessages } from '@/lib/messages';
import { getPageCtx } from '@/lib/page-ctx';
import { getProductCards } from '@/lib/product-cards';
import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = allMessages[locale];
  return pageMetadata({ locale, path: 'collections', title: t.meta.collections, description: t.collections.intro });
}

export default async function CollectionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ctx = getPageCtx(locale);
  const { t, links } = ctx;
  return (
    <>
      <PageHeader t={t} crumbs={[{ label: t.crumbs.home, href: links.home }, { label: t.nav.collections }]} pageHead={{ title: t.collections.title, intro: t.collections.intro }} />
      <CollectionsView allCats={ctx.allCats} products={getProductCards(locale)} />
    </>
  );
}
