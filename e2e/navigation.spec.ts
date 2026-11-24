import { expect, test } from '@playwright/test';
import { gotoReady } from './helpers';

test.describe('navigation & metadata', () => {
  test('root redirects to the default locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
  });

  test('primary navigation reaches every top-level page', async ({ page, isMobile }) => {
    await gotoReady(page, '/en');
    const targets: [string, RegExp][] = [['Collections', /\/en\/collections$/], ['About Us', /\/en\/about$/], ['Sourcing & Export', /\/en\/sourcing-export$/], ['Contact', /\/en\/contact$/]];
    for (const [name, url] of targets) {
      if (isMobile) {
        await page.getByRole('button', { name: 'Menu' }).click();
        await page.locator('#mobile-menu').getByRole('link', { name: new RegExp(`^${name}`) }).click();
      } else {
        await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name }).click();
      }
      await expect(page).toHaveURL(url);
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('buyer-guide pages are reachable from Sourcing & Export', async ({ page }) => {
    await gotoReady(page, '/en/sourcing-export');
    await page.getByRole('link', { name: /Shipping & Payment Guide/ }).first().click();
    await expect(page).toHaveURL(/shipping-payment$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Shipping');
    await gotoReady(page, '/en/sourcing-export');
    await page.getByRole('link', { name: /Custom Manufacturing & Projects/ }).first().click();
    await expect(page).toHaveURL(/custom-manufacturing$/);
  });

  test('active nav item is marked with aria-current', async ({ page, isMobile }) => {
    test.skip(isMobile, 'full nav is desktop-only');
    await gotoReady(page, '/en/about');
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About Us' })).toHaveAttribute('aria-current', 'page');
    // Shipping guide highlights its parent, Sourcing & Export.
    await gotoReady(page, '/en/shipping-payment');
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Sourcing & Export' })).toHaveAttribute('aria-current', 'page');
  });

  test('unknown URLs return a real 404 with the localized page', async ({ page }) => {
    const res = await page.goto('/en/nope');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const ar = await page.goto('/ar/collections/bedrooms/not-a-product');
    expect(ar?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('paths outside any locale answer 404, never 5xx', async ({ request }) => {
    // Browsers request /favicon.ico and /apple-touch-icon.png on their own, and bots probe paths like /wp-login.php.
    // The proxy skips dotted paths, so these reach the [locale] segment with an unknown "locale".
    for (const path of ['/favicon.ico', '/apple-touch-icon.png', '/wp-login.php', '/not-a-locale.txt/about']) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(404);
    }
  });

  test('every page has a title, canonical and AR/EN hreflang alternates', async ({ page }) => {
    for (const path of ['/en', '/ar/about', '/en/collections/bedrooms', '/en/collections/bedrooms/soft-arc-bedroom-set']) {
      await gotoReady(page, path);
      const locale = path.startsWith('/ar') ? 'ar' : 'en';
      const rest = path.replace(/^\/(en|ar)/, '');
      expect(await page.title()).toMatch(/—/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/${locale}${rest}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', new RegExp(`/en${rest}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute('href', new RegExp(`/ar${rest}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    }
  });

  test('sitemap lists both languages with alternates; robots blocks indexing until launch', async ({ request }) => {
    const sm = await (await request.get('/sitemap.xml')).text();
    expect(sm).toContain('/en/collections/bedrooms/soft-arc-bedroom-set');
    expect(sm).toContain('/ar/collections/bedrooms/soft-arc-bedroom-set');
    expect(sm).toContain('hreflang="ar"');
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toMatch(/Disallow: \//);
  });

  test('document structure: skip link, one h1, landmarks', async ({ page }) => {
    await gotoReady(page, '/en');
    await expect(page.getByRole('button', { name: 'Skip to content' })).toBeAttached();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
  });
});
