import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Privacy } from '@/components/pages/Privacy';
import { PageHeader } from '@/components/layout/PageHeader';
import { allMessages } from '@/lib/messages';
import { getPageCtx } from '@/lib/page-ctx';
import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = allMessages[locale];
  return pageMetadata({ locale, path: 'privacy', title: t.meta.privacy, description: t.privacy.body });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ctx = getPageCtx(locale);
  const { t, links } = ctx;
  return (
    <>
      <PageHeader t={t} crumbs={[{ label: t.crumbs.home, href: links.home }, { label: t.privacy.title }]} pageHead={{ title: t.privacy.title }} />
      <Privacy ctx={ctx} />
    </>
  );
}
