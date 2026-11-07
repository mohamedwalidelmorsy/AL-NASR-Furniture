import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Home } from '@/components/pages/Home';
import { JsonLd } from '@/components/json-ld';
import { allMessages } from '@/lib/messages';
import { getPageCtx } from '@/lib/page-ctx';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = allMessages[locale];
  return pageMetadata({ locale, title: t.meta.home, description: t.hero.body });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Organization', name: siteConfig.brand.en, alternateName: siteConfig.brand.ar, url: absoluteUrl(`/${locale}`) }} />
      <Home ctx={getPageCtx(locale)} />
    </>
  );
}
