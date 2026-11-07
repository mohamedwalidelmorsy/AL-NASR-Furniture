import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Custom } from '@/components/pages/Custom';
import { PageCta } from '@/components/pages/PageCta';
import { PageHeader } from '@/components/layout/PageHeader';
import { allMessages } from '@/lib/messages';
import { getPageCtx, pageCta } from '@/lib/page-ctx';
import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = allMessages[locale];
  return pageMetadata({ locale, path: 'custom-manufacturing', title: t.meta.custom, description: t.custom.lead });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ctx = getPageCtx(locale);
  const { t, links } = ctx;
  return (
    <>
      <PageHeader t={t} crumbs={[{ label: t.crumbs.home, href: links.home }, { label: t.nav.sourcing, href: links.sourcing }, { label: t.custom.eyebrow }]} pageHead={{ eyebrow: t.custom.eyebrow, title: t.custom.title, intro: t.custom.lead }} />
      <Custom ctx={ctx} />
      <PageCta pc={pageCta(ctx, 'custom')} />
    </>
  );
}
