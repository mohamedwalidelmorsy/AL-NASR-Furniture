import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import type { Locale } from '@/i18n/routing';

export type Messages = typeof en;

// Compile-time guarantee that Arabic mirrors the English message shape.
export const _arabicShapeCheck: Messages = ar;

export const allMessages: Record<Locale, Messages> = { en, ar };

/** Namespaces needed by client components. Large static-page copy stays server-only. */
export const CLIENT_NAMESPACES = [
  'dir', 'arrow', 'back', 'switchTo', 'skip', 'nav', 'sample', 'illustrative', 'illustrativeAlt', 'wa', 'ph',
  'crumbs', 'featured', 'collections', 'category', 'card', 'detail', 'dimensions', 'inquiry', 'toast', 'contact', 'contactInfo', 'form', 'footer',
] as const satisfies readonly (keyof Messages)[];

export function pickClientMessages(m: Messages): Pick<Messages, (typeof CLIENT_NAMESPACES)[number]> {
  const out: Record<string, unknown> = {};
  for (const k of CLIENT_NAMESPACES) out[k] = m[k];
  return out as Pick<Messages, (typeof CLIENT_NAMESPACES)[number]>;
}

export function fmt(str: string, vars: Record<string, string | number>): string {
  return String(str).replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] != null ? String(vars[k]) : ''));
}
