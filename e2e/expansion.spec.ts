import { expect, test } from '@playwright/test';
import { gotoReady, INQUIRY_KEY, inquiryStorage } from './helpers';

const BEDROOM = '/en/collections/bedrooms/two-tone-panel-bedroom-set';
const KIDS = '/en/collections/kids-bedrooms/blush-arch-twin-kids-bedroom-set';
const DRESSING = '/en/collections/dressing-rooms/corner-glass-door-dressing-room-with-vanity';

test.describe('catalog expansion', () => {
  test('hero uses the selected living-room image in a 3:2 frame (two-column layout kept)', async ({ page, isMobile }) => {
    await gotoReady(page, '/en');
    const frame = page.locator('[data-testid="hero-frame"]');
    const box = await frame.boundingBox();
    expect(box).toBeTruthy();
    expect(Math.abs(box!.width / box!.height - 1.5)).toBeLessThan(0.02);
    const img = frame.locator('img');
    expect(await img.getAttribute('src')).toContain('warm-neutral-living-room-1672');
    expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
    if (!isMobile) {
      const h1 = await page.locator('h1').boundingBox();
      expect(h1!.x + h1!.width).toBeLessThan(box!.x + 8); // text column and image column side by side on desktop
    }
  });

  test('Dressing Rooms is a top-level category with real covers and a link from Bedroom Sets', async ({ page }) => {
    await gotoReady(page, '/en/collections/dressing-rooms');
    await expect(page.locator('h1')).toHaveText('Dressing Rooms');
    expect(await page.locator('main a[href^="/en/collections/dressing-rooms/"]').count()).toBeGreaterThanOrEqual(6);
    await gotoReady(page, '/en/collections/bedrooms');
    await expect(page.locator('[data-testid="related-category"] a[href="/en/collections/dressing-rooms"]')).toBeVisible();
    await gotoReady(page, '/ar/collections/dressing-rooms');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('h1')).toHaveText('غرف ملابس');
  });

  test('gallery thumbnails are real images, selecting one changes the main image, keyboard works', async ({ page }) => {
    await gotoReady(page, BEDROOM);
    const thumbs = page.locator('[data-testid="gallery-thumb"]');
    expect(await thumbs.count()).toBeGreaterThanOrEqual(4);
    for (const i of [0, 1, 2]) {
      const im = thumbs.nth(i).locator('img');
      await im.scrollIntoViewIfNeeded();
      await expect.poll(() => im.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
    }
    expect(await thumbs.nth(0).textContent()).toBe(''); // no numbered placeholder tiles
    const mainSrc = () => page.locator('[data-testid="gallery-frame"] img').getAttribute('src');
    const before = await mainSrc();
    await thumbs.nth(2).click();
    await expect(thumbs.nth(2)).toHaveAttribute('aria-current', 'true');
    await expect.poll(mainSrc).not.toBe(before);
    await page.locator('button[aria-label^="View larger image"]').click();
    await expect(page.locator('[data-testid="lightbox"]')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="lightbox"]')).toHaveCount(0);
  });

  test('landscape covers keep their proportions (no stretching)', async ({ page }) => {
    await gotoReady(page, BEDROOM);
    const frame = page.locator('[data-testid="gallery-frame"]');
    const box = await frame.boundingBox();
    expect(box!.width / box!.height).toBeGreaterThan(1.5); // first image is 2.3:1 → frame is clamped to 16:9, image is contained
    const fit = await frame.locator('img').evaluate((i) => getComputedStyle(i).objectFit);
    expect(fit).toBe('contain');
  });

  test('standard dimensions block: wardrobe 250 wide × 230 high, no depth (EN + AR); kids standard; dressing made-to-measure', async ({ page }) => {
    await gotoReady(page, BEDROOM);
    const block = page.locator('[data-testid="dimensions-block"]');
    await expect(block).toContainText('250 cm wide × 230 cm high');
    await expect(block).toContainText('160 cm');
    await expect(block).toContainText('120–150 cm');
    await expect(block).not.toContainText(/\bdepth: ?\d|× ?\d+ ?cm deep/i);
    await expect(block).toContainText('Wardrobe depth and other unspecified dimensions are confirmed in your quotation');
    await gotoReady(page, '/ar/collections/bedrooms/two-tone-panel-bedroom-set');
    await expect(page.locator('[data-testid="dimensions-block"]')).toContainText('عرض 250 سم × ارتفاع 230 سم');
    await gotoReady(page, KIDS);
    await expect(page.locator('[data-testid="dimensions-block"]')).toContainText('2 beds, 120 cm each');
    await gotoReady(page, DRESSING);
    await expect(page.locator('[data-testid="dimensions-block"]')).toContainText('Made to measure');
    await expect(page.locator('[data-testid="dimensions-block"]')).not.toContainText(/\d+ cm/);
  });

  test('Kids Room 3 cover is the clean render, not the specification infographic', async ({ page }) => {
    await gotoReady(page, KIDS);
    const src = await page.locator('[data-testid="gallery-frame"] img').getAttribute('src');
    expect(decodeURIComponent(src!)).toContain('/blush-arch-twin-kids-bedroom-set/01-cover');
    const meta = await page.evaluate(() => document.body.innerText);
    expect(meta).not.toMatch(/Bed Size \(Each\)|Melamine Counter/);
  });

  test('legacy and continuing products keep their ids and URLs; Soft Arc Corner Sofa now lives under Corner Sofas (its old Living Rooms URL redirects)', async ({ page }) => {
    for (const u of ['/en/collections/bedrooms/soft-arc-bedroom-set', '/en/collections/living-rooms/soft-arc-corner-sofa', '/en/collections/kids-bedrooms/arch-line-kids-bedroom-set', '/en/collections/dining-rooms/dining-room-set']) {
      const res = await page.goto(u, { waitUntil: 'networkidle' });
      expect(res?.status(), u).toBe(200);
    }
    await gotoReady(page, '/en/collections/corner-sofas');
    await expect(page.locator('main a[href="/en/collections/corner-sofas/soft-arc-corner-sofa"]')).toBeVisible();
  });

  test('persisted Inquiry List entries for legacy products keep working; new products can be added', async ({ page }) => {
    await page.addInitScript(([k]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify([{ id: 'pv-br-01', qty: 5, note: 'keep me' }, { id: 'gone-product', qty: 2, note: '' }])); }, [INQUIRY_KEY]);
    await gotoReady(page, '/en/inquiry');
    await expect(page.locator('main').getByText('Soft Arc Bedroom Set')).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toHaveValue('keep me');
    await gotoReady(page, BEDROOM);
    await page.getByRole('button', { name: 'Add to Inquiry' }).click();
    const s = await inquiryStorage(page);
    expect(s.map((x) => x.id).sort()).toEqual(['gone-product', 'pv-br-01', 'pv-br-05']); // unknown id is preserved, nothing rewritten
  });
});
