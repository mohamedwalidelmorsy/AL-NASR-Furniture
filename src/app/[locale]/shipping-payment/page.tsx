import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Shipping } from '@/components/pages/Shipping';
import { PageCta } from '@/components/pages/PageCta';
import { ShipToc } from '@/components/pages/ShipToc';
import { PageHeader } from '@/components/layout/PageHeader';
import { allMessages } from '@/lib/messages';
import { getPageCtx, pageCta } from '@/lib/page-ctx';
import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = allMessages[locale];
  return pageMetadata({ locale, path: 'shipping-payment', title: t.meta.shipping, description: t.ship.lead });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ctx = getPageCtx(locale);
  const { t, links } = ctx;
  return (
    <>
      <PageHeader t={t} crumbs={[{ label: t.crumbs.home, href: links.home }, { label: t.nav.sourcing, href: links.sourcing }, { label: t.ship.title }]} pageHead={{ eyebrow: t.ship.eyebrow, title: t.ship.title, intro: t.ship.lead }} />
      <ShipToc labels={t.ship.toc} tocLabel={t.ship.tocLabel} />
      <Shipping ctx={ctx} />
      <PageCta pc={pageCta(ctx, 'shipping')} />
    </>
  );
}
