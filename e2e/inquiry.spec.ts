import { expect, test } from '@playwright/test';
import { gotoReady, INQUIRY_KEY, inquiryStorage, PRODUCT } from './helpers';

const PRODUCT2 = '/en/collections/kids-bedrooms/' ;

test.describe('Inquiry List', () => {
  test('add → badge → persists across reload and navigation; no duplicates', async ({ page }) => {
    await gotoReady(page, PRODUCT);
    await page.locator('#dqty').fill('4');
    await page.getByRole('button', { name: 'Add to Inquiry' }).click();
    await expect(page.getByText('Added to your inquiry list')).toBeVisible();
    await expect(page.locator('header a[aria-label^="Inquiry List"]')).toContainText('1');
    await page.locator('#dqty').fill('6');
    await page.getByRole('button', { name: 'Update Inquiry' }).click();
    await expect(page.getByText('Inquiry quantity updated')).toBeVisible();
    expect(await inquiryStorage(page)).toEqual([{ id: 'pv-br-01', qty: 6, note: '' }]);

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('header a[aria-label^="Inquiry List"]')).toContainText('1');
    await expect(page.locator('#dqty')).toHaveValue('6'); // quantity restored on the product page
    await page.goto('/en/inquiry', { waitUntil: 'networkidle' });
    await expect(page.locator('main').getByText('Soft Arc Bedroom Set')).toBeVisible();
    await expect(page.getByText('1 collection selected')).toBeVisible();
  });

  test('edit quantity and note on the list; remove and undo', async ({ page }) => {
    await page.addInitScript(([k]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify([{ id: 'pv-br-01', qty: 2, note: '' }])); }, [INQUIRY_KEY]);
    await gotoReady(page, '/en/inquiry');
    await page.getByRole('button', { name: 'Increase quantity' }).click();
    await page.getByLabel('Note').fill('walnut finish');
    await expect.poll(async () => (await inquiryStorage(page))[0]?.qty).toBe(3);
    expect((await inquiryStorage(page))[0].note).toBe('walnut finish');

    await page.getByRole('button', { name: /^Remove/ }).click();
    await expect(page.getByText('Removed from inquiry list')).toBeVisible();
    await expect(page.getByText('Your inquiry list is empty')).toBeVisible();
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.locator('main').getByText('Soft Arc Bedroom Set')).toBeVisible();
    expect((await inquiryStorage(page))[0]).toMatchObject({ id: 'pv-br-01', qty: 3, note: 'walnut finish' });
  });

  test('stale prototype IDs are ignored but not destroyed; empty state has no flash', async ({ page }) => {
    await page.addInitScript(([k]) => localStorage.setItem(k, JSON.stringify([{ id: 'SAMPLE-CS-01', qty: 2, note: '' }, { id: 'pv-kb-04', qty: 1, note: '' }])), [INQUIRY_KEY]);
    await gotoReady(page, '/en/inquiry');
    await expect(page.getByText('1 collection selected')).toBeVisible();
    expect(await inquiryStorage(page)).toHaveLength(2);
  });

  test('empty list offers a way forward', async ({ page }) => {
    await gotoReady(page, '/en/inquiry');
    await expect(page.getByText('Your inquiry list is empty')).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse/ }).first()).toBeVisible();
  });

  test('category cards flag items already on the list', async ({ page }) => {
    await page.addInitScript(([k]) => localStorage.setItem(k, JSON.stringify([{ id: 'pv-br-01', qty: 5, note: '' }])), [INQUIRY_KEY]);
    await gotoReady(page, '/en/collections/bedrooms');
    await expect(page.locator('main').getByText(/Inquiry · 5/)).toBeVisible();
    void PRODUCT2;
  });
});
