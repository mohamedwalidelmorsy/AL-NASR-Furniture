// Local visual QA: after-fix screenshots at 360/390/768/1280/1440 against the running dev server (http://localhost:3000).
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const out = path.resolve(import.meta.dirname, '../docs/reports/final-catalog-fixes/evidence/after');
fs.mkdirSync(out, { recursive: true });
const base = process.env.BASE ?? 'http://localhost:3000';
const W = [360, 390, 768, 1280, 1440];
const PAGES = {
  home: '/en', 'home-ar': '/ar',
  bedrooms: '/en/collections/bedrooms', 'bedrooms-ar': '/ar/collections/bedrooms',
  'corner-sofas': '/en/collections/corner-sofas', 'living-rooms': '/en/collections/living-rooms', 'kids-ar': '/ar/collections/kids-bedrooms',
  'product-bedroom': '/en/collections/bedrooms/soft-arc-bedroom-set', 'product-corner': '/en/collections/corner-sofas/teal-sectional-sofa',
  'archived-kids': '/en/collections/kids-bedrooms/arch-line-kids-bedroom-set', 'archived-kids-ar': '/ar/collections/kids-bedrooms/arch-line-kids-bedroom-set',
  'dressing-detail': '/en/collections/dressing-rooms/glass-door-walk-in-dressing-room', 'not-found': '/en/nope',
};
const browser = await chromium.launch();
const log = [];
for (const w of W) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const [name, url] of Object.entries(PAGES)) {
    await page.goto(base + url, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.screenshot({ path: path.join(out, `${name}-${w}.png`), fullPage: false });
    log.push({ page: name, width: w, horizontalOverflowPx: overflow });
  }
  // Inquiry List with old saved lines (archived kids + merged bedroom duplicate)
  await page.addInitScript(() => localStorage.setItem('alnasr.inquiry.v1', JSON.stringify([{ id: 'pv-kb-01', qty: 6, note: 'blue' }, { id: 'pv-br-12', qty: 3, note: 'silver' }, { id: 'pv-lr-10', qty: 1, note: '' }])));
  await page.goto(base + '/en/inquiry', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(out, `inquiry-migrated-${w}.png`), fullPage: true });
  log.push({ page: 'inquiry-migrated', width: w, horizontalOverflowPx: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) });
  // hero served width at this viewport
  await page.goto(base + '/en', { waitUntil: 'networkidle' });
  const hero = await page.locator('[data-testid="hero-frame"] img').evaluate((i) => ({ src: i.currentSrc, css: Math.round(i.getBoundingClientRect().width) }));
  log.push({ page: 'hero', width: w, cssWidth: hero.css, servedW: Number(/w=(\d+)/.exec(hero.src)?.[1]) });
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(out, '../visual-qa-log.json'), JSON.stringify(log, null, 2));
console.log(log.filter((l) => l.horizontalOverflowPx > 0 || l.page === 'hero'));
