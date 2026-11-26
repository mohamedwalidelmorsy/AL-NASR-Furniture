/**
 * Business configuration. Values the business has not supplied yet are `null` (the UI shows "PENDING").
 * Public values come from NEXT_PUBLIC_* env vars so they can be set without touching code.
 */
const digits = (v: string | undefined) => (v ?? '').replace(/\D/g, '');

export const siteConfig = {
  brand: { en: 'AL NASR FURNITURE', ar: 'النصر للأثاث' },
  legalEntity: {
    en: 'Al Nasr for Import & Export',
    ar: 'مؤسسة النصر للاستيراد والتصدير',
    registration: null as string | null, // commercial registration / tax numbers: PENDING
  },
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  whatsappNumber: digits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) || null,
  /** Sales phone for calls, international digits (e.g. 2010…). Shown as a tel: link; null = hidden. */
  phoneNumber: digits(process.env.NEXT_PUBLIC_PHONE_NUMBER) || null,
  email: process.env.NEXT_PUBLIC_SALES_EMAIL?.trim() || null,
  consentTextVersion: process.env.NEXT_PUBLIC_CONSENT_TEXT_VERSION?.trim() || 'PENDING',
  /** Search engines are blocked until the business confirms real content (set NEXT_PUBLIC_ALLOW_INDEXING=true at launch). */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true',
  rfqEndpoint: '/api/rfq',
  /** NEXT_PUBLIC_RFQ_ENABLED=false hides online submission (e.g. launch before e-mail delivery is set up); contact links remain. */
  rfqEnabled: process.env.NEXT_PUBLIC_RFQ_ENABLED !== 'false',
  storageKeys: { inquiry: 'alnasr.inquiry.v1', draft: 'alnasr.rfqDraft.v1' },
} as const;

export const whatsappReady = (n: string | null) => !!n && n.length >= 8;

export const waLink = (number: string | null, text?: string) =>
  whatsappReady(number) ? `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}` : '';

/** tel: link and display text for a phone number in international digits; null when not configured. */
export const telLink = (number: string | null) => (number && number.length >= 8 ? { href: `tel:+${number}`, text: `+${number}` } : null);
