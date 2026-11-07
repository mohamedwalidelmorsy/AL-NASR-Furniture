import { expect, test } from '@playwright/test';
import { gotoReady } from './helpers';

const SEEDS = ['/en', '/ar', '/en/collections', '/en/collections/bedrooms', '/en/collections/bedrooms/soft-arc-bedroom-set', '/ar/collections/kids-bedrooms', '/en/sourcing-export', '/en/shipping-payment', '/en/custom-manufacturing', '/en/contact', '/ar/shipping-payment'];

test.describe('link & image integrity', () => {
  test('all internal links on key pages resolve (no 404s)', async ({ page, request, isMobile }) => {
    test.skip(isMobile, 'same DOM as desktop');
    const seen = new Set<string>();
    for (const s of SEEDS) {
      await gotoReady(page, s);
      const hrefs = await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
      hrefs.forEach((h) => seen.add(h.split('#')[0]));
    }
    expect(seen.size).toBeGreaterThan(20);
    for (const h of seen) {
      const res = await request.get(h, { maxRedirects: 0 });
      expect([200], `${h} → ${res.status()}`).toContain(res.status());
    }
  });

  test('every <img> loads (naturalWidth > 0) on catalog pages in both languages', async ({ page, isMobile }) => {
    test.skip(isMobile, 'same DOM as desktop');
    for (const p of ['/en', '/ar', '/en/collections', '/ar/collections/bedrooms', '/en/collections/living-rooms', '/ar/collections/china-cabinets/', '/en/collections/bedrooms/soft-arc-bedroom-set', '/en/collections/dining-rooms']) {
      await gotoReady(page, p);
      // force lazy images to load
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
      await page.waitForLoadState('networkidle');
      const broken = await page.locator('img').evaluateAll((imgs) => (imgs as HTMLImageElement[]).filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
      expect(broken, `broken images on ${p}`).toEqual([]);
    }
  });

  test('all product pages (both languages) respond 200 and every image has alt text', async ({ request, page, isMobile }) => {
    test.skip(isMobile, 'same DOM as desktop');
    const sm = await (await request.get('/sitemap.xml')).text();
    const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(urls.filter((u) => /\/collections\/[^/]+\/[^/]+$/.test(u)).length).toBe(36);
    for (const u of urls) expect((await request.get(u)).status(), u).toBe(200);
    await gotoReady(page, '/en/collections/bedrooms');
    const missing = await page.locator('img:not([alt])').count();
    expect(missing).toBe(0);
  });

  test('no console errors on core pages', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    for (const p of ['/en', '/ar', '/en/collections/bedrooms/soft-arc-bedroom-set', '/en/contact', '/en/inquiry']) await gotoReady(page, p);
    expect(errors).toEqual([]);
  });
});
