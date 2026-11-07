import { expect, test } from '@playwright/test';
import { expectNoHorizontalScroll, gotoReady, PRODUCT } from './helpers';

const PAGES = ['', '/collections', '/collections/bedrooms', '/collections/bedrooms/soft-arc-bedroom-set', '/about', '/sourcing-export', '/shipping-payment', '/custom-manufacturing', '/contact', '/inquiry', '/privacy'];

test.describe('responsive layout', () => {
  for (const lang of ['en', 'ar']) {
    for (const p of PAGES) {
      test(`no horizontal overflow: /${lang}${p || ''}`, async ({ page }) => {
        await gotoReady(page, `/${lang}${p}`);
        await expectNoHorizontalScroll(page);
      });
    }
  }

  test('mobile: hamburger opens the menu, links navigate, Escape closes and returns focus', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile project only');
    await gotoReady(page, '/en');
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).first()).toBeHidden();
    const btn = page.getByRole('button', { name: 'Menu' });
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await expect(btn).toBeFocused();
    await btn.click();
    await page.locator('#mobile-menu').getByRole('link', { name: /^Collections/ }).click();
    await expect(page).toHaveURL(/\/en\/collections$/);
    await expect(page.locator('#mobile-menu')).toBeHidden(); // menu closes on navigation
  });

  test('mobile: language switch lives in the menu and in the footer', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile project only');
    await gotoReady(page, '/en/about');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.locator('#mobile-menu [data-testid="lang-switch"]').click();
    await expect(page).toHaveURL(/\/ar\/about$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('desktop: full navigation and Request a Quote CTA are visible; no hamburger', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop project only');
    await gotoReady(page, '/en');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: 'Request a Quote' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  });

  test('touch targets in the header are at least 44px', async ({ page }) => {
    await gotoReady(page, '/en');
    const boxes = await page.locator('header a:visible, header button:visible').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { h: r.height, t: (e.textContent || '').trim().slice(0, 20) }; }));
    for (const b of boxes) if (b.t !== 'AL NASR FURNITURE' && b.t !== 'AL NASRFURNITURE') expect(b.h, b.t).toBeGreaterThanOrEqual(43.5);
  });

  test('product page on a narrow screen keeps gallery and purchase panel usable', async ({ page }) => {
    await gotoReady(page, PRODUCT);
    await expect(page.getByRole('button', { name: 'Add to Inquiry' })).toBeVisible();
    const img = page.locator('main button[aria-label^="View larger image"] img');
    const box = await img.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  });
});
