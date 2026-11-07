import { expect, test } from '@playwright/test';
import { gotoReady, PRODUCT } from './helpers';

const CATEGORIES = ['bedrooms', 'kids-bedrooms', 'corner-sofas', 'living-rooms', 'china-cabinets', 'dining-rooms'];

test.describe('categories, product pages, galleries', () => {
  test('collections overview shows all six categories with counts', async ({ page }) => {
    await gotoReady(page, '/en/collections');
    const cards = page.locator('main ul li a[href*="/en/collections/"]');
    await expect(cards).toHaveCount(6);
    for (const slug of CATEGORIES) await expect(page.locator(`main a[href="/en/collections/${slug}"]`)).toBeVisible();
    await expect(page.getByText(/\d+ collections?/).first()).toBeVisible();
  });

  for (const slug of CATEGORIES) {
    test(`category page renders products: ${slug}`, async ({ page }) => {
      const res = await page.goto(`/en/collections/${slug}`, { waitUntil: 'networkidle' });
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toBeVisible();
      const items = page.locator(`main a[href^="/en/collections/${slug}/"]`);
      expect(await items.count()).toBeGreaterThan(0);
      // category tabs mark the current category
      await expect(page.locator(`nav a[href="/en/collections/${slug}"][aria-current="page"]`)).toHaveCount(1);
    });
  }

  test('global search finds products by name and code (EN + AR) and shows an empty state', async ({ page }) => {
    await gotoReady(page, '/en/collections');
    const box = page.getByLabel('Search all collections');
    await box.fill('soft arc');
    await expect(page.locator('main [role="status"]')).toContainText(/\d+ results?/);
    await expect(page.locator('main').getByRole('heading', { name: 'Soft Arc Bedroom Set' })).toBeVisible();
    await box.fill('PV-KB-01');
    await expect(page.locator('main h3')).toHaveCount(1);
    await box.fill('طقم');
    expect(await page.locator('main h3').count()).toBeGreaterThan(0);
    await box.fill('zzzzzz');
    await expect(page.getByText('No collections match')).toBeVisible();
  });

  test('category search filters and can be reset', async ({ page }) => {
    await gotoReady(page, '/en/collections/bedrooms');
    const total = await page.locator('main h2').count();
    await page.getByLabel('Search in this category').fill('zzzz');
    await expect(page.locator('main h2')).toHaveCount(0);
    await page.getByRole('button', { name: /reset|clear/i }).first().click();
    await expect(page.locator('main h2')).toHaveCount(total);
  });

  test('product detail page: identity, illustrative notice, no price, related items', async ({ page }) => {
    await gotoReady(page, PRODUCT);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Soft Arc Bedroom Set');
    await expect(page.getByText('PV-BR-01').first()).toBeVisible();
    await expect(page.getByText(/Illustrative design — this catalog image is AI-generated/)).toBeVisible();
    await expect(page.getByText('Set contents to be confirmed')).toBeVisible(); // pieces never invented
    await expect(page.getByText(/Prices are quoted individually/)).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/\$\s?\d|USD \d|€\s?\d/);
    await expect(page.getByRole('heading', { name: /related|more from/i }).first()).toBeVisible();
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  });

  test('image gallery: main image loads, lightbox opens, traps focus, closes on Escape and restores focus', async ({ page }) => {
    await gotoReady(page, PRODUCT);
    const main = page.locator('main button[aria-label^="View larger image"]');
    await expect(main.locator('img')).toBeVisible();
    expect(await main.locator('img').evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
    await main.focus();
    await main.click();
    const dlg = page.getByTestId('lightbox');
    await expect(dlg).toBeVisible();
    await expect(dlg).toHaveAttribute('aria-modal', 'true');
    await expect(page.getByRole('button', { name: 'Close image viewer' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Close image viewer' })).toBeFocused(); // single control → focus stays trapped
    await page.keyboard.press('Escape');
    await expect(dlg).toBeHidden();
    await expect(main).toBeFocused();
  });

  test('WhatsApp control is honest while no number is configured', async ({ page }) => {
    await gotoReady(page, PRODUCT);
    await page.getByRole('button', { name: /Ask on WhatsApp/ }).first().click();
    await expect(page.getByText('WhatsApp number is pending configuration.')).toBeVisible();
  });
});
