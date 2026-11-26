/**
 * Business configuration. Values the business has not supplied yet are `null` (the UI shows "PENDING").
 * Public values come from NEXT_PUBLIC_* env vars so they can be set without touching code.
 */
const digits = (v: string | undefined) => (v ?? '').replace(/\D/g, '');
const digitList = (v: string | undefined) => (v ?? '').split(',').map(digits).filter((n) => n.length >= 8);
const phones = digitList(process.env.NEXT_PUBLIC_PHONE_NUMBERS);

export const siteConfig = {
  brand: { en: 'AL NASR FURNITURE', ar: 'النصر للأثاث' },
  legalEntity: {
    en: 'Al Nasr for Import & Export',
    ar: 'مؤسسة النصر للاستيراد والتصدير',
    registration: null as string | null, // commercial registration / tax numbers: PENDING
  },
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  /** Primary WhatsApp number (floating button, product and page CTAs); defaults to the first phone number. */
  whatsappNumber: digits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) || phones[0] || null,
  /** Official phone / WhatsApp numbers in international digits, primary first (NEXT_PUBLIC_PHONE_NUMBERS, comma-separated). */
  phoneNumbers: phones as readonly string[],
  /** General inquiries e-mail (regular business communication). */
  email: process.env.NEXT_PUBLIC_GENERAL_EMAIL?.trim() || null,
  /** Export inquiries e-mail (quotations, sourcing, shipping). */
  exportEmail: process.env.NEXT_PUBLIC_EXPORT_EMAIL?.trim() || null,
  /** Official website address, displayed as text. Canonical URLs keep using siteUrl until the domain migration is done. */
  website: 'www.alnasrfurniture.com',
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

/** Readable international format: +20 107 005 1752 for Egyptian mobiles, +<digits> otherwise. */
export const phoneDisplay = (n: string) => (n.length === 12 && n.startsWith('20') ? `+20 ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}` : `+${n}`);

/** tel: link and display text for a phone number in international digits; null when not configured. */
export const telLink = (number: string | null) => (number && number.length >= 8 ? { href: `tel:+${number}`, text: phoneDisplay(number) } : null);

/** Every official number with its call and WhatsApp links (empty when none configured). */
export const phoneContacts = (waText?: string) =>
  siteConfig.phoneNumbers.map((n) => ({ num: n, text: phoneDisplay(n), tel: `tel:+${n}`, wa: waLink(n, waText) }));
