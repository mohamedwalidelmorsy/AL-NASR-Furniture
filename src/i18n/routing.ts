import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

export const isLocale = (v: string | undefined | null): v is Locale => !!v && (locales as readonly string[]).includes(v);
export const otherLocale = (l: Locale): Locale => (l === 'ar' ? 'en' : 'ar');
export const dirOf = (l: Locale): 'rtl' | 'ltr' => (l === 'ar' ? 'rtl' : 'ltr');
