import type { Metadata } from 'next';
import { locales, type Locale } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';

export const absoluteUrl = (path: string) => `${siteConfig.siteUrl}${path}`;

/** Per-page metadata: localized title/description, canonical, and AR/EN hreflang alternates. */
export function pageMetadata(opts: { locale: Locale; path?: string; title: string; description?: string; noindex?: boolean }): Metadata {
  const { locale, path = '', title, description, noindex } = opts;
  const brand = siteConfig.brand[locale];
  const full = `${title} — ${brand}`;
  const tail = path ? `/${path}` : '';
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, absoluteUrl(`/${l}${tail}`)]));
  languages['x-default'] = absoluteUrl(`/en${tail}`);
  const url = absoluteUrl(`/${locale}${tail}`);
  return {
    title: { absolute: full },
    description,
    alternates: { canonical: url, languages },
    openGraph: { title: full, description, url, siteName: brand, locale: locale === 'ar' ? 'ar_EG' : 'en_US', alternateLocale: locale === 'ar' ? 'en_US' : 'ar_EG', type: 'website' },
    robots: siteConfig.allowIndexing && !noindex ? { index: true, follow: true } : { index: false, follow: false },
  };
}
