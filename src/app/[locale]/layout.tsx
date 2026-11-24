import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Manrope } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { dirOf, isLocale, locales, type Locale } from '@/i18n/routing';
import { allMessages, pickClientMessages } from '@/lib/messages';
import { getPageCtx } from '@/lib/page-ctx';
import { siteConfig } from '@/lib/site-config';
import { activeProducts, archivedProducts, categoryById, mergedProducts } from '@/lib/catalog';
import { href as buildHref } from '@/lib/links';
import { ToastProvider } from '@/components/toast-provider';
import { InquiryProvider } from '@/features/inquiry/inquiry-provider';
import { ProductWaProvider } from '@/components/product-wa';
import { SkipLink } from '@/components/skip-link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatWa } from '@/components/layout/FloatWa';
import { ToastView } from '@/components/layout/ToastView';
import '../globals.css';

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-manrope', display: 'swap' });
const plexAr = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-plex-ar', display: 'swap' });

export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export const metadata: Metadata = { metadataBase: new URL(siteConfig.siteUrl) };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  setRequestLocale(locale);

  const rtl = dirOf(locale) === 'rtl';
  const ctx = getPageCtx(locale);
  const validIds = activeProducts().filter((p) => categoryById(p.categoryId)).map((p) => p.id);
  const merged = mergedProducts().map((p) => ({ from: p.id, to: p.mergedInto as string, fromCode: p.code }));
  const archived = archivedProducts().map((p) => ({ id: p.id, code: p.code, name: p.name, href: buildHref(locale, `collections/${p.categoryId}/${p.slug}`) }));

  return (
    <html lang={locale} dir={dirOf(locale)} className={`${manrope.variable} ${plexAr.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={pickClientMessages(allMessages[locale])}>
          <ToastProvider>
            <InquiryProvider validIds={validIds} archived={archived} merged={merged}>
              <ProductWaProvider>
                <div
                  style={{
                    minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF9F6', color: '#252525', fontSize: 16, overflowX: 'clip',
                    fontFamily: rtl ? 'var(--font-plex-ar), var(--font-manrope), system-ui, sans-serif' : 'var(--font-manrope), var(--font-plex-ar), system-ui, sans-serif',
                    lineHeight: rtl ? 1.85 : 1.65,
                  }}
                >
                  <SkipLink label={ctx.t.skip} />
                  <Header />
                  <main id="main" tabIndex={-1} style={{ flex: 1, outline: 'none' }}>{children}</main>
                  <Footer ctx={ctx} />
                  <FloatWa />
                  <ToastView />
                </div>
              </ProductWaProvider>
            </InquiryProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
