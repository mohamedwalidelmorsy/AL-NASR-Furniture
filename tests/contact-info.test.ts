import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import en from '../messages/en.json';
import ar from '../messages/ar.json';

const envFile = (p: string) => Object.fromEntries(fs.readFileSync(p, 'utf8').split('\n').filter((l) => /^[A-Z_]+=/.test(l)).map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')]; }));

describe('official contact information (2026-11-26)', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

  it('production build carries the approved numbers and e-mails', () => {
    const p = envFile('cloudflare/production/build.env');
    expect(p.NEXT_PUBLIC_WHATSAPP_NUMBER).toBe('201070051752');
    expect(p.NEXT_PUBLIC_PHONE_NUMBERS).toBe('201070051752,201201883456');
    expect(p.NEXT_PUBLIC_GENERAL_EMAIL).toBe('contact@alnasrfurniture.com');
    expect(p.NEXT_PUBLIC_EXPORT_EMAIL).toBe('export@alnasrfurniture.com');
    expect(p.NEXT_PUBLIC_SALES_EMAIL).toBeUndefined();
    expect(p.NEXT_PUBLIC_SITE_URL).toBe('https://alnasrfurniture.com'); // canonical unchanged until the domain migration
  });

  it('uses the approved bilingual labels', () => {
    expect([en.contactInfo.phoneWa, en.contactInfo.general, en.contactInfo.export, en.contactInfo.website]).toEqual(['Phone / WhatsApp', 'General Inquiries', 'Export Inquiries', 'Website']);
    expect([ar.contactInfo.phoneWa, ar.contactInfo.general, ar.contactInfo.export, ar.contactInfo.website]).toEqual(['الهاتف / واتساب', 'الاستفسارات العامة', 'استفسارات التصدير', 'الموقع الإلكتروني']);
  });

  it('builds international tel:/wa.me links for both numbers, primary first, and the JSON-LD contact points', async () => {
    vi.stubEnv('NEXT_PUBLIC_PHONE_NUMBERS', '201070051752, +20 120 188 3456');
    vi.stubEnv('NEXT_PUBLIC_GENERAL_EMAIL', 'contact@alnasrfurniture.com');
    vi.stubEnv('NEXT_PUBLIC_EXPORT_EMAIL', 'export@alnasrfurniture.com');
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://alnasrfurniture.com');
    const { siteConfig, phoneContacts } = await import('@/lib/site-config');
    const { organizationJsonLd } = await import('@/lib/seo');
    expect(siteConfig.whatsappNumber).toBe('201070051752');
    expect(siteConfig.website).toBe('www.alnasrfurniture.com');
    const ph = phoneContacts('Hello');
    expect(ph.map((x) => [x.text, x.tel, x.wa])).toEqual([
      ['+20 107 005 1752', 'tel:+201070051752', 'https://wa.me/201070051752?text=Hello'],
      ['+20 120 188 3456', 'tel:+201201883456', 'https://wa.me/201201883456?text=Hello'],
    ]);
    const ld = organizationJsonLd('en') as Record<string, unknown>;
    expect(ld.url).toBe('https://alnasrfurniture.com/en');
    expect(ld.email).toBe('contact@alnasrfurniture.com');
    expect(ld.telephone).toEqual(['+201070051752', '+201201883456']);
    expect((ld.contactPoint as { email: string }[]).map((c) => c.email)).toEqual(['contact@alnasrfurniture.com', 'export@alnasrfurniture.com']);
  });

  it('omits contact data from JSON-LD when nothing is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_PHONE_NUMBERS', ''); vi.stubEnv('NEXT_PUBLIC_GENERAL_EMAIL', ''); vi.stubEnv('NEXT_PUBLIC_EXPORT_EMAIL', '');
    const { organizationJsonLd } = await import('@/lib/seo');
    const ld = organizationJsonLd('ar') as Record<string, unknown>;
    expect(ld.contactPoint).toBeUndefined();
    expect(ld.email).toBeUndefined();
  });
});
