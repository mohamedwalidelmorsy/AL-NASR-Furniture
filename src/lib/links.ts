import type { Locale } from '@/i18n/routing';

/** Locale-prefixed internal path. `path` has no leading slash; query allowed. */
export const href = (lang: Locale, path = '') => `/${lang}${path ? `/${path}` : ''}`;

export const buildLinks = (lang: Locale) => ({
  home: href(lang),
  collections: href(lang, 'collections'),
  about: href(lang, 'about'),
  sourcing: href(lang, 'sourcing-export'),
  contact: href(lang, 'contact'),
  inquiry: href(lang, 'inquiry'),
  privacy: href(lang, 'privacy'),
  shipping: href(lang, 'shipping-payment'),
  custom: href(lang, 'custom-manufacturing'),
});
export type Links = ReturnType<typeof buildLinks>;

/** Route kinds used for nav highlighting and breadcrumbs. */
export type PageKey =
  | 'home' | 'collections' | 'category' | 'detail' | 'about' | 'sourcing' | 'shipping' | 'custom' | 'contact' | 'inquiry' | 'privacy' | 'notFound';

const SEGMENT_TO_PAGE: Record<string, PageKey> = {
  about: 'about', 'sourcing-export': 'sourcing', 'shipping-payment': 'shipping', 'custom-manufacturing': 'custom',
  contact: 'contact', inquiry: 'inquiry', privacy: 'privacy',
};

/** Derive the page kind from a pathname that may start with a locale segment. */
export function pageKeyFromPath(pathname: string): PageKey {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'en' || parts[0] === 'ar') parts.shift();
  const [p0, p1, p2, p3] = parts;
  if (!p0) return 'home';
  if (p0 === 'collections') return !p1 ? 'collections' : !p2 ? 'category' : !p3 ? 'detail' : 'notFound';
  if (!p1 && SEGMENT_TO_PAGE[p0]) return SEGMENT_TO_PAGE[p0];
  return 'notFound';
}

/** Path of the same page in the other language (keeps page identity when switching). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'en' || parts[0] === 'ar') parts.shift();
  return `/${target}${parts.length ? `/${parts.join('/')}` : ''}`;
}

export const NAV_DEFS: { key: string; path: string; label: 'home' | 'collections' | 'about' | 'sourcing' | 'contact'; active: PageKey[] }[] = [
  { key: 'home', path: '', label: 'home', active: ['home'] },
  { key: 'collections', path: 'collections', label: 'collections', active: ['collections', 'category', 'detail'] },
  { key: 'about', path: 'about', label: 'about', active: ['about'] },
  { key: 'sourcing', path: 'sourcing-export', label: 'sourcing', active: ['sourcing', 'shipping', 'custom'] },
  { key: 'contact', path: 'contact', label: 'contact', active: ['contact'] },
];
