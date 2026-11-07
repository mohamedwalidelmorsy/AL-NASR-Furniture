import { expect, test } from '@playwright/test';
import { gotoReady, inquiryStorage, langSwitch, PRODUCT } from './helpers';

test.describe('language switching, RTL/LTR', () => {
  test('English is LTR, Arabic is RTL, with correct lang attributes', async ({ page }) => {
    await gotoReady(page, '/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await gotoReady(page, '/ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  for (const path of ['', '/about', '/collections', '/collections/bedrooms', '/shipping-payment', '/contact']) {
    test(`switching keeps the same page: ${path || '/'}`, async ({ page }) => {
      await gotoReady(page, `/en${path}`);
      await langSwitch(page).click();
      await expect(page).toHaveURL(new RegExp(`/ar${path}$`));
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await langSwitch(page).click();
      await expect(page).toHaveURL(new RegExp(`/en${path}$`));
      await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    });
  }

  test('product identity and localized image variant are kept across languages', async ({ page }) => {
    await gotoReady(page, PRODUCT);
    const enSrc = decodeURIComponent((await page.locator('main img').first().getAttribute('src')) || '');
    expect(enSrc).toContain('-en-');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Soft Arc Bedroom Set');
    await langSwitch(page).click();
    await expect(page).toHaveURL(/\/ar\/collections\/bedrooms\/soft-arc-bedroom-set$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('طقم غرفة نوم');
    const arSrc = decodeURIComponent((await page.locator('main img').first().getAttribute('src')) || '');
    expect(arSrc).toContain('-ar-');
    await expect(page.locator('main').getByText('PV-BR-01').first()).toBeVisible();
  });

  test('layout actually mirrors in RTL (logical properties)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop header geometry');
    await gotoReady(page, '/en');
    const enLogo = await page.locator('header a[aria-label="AL NASR FURNITURE"]').boundingBox();
    await gotoReady(page, '/ar');
    const arLogo = await page.locator('header a[aria-label="AL NASR FURNITURE"]').boundingBox();
    const vw = page.viewportSize()!.width;
    expect(enLogo!.x).toBeLessThan(vw / 2);
    expect(arLogo!.x).toBeGreaterThan(vw / 2);
  });

  test('Arabic copy renders in the Arabic typeface and uses Arabic UI strings', async ({ page }) => {
    await gotoReady(page, '/ar/contact');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const family = await page.locator('main').evaluate((el) => getComputedStyle(el.parentElement!).fontFamily);
    expect(family).toMatch(/plex-ar|IBM Plex Sans Arabic/i);
    await expect(page.getByRole('button', { name: /إرسال طلب/ })).toBeVisible();
  });

  test('Inquiry List survives a language switch', async ({ page }) => {
    await gotoReady(page, PRODUCT);
    await page.getByRole('button', { name: 'Add to Inquiry' }).click();
    await expect.poll(async () => (await inquiryStorage(page)).length).toBe(1);
    await langSwitch(page).click();
    await expect(page).toHaveURL(/\/ar\//);
    expect(await inquiryStorage(page)).toHaveLength(1);
    await page.goto('/ar/inquiry', { waitUntil: 'networkidle' });
    await expect(page.locator('main').getByText('PV-BR-01')).toBeVisible();
  });
});
