import { getLocale } from 'next-intl/server';
import { NotFoundView } from '@/components/pages/NotFoundView';
import { PageHeader } from '@/components/layout/PageHeader';
import { getPageCtx } from '@/lib/page-ctx';
import type { Locale } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';

export default async function NotFound() {
  const locale = (await getLocale()) as Locale;
  const ctx = getPageCtx(locale);
  const { t, links } = ctx;
  return (
    <>
      {/* React hoists <title> to <head>: the 404 page now has a localized document title */}
      <title>{`${t.notFound.title} — ${siteConfig.brand[locale]}`}</title>
      <PageHeader t={t} crumbs={[{ label: t.crumbs.home, href: links.home }, { label: t.notFound.title }]} pageHead={{ title: t.notFound.title, intro: t.notFound.body }} />
      <NotFoundView ctx={ctx} />
    </>
  );
}
