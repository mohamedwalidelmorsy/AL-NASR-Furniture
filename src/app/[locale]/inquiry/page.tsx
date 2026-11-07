import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { InquiryView } from '@/components/views/InquiryView';
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
  return pageMetadata({ locale, path: 'inquiry', title: t.meta.inquiry, description: t.inquiry.intro, noindex: true });
}

export default async function InquiryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { t, links } = getPageCtx(locale);
  return (
    <>
      <PageHeader t={t} crumbs={[{ label: t.crumbs.home, href: links.home }, { label: t.nav.inquiry }]} pageHead={{ title: t.inquiry.title, intro: t.inquiry.intro }} />
      <InquiryView products={getProductCards(locale)} />
    </>
  );
}
