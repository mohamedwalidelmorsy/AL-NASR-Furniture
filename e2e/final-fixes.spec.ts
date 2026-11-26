import { expect, test } from '@playwright/test';
import { gotoReady, INQUIRY_KEY, inquiryStorage } from './helpers';

const DUP_REDIRECTS = [
  ['arc-headboard-bedroom-set', 'soft-arc-bedroom-set'],
  ['curved-headboard-bench-bedroom-set', 'curve-bedroom-set'],
  ['padded-headboard-bedroom-set', 'upholstered-bedroom-set'],
  ['cream-panel-bedroom-set', 'luxe-bedroom-set'],
] as const;
const MOVED = [
  ['living-rooms', 'corner-sofas', 'soft-arc-corner-sofa'],
  ['living-rooms', 'corner-sofas', 'teal-sectional-sofa'],
  ['living-rooms', 'corner-sofas', 'luxury-corner-sofa'],
  ['corner-sofas', 'living-rooms', 'olive-curve-sofa'],
] as const;

test.describe('approved final fixes', () => {
  for (const loc of ['en', 'ar']) {
    test(`308 redirects keep the locale: ${loc}`, async ({ request }) => {
      for (const [from, to] of DUP_REDIRECTS) {
        const r = await request.get(`/${loc}/collections/bedrooms/${from}`, { maxRedirects: 0 });
        expect(r.status(), from).toBe(308);
        expect(r.headers()['location']).toBe(`/${loc}/collections/bedrooms/${to}`);
      }
      for (const [fromCat, toCat, slug] of MOVED) {
        const r = await request.get(`/${loc}/collections/${fromCat}/${slug}`, { maxRedirects: 0 });
        expect(r.status(), slug).toBe(308);
        expect(r.headers()['location']).toBe(`/${loc}/collections/${toCat}/${slug}`);
        expect((await request.get(`/${loc}/collections/${toCat}/${slug}`, { maxRedirects: 0 })).status()).toBe(200);
      }
    });
  }

  test('a redirected old URL opens the continuing product in the browser (no loop)', async ({ page }) => {
    await page.goto('/ar/collections/bedrooms/arc-headboard-bedroom-set', { waitUntil: 'networkidle' });
    expect(new URL(page.url()).pathname).toBe('/ar/collections/bedrooms/soft-arc-bedroom-set');
    await expect(page.locator('h1')).toBeVisible();
    await page.goto('/en/collections/living-rooms/teal-sectional-sofa', { waitUntil: 'networkidle' });
    expect(new URL(page.url()).pathname).toBe('/en/collections/corner-sofas/teal-sectional-sofa');
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Corner Sofas');
  });

  test('canonical + hreflang point at the new canonical URL; no duplicate pages in the sitemap', async ({ page, request }) => {
    await page.goto('/en/collections/corner-sofas/soft-arc-corner-sofa', { waitUntil: 'networkidle' });
    expect(await page.locator('link[rel=canonical]').getAttribute('href')).toMatch(/\/en\/collections\/corner-sofas\/soft-arc-corner-sofa$/);
    const alts = await page.locator('link[rel=alternate][hreflang]').evaluateAll((l) => l.map((x) => `${x.getAttribute('hreflang')} ${x.getAttribute('href')}`));
    expect(alts.some((a) => a.startsWith('ar ') && a.endsWith('/ar/collections/corner-sofas/soft-arc-corner-sofa'))).toBe(true);
    const sm = await (await request.get('/sitemap.xml')).text();
    for (const [dup] of DUP_REDIRECTS) expect(sm).not.toContain(`/bedrooms/${dup}`);
    for (const [, , slug] of MOVED) expect(sm.match(new RegExp(`/collections/[^/]+/${slug}</loc>`, 'g'))?.length).toBe(2); // one per locale
    expect(sm).not.toContain('arch-line-kids-bedroom-set');
  });

  test('bedroom category lists exactly 15 distinct designs; duplicates are not discoverable', async ({ page }) => {
    await gotoReady(page, '/en/collections/bedrooms');
    await expect(page.locator('main h2')).toHaveCount(15);
    await expect(page.getByText('15 collections')).toBeVisible();
    await page.getByLabel('Search in this category').fill('arc');
    await expect(page.locator('main h2')).toHaveCount(1);
    await gotoReady(page, '/en/collections');
    await page.getByLabel('Search all collections').fill('PV-BR-12');
    await expect(page.getByText(/No collections match/)).toBeVisible();
  });

  test('retired kids products show a clear archived page in EN and AR (200, noindex, no add-to-inquiry)', async ({ page }) => {
    for (const [loc, title] of [['en', 'This design is no longer available'], ['ar', 'هذا التصميم لم يعد متاحًا']]) {
      for (const slug of ['arch-line-kids-bedroom-set', 'butterfly-charm-kids-bedroom-set', 'study-nook-kids-bedroom-set']) {
        const res = await page.goto(`/${loc}/collections/kids-bedrooms/${slug}`, { waitUntil: 'networkidle' });
        expect(res?.status(), slug).toBe(200);
        await expect(page.locator('[data-testid="archived-product"] h1')).toHaveText(title);
        expect(await page.locator('meta[name=robots]').getAttribute('content')).toContain('noindex');
        await expect(page.locator('#dqty')).toHaveCount(0);
      }
    }
    await gotoReady(page, '/en/collections/kids-bedrooms');
    await expect(page.locator('main h2')).toHaveCount(14);
  });

  test('Inquiry List with a persisted archived item (EN + AR): kept with qty/note, removable, valid items still submittable', async ({ page }) => {
    await page.addInitScript(([k]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify([{ id: 'pv-kb-01', qty: 6, note: 'blue colour' }, { id: 'pv-kb-04', qty: 2, note: '' }])); }, [INQUIRY_KEY]);
    await gotoReady(page, '/en/inquiry');
    const row = page.getByTestId('archived-row');
    await expect(row).toContainText('Arch Line Kids Bedroom Set');
    await expect(row).toContainText('no longer available');
    await expect(row).toContainText('6');
    await expect(row).toContainText('blue colour');
    await expect(page.getByTestId('archived-notice')).toContainText('1 unavailable item will not be included');
    await expect(page.getByText('1 collection selected')).toBeVisible();
    // RFQ page: archived line excluded from the payload
    let sent: unknown = null;
    await page.route('**/api/rfq', async (r) => { sent = r.request().postDataJSON(); await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reference: 'T-1' }) }); });
    await gotoReady(page, '/en/contact');
    await page.getByLabel(/^Full name/).fill('Test Buyer');
    await page.locator('#f-country').selectOption('SA');
    await page.locator('#f-email').fill('buyer@example.com');
    await page.locator('#f-consent').check();
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await expect.poll(() => sent).not.toBeNull();
    const ids = (sent as { items: { collection_id: string }[] }).items.map((i) => i.collection_id);
    expect(ids).toEqual(['pv-kb-04']);
    // Arabic + removal
    await gotoReady(page, '/ar/inquiry');
    await expect(page.getByTestId('archived-row')).toContainText('تصميم تجريبي — لم يعد متاحًا');
    await page.getByRole('button', { name: 'حذف البنود غير المتاحة' }).click();
    await expect(page.getByTestId('archived-row')).toHaveCount(0);
    expect((await inquiryStorage(page)).map((i) => i.id)).toEqual(['pv-kb-04']);
  });

  test('old saved Inquiry entries for duplicate bedroom ids are canonicalised explicitly (qty + note kept, no double lines)', async ({ page }) => {
    await page.addInitScript(([k]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify([{ id: 'pv-br-12', qty: 3, note: 'silver finish' }, { id: 'pv-br-01', qty: 2, note: 'keep' }, { id: 'pv-br-08', qty: 5, note: '' }])); }, [INQUIRY_KEY]);
    await gotoReady(page, '/en/inquiry');
    await expect(page.getByText('2 collections selected')).toBeVisible();
    const s = await inquiryStorage(page) as { id: string; qty: number; note: string; from?: string[] }[];
    expect(s.map((i) => i.id).sort()).toEqual(['pv-br-01', 'pv-br-02']);
    const soft = s.find((i) => i.id === 'pv-br-01')!;
    expect(soft.qty).toBe(5);
    expect(soft.note).toBe('silver finish / keep');
    expect(soft.from).toEqual(['pv-br-12']);
    expect(s.find((i) => i.id === 'pv-br-02')).toMatchObject({ qty: 5, from: ['pv-br-08'] });
    await expect(page.getByTestId('merged-note').first()).toContainText('PV-BR-12');
    await page.reload({ waitUntil: 'networkidle' });
    expect(await inquiryStorage(page)).toHaveLength(2); // stable after refresh
  });

  test('RFQ API: archived and merged ids are rejected with distinct codes', async ({ request }) => {
    const body = (id: string, code: string) => ({
      contact: { name: 'A', company: null, buyer_type: null, email: 'a@b.co', phone: null, preferred_method: 'email' }, destination_country: 'SA',
      items: [{ collection_id: id, code, quantity: 1, unit: 'set', notes: null }], inquiry_type: null,
      trade_preferences: { delivery_term: null, payment_term: null, destination_port_city: null }, message: 'hi',
      consent: { given: true, text_version: 'v1', at: new Date().toISOString() }, locale: 'en', source_url: 'http://x', created_at: new Date().toISOString(), website: '',
    });
    const a = await request.post('/api/rfq', { data: body('pv-kb-01', 'PV-KB-01') });
    expect(a.status()).toBe(422);
    expect(JSON.stringify(await a.json())).toContain('archived_item');
    const m = await request.post('/api/rfq', { data: body('pv-br-12', 'PV-BR-12') });
    expect(m.status()).toBe(422);
    expect(JSON.stringify(await m.json())).toContain('merged_item');
  });

  test('Plush Curve and Sculpted White remain independent active products', async ({ request }) => {
    expect((await request.get('/en/collections/living-rooms/plush-curve-sofa', { maxRedirects: 0 })).status()).toBe(200);
    expect((await request.get('/en/collections/living-rooms/sculpted-white-sofa', { maxRedirects: 0 })).status()).toBe(200);
  });

  test('units are context-sensitive (corner sofa / sofa / chaise / bedroom set) in EN and AR', async ({ page }) => {
    await gotoReady(page, '/en/collections/corner-sofas/urban-l-shape-sofa');
    await expect(page.getByText('Requested quantity (corner sofas)')).toBeVisible();
    await gotoReady(page, '/en/collections/living-rooms/classic-white-chaise');
    await expect(page.getByText('Requested quantity (chaise longues)')).toBeVisible();
    await gotoReady(page, '/ar/collections/bedrooms/two-tone-panel-bedroom-set');
    await expect(page.getByText('الكمية المطلوبة (أطقم غرف نوم)')).toBeVisible();
    await gotoReady(page, '/en/collections/bedrooms/two-tone-panel-bedroom-set');
    await expect(page.getByText('Requested quantity (bedroom sets)')).toBeVisible();
  });

  test('Arabic counts: 3–10 use the plural, 11+ the singular form', async ({ page }) => {
    await gotoReady(page, '/ar/collections/dressing-rooms');
    await expect(page.getByText('6 مجموعات')).toBeVisible();
    await gotoReady(page, '/ar/collections/living-rooms');
    await expect(page.getByText('17 مجموعة', { exact: true })).toBeVisible();
  });

  test('404 pages have a localized document title', async ({ page }) => {
    await page.goto('/en/nope-nope', { waitUntil: 'networkidle' });
    expect(await page.title()).toContain('Page not found');
    await page.goto('/ar/nope-nope', { waitUntil: 'networkidle' });
    expect(await page.title()).toContain('الصفحة غير موجودة');
  });

  test('hero: tablet width is served at least 1× the rendered CSS width (sharp at DPR 1)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'viewport is set explicitly');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/en', { waitUntil: 'networkidle' });
    const m = await page.locator('[data-testid="hero-frame"] img').evaluate((i: HTMLImageElement) => ({ src: i.currentSrc, css: i.getBoundingClientRect().width, dpr: devicePixelRatio }));
    const w = Number(/w=(\d+)/.exec(m.src)?.[1]);
    expect(w).toBeGreaterThanOrEqual(Math.round(m.css * m.dpr));
  });

  test('gallery: small detail images are not stretched beyond ~1.15× native size', async ({ page }) => {
    await gotoReady(page, '/en/collections/dressing-rooms/glass-door-walk-in-dressing-room');
    await page.locator('[data-testid="gallery-thumb"]').nth(1).click();
    const img = page.locator('[data-testid="gallery-frame"] img');
    await expect.poll(async () => img.evaluate((i: HTMLImageElement) => i.complete && i.getBoundingClientRect().width <= Number(i.getAttribute('width')) * 1.16 + 1)).toBe(true);
  });
});
