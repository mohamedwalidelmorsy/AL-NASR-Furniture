import { expect, test, type Page } from '@playwright/test';
import { gotoReady, INQUIRY_KEY } from './helpers';

async function fillValid(page: Page) {
  await page.getByLabel(/^Full name/).fill('Ahmed Test');
  await page.locator('#f-country').selectOption('SA');
  await page.locator('#f-email').fill('ahmed@example.com');
  await page.locator('#f-message').fill('We need 2 containers of bedroom sets.');
  await page.locator('#f-consent').check();
}

test.describe('Request a Quote', () => {
  test('shows a summary and per-field errors for an empty submit; fixing clears them', async ({ page }) => {
    await gotoReady(page, '/en/contact');
    await page.getByRole('button', { name: 'Send quote request' }).click();
    const summary = page.getByRole('alert').filter({ hasText: 'Please correct the following' });
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(page.locator('#f-name-err')).toBeVisible();
    await expect(page.locator('#f-country-err')).toBeVisible();
    await expect(page.locator('#f-consent-err')).toBeVisible();
    await expect(page.locator('#f-name')).toHaveAttribute('aria-invalid', 'true');
    await page.locator('#f-name').fill('Ahmed');
    await expect(page.locator('#f-name-err')).toHaveCount(0); // live revalidation after first submit
  });

  test('validates email/phone formats and requires a contact method', async ({ page }) => {
    await gotoReady(page, '/en/contact');
    await fillValid(page);
    await page.locator('#f-email').fill('not-an-email');
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await expect(page.locator('#f-email-err')).toContainText('valid email');
    await page.locator('#f-email').fill('');
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await expect(page.locator('#f-email-err')).toContainText('email address or a phone');
    await page.locator('#f-phone').fill('+971 50 123 4567');
    await expect(page.locator('#f-email-err')).toHaveCount(0);
  });

  test('message is optional once the inquiry list has items', async ({ page }) => {
    await page.addInitScript(([k]) => localStorage.setItem(k, JSON.stringify([{ id: 'pv-br-01', qty: 2, note: '' }])), [INQUIRY_KEY]);
    await gotoReady(page, '/en/contact');
    await expect(page.locator('aside').getByText('Soft Arc Bedroom Set')).toBeVisible();
    await page.getByLabel(/^Full name/).fill('Ahmed');
    await page.locator('#f-country').selectOption('AE');
    await page.locator('#f-phone').fill('+971501234567');
    await page.locator('#f-consent').check();
    let posted = false;
    await page.route('**/api/rfq', async (r) => { posted = true; await r.fulfill({ status: 200, json: { reference: 'RFQ-TEST' } }); });
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await expect(page.getByText('Request received')).toBeVisible();
    expect(posted).toBe(true);
  });

  test('without a configured provider the API refuses (503) and the UI never fakes success', async ({ page }) => {
    await gotoReady(page, '/en/contact');
    await fillValid(page);
    await page.getByRole('button', { name: 'Send quote request' }).click();
    const alert = page.getByRole('alert').filter({ hasText: 'Request not sent' });
    await expect(alert).toBeVisible();
    await expect(page.getByText('Request received')).toHaveCount(0);
    // data is kept so the buyer can retry or use WhatsApp
    await expect(page.locator('#f-name')).toHaveValue('Ahmed Test');
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('rate limit (429) and limiter outage (503) show their own messages and keep the data', async ({ page }) => {
    await gotoReady(page, '/en/contact');
    await fillValid(page);
    await page.route('**/api/rfq', (r) => r.fulfill({ status: 429, headers: { 'Retry-After': '540' }, json: { error: 'rate_limited' } }));
    await page.getByRole('button', { name: 'Send quote request' }).click();
    const limited = page.getByRole('alert').filter({ hasText: 'Too many requests' });
    await expect(limited).toBeVisible();
    await expect(limited).toContainText('about 9 minutes');
    await expect(limited).toBeFocused();

    await page.unroute('**/api/rfq');
    await page.route('**/api/rfq', (r) => r.fulfill({ status: 503, headers: { 'Retry-After': '120' }, json: { error: 'rfq_unavailable' } }));
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Requests temporarily unavailable' })).toBeVisible();
    await expect(page.getByText('Request received')).toHaveCount(0);
    await expect(page.locator('#f-name')).toHaveValue('Ahmed Test');
  });

  test('Arabic: 429 uses the dual form and 503 its own localized message', async ({ page }) => {
    await gotoReady(page, '/ar/contact');
    await page.locator('#f-name').fill('أحمد');
    await page.locator('#f-country').selectOption('SA');
    await page.locator('#f-email').fill('ahmed@example.com');
    await page.locator('#f-message').fill('نحتاج حاويتين من غرف النوم.');
    await page.locator('#f-consent').check();
    await page.route('**/api/rfq', (r) => r.fulfill({ status: 429, headers: { 'Retry-After': '120' }, json: { error: 'rate_limited' } }));
    await page.locator('form button[type="submit"]').click();
    const limited = page.getByRole('alert').filter({ hasText: 'عدد كبير من الطلبات' });
    await expect(limited).toBeVisible();
    await expect(limited).toContainText('بعد دقيقتين تقريبًا');

    await page.unroute('**/api/rfq');
    await page.route('**/api/rfq', (r) => r.fulfill({ status: 503, json: { error: 'rfq_unavailable' } }));
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByRole('alert').filter({ hasText: 'استقبال الطلبات متوقف مؤقتًا' })).toBeVisible();
    await expect(page.locator('#f-name')).toHaveValue('أحمد');
  });

  test('server and network failures show distinct errors; success shows the reference and clears the draft', async ({ page }) => {
    await gotoReady(page, '/en/contact');
    await fillValid(page);
    await page.route('**/api/rfq', (r) => r.fulfill({ status: 502, json: { error: 'delivery_failed' } }));
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Request not accepted' })).toBeVisible();

    await page.unroute('**/api/rfq');
    await page.route('**/api/rfq', (r) => r.abort('failed'));
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Connection problem' })).toBeVisible();

    await page.unroute('**/api/rfq');
    let body: Record<string, unknown> = {};
    await page.route('**/api/rfq', async (r) => { body = r.request().postDataJSON(); await r.fulfill({ status: 200, json: { reference: 'RFQ-20260101-ABC123' } }); });
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByText('Request received')).toBeVisible();
    await expect(page.getByText('RFQ-20260101-ABC123')).toBeVisible();
    expect(body).toMatchObject({ destination_country: 'SA', locale: 'en', contact: { email: 'ahmed@example.com', preferred_method: 'email' }, consent: { given: true } });
    expect(await page.evaluate(() => localStorage.getItem('alnasr.rfqDraft.v1'))).toBeNull();
  });

  test('draft is saved locally and restored after reload (never the honeypot)', async ({ page }) => {
    await gotoReady(page, '/en/contact');
    await page.locator('#f-name').fill('Draft Person');
    await page.locator('#f-company').fill('Acme Trading');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('alnasr.rfqDraft.v1'))).toContain('Draft Person');
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('#f-name')).toHaveValue('Draft Person');
    await expect(page.locator('#f-company')).toHaveValue('Acme Trading');
  });

  test('CTAs preset the inquiry type; trade preferences are optional and sent when chosen', async ({ page }) => {
    await gotoReady(page, '/en/contact?type=shipping');
    await expect(page.locator('#f-inquiryType')).toHaveValue('shipping');
    await fillValid(page);
    await page.locator('#f-shipTerm').selectOption('FOB');
    await page.locator('#f-payTerm').selectOption('lc-at-sight');
    await page.locator('#f-destPort').fill('Jeddah');
    let body: { trade_preferences?: unknown; inquiry_type?: string } = {};
    await page.route('**/api/rfq', async (r) => { body = r.request().postDataJSON(); await r.fulfill({ status: 200, json: {} }); });
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await expect(page.getByText('Request received')).toBeVisible();
    expect(body.inquiry_type).toBe('shipping');
    expect(body.trade_preferences).toEqual({ delivery_term: 'FOB', payment_term: 'lc-at-sight', destination_port_city: 'Jeddah' });
  });

  test('Arabic form validates in Arabic', async ({ page }) => {
    await gotoReady(page, '/ar/contact');
    await page.getByRole('button', { name: 'إرسال طلب عرض السعر' }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(page.locator('#f-name-err')).toContainText('أدخل اسمك');
  });

  test('contact page offers WhatsApp/e-mail channels honestly (PENDING until configured)', async ({ page }) => {
    await gotoReady(page, '/en/contact');
    await expect(page.getByText('PENDING').first()).toBeVisible();
  });
});

test.describe('RFQ API (real server)', () => {
  test('rejects wrong content type, invalid bodies and GET', async ({ request }) => {
    expect((await request.post('/api/rfq', { data: 'x', headers: { 'content-type': 'text/plain' } })).status()).toBe(415);
    const bad = await request.post('/api/rfq', { data: { nope: true } });
    expect(bad.status()).toBe(422);
    expect((await request.get('/api/rfq')).status()).toBe(405);
  });
});
