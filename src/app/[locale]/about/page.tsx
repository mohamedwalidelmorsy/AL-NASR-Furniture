import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { About } from '@/components/pages/About';
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
  return pageMetadata({ locale, path: 'about', title: t.meta.about, description: t.about.lead });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ctx = getPageCtx(locale);
  const { t, links } = ctx;
  return (
    <>
      <PageHeader t={t} crumbs={[{ label: t.crumbs.home, href: links.home }, { label: t.nav.about }]} pageHead={{ eyebrow: t.about.eyebrow, title: t.about.title, intro: t.about.lead }} />
      <About ctx={ctx} />
      <PageCta pc={pageCta(ctx, 'about')} />
    </>
  );
}
