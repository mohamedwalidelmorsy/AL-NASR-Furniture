import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { activeProducts, allProducts, productsInCategory } from '@/lib/catalog';
import { PAYMENT_TERMS } from '@/features/rfq/schema';
import en from '../messages/en.json';
import ar from '../messages/ar.json';
import update from '../data/catalog-import/catalog-update-2026-11-26.json';
import inventory from '../data/catalog-import/drive-inventory-2026-11-26.json';

describe('catalog update 2026-11-26', () => {
  const newIds = update.products.map((p) => p.id);
  it('publishes every new design in its category, with both locales', () => {
    expect(newIds).toHaveLength(28);
    for (const g of update.products) {
      const p = activeProducts().find((x) => x.id === g.id);
      expect(p, g.id).toBeDefined();
      expect(productsInCategory(g.category).map((x) => x.id)).toContain(g.id);
      expect(p!.gallery.en).toHaveLength(g.images.length);
      expect(p!.gallery.ar).toHaveLength(g.images.length);
      expect(p!.name.en && p!.name.ar).toBeTruthy();
    }
  });
  it('never publishes an excluded or duplicate Drive image', () => {
    const excluded = new Set(update.excluded.map((e) => e.driveFileId));
    const seen = new Map<string, string>();
    for (const p of allProducts()) for (const im of p.gallery.en) {
      expect(excluded.has(im.source.driveFileId), `${p.id}`).toBe(false);
      if (!newIds.includes(p.id)) continue;
      expect(seen.get(im.source.sha256 ?? ''), `${p.id} duplicates ${seen.get(im.source.sha256 ?? '')}`).toBeUndefined();
      seen.set(im.source.sha256 ?? '', p.id);
    }
  });
  it('the inventory reconciles 236 Drive images and records the byte-identical duplicate', () => {
    expect(inventory.activeImages).toBe(236);
    expect(inventory.files).toHaveLength(236);
    expect(inventory.byteIdenticalDuplicateGroups).toHaveLength(1);
  });
  it('rendered images exist and are never upscaled', () => {
    const files = new Map(inventory.files.map((f) => [f.driveFileId, f]));
    for (const id of newIds) {
      const p = allProducts().find((x) => x.id === id)!;
      for (const im of p.gallery.en) {
        expect(fs.existsSync(path.join('public', im.full)), im.full).toBe(true);
        expect(fs.existsSync(path.join('public', im.card)), im.card).toBe(true);
        expect(im.width).toBeLessThanOrEqual(files.get(im.source.driveFileId)!.width!);
      }
    }
  });
});

describe('payment terms (2026-11-26): only T/T or L/C', () => {
  it('the guide lists exactly T/T and L/C, with no extra explanation', () => {
    for (const m of [en, ar]) {
      expect(m.ship.payments.map((p) => p.title)).toEqual(['T/T', 'L/C']);
      expect(m.ship.payments.every((p) => !p.body && !p.term)).toBe(true);
      expect(m.ship.payIntro).toBe('');
      expect(m.ship.payNote).toBe('');
      expect(m.form.payTerms.map((p) => p.l)).toEqual(['T/T', 'L/C']);
    }
    expect([...PAYMENT_TERMS]).toEqual(['tt', 'lc']);
  });
  it('no deposit percentages or retired payment wording remain in the site copy', () => {
    const all = JSON.stringify(en) + JSON.stringify(ar);
    for (const s of ['30%', '70%', 'advance payment', 'letter of credit', 'three payment', 'دفعة مقدمة', 'اعتماد مستندي', 'ثلاث طرق للدفع', 'ثلاثة خيارات للدفع']) expect(all.toLowerCase()).not.toContain(s.toLowerCase());
  });
});
