import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { ContactView } from '@/components/views/ContactView';
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
  return pageMetadata({ locale, path: 'contact', title: t.meta.contact, description: t.contact.intro });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { t, links } = getPageCtx(locale);
  return (
    <>
      <PageHeader t={t} crumbs={[{ label: t.crumbs.home, href: links.home }, { label: t.nav.contact }]} pageHead={{ eyebrow: t.contact.eyebrow, title: t.contact.title, intro: t.contact.intro }} />
      <Suspense fallback={<section aria-busy="true" style={{ minHeight: '60vh' }} />}>
        <ContactView products={getProductCards(locale)} />
      </Suspense>
    </>
  );
}
