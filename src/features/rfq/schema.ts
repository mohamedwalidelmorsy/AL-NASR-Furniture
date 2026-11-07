import { z } from 'zod';
import countries from '@/data/countries.json';

/** Shared (client + server) RFQ validation. Error `message`s are keys into `messages/*.json → form.err`. */
export type RfqErrorKey = 'name' | 'country' | 'contact' | 'email' | 'phone' | 'message' | 'consent';

export const BUYER_TYPES = ['showroom', 'importer', 'wholesaler', 'distributor', 'retail-chain', 'project', 'other'] as const;
export const INQUIRY_TYPES = ['wholesale', 'custom', 'project', 'shipping', 'general'] as const;
export const DELIVERY_TERMS = ['EXW', 'FOB', 'CFR', 'CIF'] as const;
export const PAYMENT_TERMS = ['advance-30-70', 'lc-at-sight', 'tt'] as const;
export const CONTACT_METHODS = ['email', 'whatsapp', 'phone'] as const;

export const COUNTRY_CODES = countries.map((c) => c.code);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (v: string) => EMAIL_RE.test(v.trim());
export const isValidPhone = (v: string) => /^\+?\d{7,15}$/.test(v.trim().replace(/[\s\-().]/g, ''));

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) => z.union([z.enum(values), z.literal('')]);

/** Fields as held by the browser form (all strings, consent boolean). */
export const rfqFormSchema = (hasItems: boolean) =>
  z
    .object({
      name: z.string().trim().min(1, 'name').max(120, 'name'),
      company: z.string().trim().max(160),
      buyerType: optionalEnum(BUYER_TYPES),
      country: z.string().refine((v) => COUNTRY_CODES.includes(v), 'country'),
      email: z.string().trim().max(254),
      phone: z.string().trim().max(40),
      pref: z.union([z.enum(CONTACT_METHODS), z.literal('')]),
      message: z.string().trim().max(3000),
      consent: z.boolean(),
      website: z.string().max(200), // honeypot
      inquiryType: optionalEnum(INQUIRY_TYPES),
      shipTerm: optionalEnum(DELIVERY_TERMS),
      payTerm: optionalEnum(PAYMENT_TERMS),
      destPort: z.string().trim().max(120),
    })
    .superRefine((v, ctx) => {
      const add = (path: string, message: RfqErrorKey) => ctx.addIssue({ code: 'custom', path: [path], message });
      if (!v.email && !v.phone) { add('email', 'contact'); add('phone', 'contact'); }
      if (v.email && !isValidEmail(v.email)) add('email', 'email');
      if (v.phone && !isValidPhone(v.phone)) add('phone', 'phone');
      if (!hasItems && !v.message) add('message', 'message');
      if (!v.consent) add('consent', 'consent');
    });

export type RfqFormValues = z.input<ReturnType<typeof rfqFormSchema>>;

export const emptyRfqForm = (): RfqFormValues => ({
  name: '', company: '', buyerType: '', country: '', email: '', phone: '', pref: '', message: '', consent: false,
  website: '', inquiryType: '', shipTerm: '', payTerm: '', destPort: '',
});

/** Wire format of POST /api/rfq (unchanged from the approved prototype's documented payload). */
export const rfqPayloadSchema = z
  .object({
    inquiry_id: z.null().optional(),
    contact: z.object({
      name: z.string().trim().min(1).max(120),
      company: z.string().trim().max(160).nullable(),
      buyer_type: z.enum(BUYER_TYPES).nullable(),
      email: z.string().trim().max(254).nullable(),
      phone: z.string().trim().max(40).nullable(),
      preferred_method: z.enum(CONTACT_METHODS),
    }),
    destination_country: z.string().refine((v) => COUNTRY_CODES.includes(v)),
    items: z
      .array(
        z.object({
          collection_id: z.string().min(1).max(80),
          code: z.string().min(1).max(80),
          quantity: z.number().int().min(1).max(99999),
          unit: z.enum(['set', 'piece']),
          notes: z.string().trim().max(300).nullable(),
        }),
      )
      .max(100),
    inquiry_type: z.enum(INQUIRY_TYPES).nullable(),
    trade_preferences: z.object({
      delivery_term: z.enum(DELIVERY_TERMS).nullable(),
      payment_term: z.enum(PAYMENT_TERMS).nullable(),
      destination_port_city: z.string().trim().max(120).nullable(),
    }),
    message: z.string().trim().max(3000).nullable(),
    consent: z.object({ given: z.literal(true), text_version: z.string().min(1).max(40), at: z.string().max(40) }),
    locale: z.enum(['en', 'ar']),
    source_url: z.string().max(500),
    created_at: z.string().max(40),
    /** Honeypot: real users never fill it. */
    website: z.string().max(200).optional(),
  })
  .superRefine((v, ctx) => {
    const { email, phone } = v.contact;
    if (!email && !phone) ctx.addIssue({ code: 'custom', path: ['contact'], message: 'contact' });
    if (email && !isValidEmail(email)) ctx.addIssue({ code: 'custom', path: ['contact', 'email'], message: 'email' });
    if (phone && !isValidPhone(phone)) ctx.addIssue({ code: 'custom', path: ['contact', 'phone'], message: 'phone' });
    if (!v.items.length && !v.message) ctx.addIssue({ code: 'custom', path: ['message'], message: 'message' });
  });

export type RfqPayload = z.infer<typeof rfqPayloadSchema>;
