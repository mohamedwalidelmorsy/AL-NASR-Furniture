import { allProducts } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import type { InquiryItem } from '@/features/inquiry/storage';
import { CONTACT_METHODS, type RfqFormValues, type RfqPayload } from './schema';

type Method = (typeof CONTACT_METHODS)[number];

/** Contact methods the buyer can actually be reached on, given what they typed. */
export function availablePrefs(f: Pick<RfqFormValues, 'email' | 'phone'>): Method[] {
  const a: Method[] = [];
  if (f.email.trim()) a.push('email');
  if (f.phone.trim()) a.push('whatsapp', 'phone');
  return a;
}

export function effectivePref(f: Pick<RfqFormValues, 'email' | 'phone' | 'pref'>): Method | '' {
  const av = availablePrefs(f);
  return f.pref && av.includes(f.pref) ? f.pref : (av[0] ?? '');
}

/** Only inquiry entries that still exist in the catalog are sent (stale prototype IDs are dropped). */
export const resolveItems = (items: InquiryItem[]) => items.filter((i) => allProducts().some((p) => p.id === i.id));

export function buildRfqPayload(f: RfqFormValues, items: InquiryItem[], locale: 'en' | 'ar', sourceUrl: string, now = new Date()): RfqPayload {
  const pref = effectivePref(f) as Method;
  return {
    inquiry_id: null,
    contact: {
      name: f.name.trim(),
      company: f.company.trim() || null,
      buyer_type: (f.buyerType || null) as RfqPayload['contact']['buyer_type'],
      email: f.email.trim() || null,
      phone: f.phone.trim() || null,
      preferred_method: pref,
    },
    destination_country: f.country,
    items: resolveItems(items).map((i) => {
      const p = allProducts().find((x) => x.id === i.id)!;
      return { collection_id: p.id, code: p.code, quantity: Math.max(1, parseInt(String(i.qty), 10) || 1), unit: p.unit, notes: i.note.trim() || null };
    }),
    inquiry_type: (f.inquiryType || null) as RfqPayload['inquiry_type'],
    trade_preferences: {
      delivery_term: (f.shipTerm || null) as RfqPayload['trade_preferences']['delivery_term'],
      payment_term: (f.payTerm || null) as RfqPayload['trade_preferences']['payment_term'],
      destination_port_city: f.destPort.trim() || null,
    },
    message: f.message.trim() || null,
    consent: { given: true, text_version: siteConfig.consentTextVersion, at: now.toISOString() },
    locale,
    source_url: sourceUrl,
    created_at: now.toISOString(),
    website: '',
  };
}
