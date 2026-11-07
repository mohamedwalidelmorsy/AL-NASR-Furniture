import { expect, type Page } from '@playwright/test';

export const PRODUCT = '/en/collections/bedrooms/soft-arc-bedroom-set';
export const PRODUCT_AR = '/ar/collections/bedrooms/soft-arc-bedroom-set';
export const INQUIRY_KEY = 'alnasr.inquiry.v1';

export async function gotoReady(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
}

export const inquiryStorage = (page: Page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]') as { id: string; qty: number; note: string }[], INQUIRY_KEY);

/** Visible language switch (header on desktop, footer on mobile). */
export const langSwitch = (page: Page) => page.locator('[data-testid="lang-switch"]:visible').first();

export async function expectNoHorizontalScroll(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(over, 'horizontal overflow (px)').toBeLessThanOrEqual(1);
}
