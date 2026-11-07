import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { gotoReady } from './helpers';

const PAGES = ['', '/collections', '/collections/bedrooms', '/collections/bedrooms/soft-arc-bedroom-set', '/about', '/sourcing-export', '/shipping-payment', '/custom-manufacturing', '/contact', '/inquiry', '/privacy'];

test.describe('accessibility (axe-core, WCAG 2.1 A/AA)', () => {
  for (const lang of ['en', 'ar']) {
    for (const p of PAGES) {
      test(`/${lang}${p}`, async ({ page }) => {
        await gotoReady(page, `/${lang}${p}`);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
        expect(summary).toEqual([]);
      });
    }
  }
});
