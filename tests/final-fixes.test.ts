import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { activeProducts, allProducts, archivedProducts, categories, mergeMap, productBySlug, productsInCategory, unitKindOf } from '@/lib/catalog';
import { migrateMergedItems } from '@/features/inquiry/storage';
import { countMessage } from '@/lib/plural';
import { unitLabel } from '@/lib/unit-label';
import { allMessages } from '@/lib/messages';
import { catalogRedirects } from '../next.config';

const KEEP = { 'pv-br-12': 'pv-br-01', 'pv-br-08': 'pv-br-02', 'pv-br-09': 'pv-br-03', 'pv-br-07': 'pv-br-04' };

describe('approved bedroom merges', () => {
  it('maps the four duplicates onto the legacy ids and keeps those ids active', () => {
    expect(mergeMap()).toEqual(KEEP);
    for (const keep of Object.values(KEEP)) expect(activeProducts().some((p) => p.id === keep)).toBe(true);
    expect(productsInCategory('bedrooms')).toHaveLength(15);
  });
  it('duplicates are not routable or active', () => {
    for (const dup of Object.keys(KEEP)) {
      const p = allProducts().find((x) => x.id === dup)!;
      expect(p.status).toBe('merged');
      expect(productBySlug('bedrooms', p.slug)).toBeUndefined();
    }
  });
  it('counts are computed from data and add up', () => {
    const active = activeProducts().length;
    expect(active + archivedProducts().length + Object.keys(mergeMap()).length).toBe(allProducts().length);
    expect(active).toBe(76);
    expect(archivedProducts().map((p) => p.id).sort()).toEqual(['pv-kb-01', 'pv-kb-02', 'pv-kb-03']);
  });
});

describe('Plush Curve and Sculpted White stay independent', () => {
  it('both active, neither merged', () => {
    for (const id of ['pv-lr-07', 'pv-lr-10']) {
      const p = allProducts().find((x) => x.id === id)!;
      expect(p.status ?? 'active').toBe('active');
      expect(p.mergedInto).toBeUndefined();
    }
  });
});

describe('308 redirects generated from data', () => {
  const r = catalogRedirects(allProducts() as never);
  it('are permanent, locale-preserving and loop-free', () => {
    expect(r.length).toBeGreaterThanOrEqual(8);
    for (const x of r) {
      expect(x.permanent).toBe(true);
      expect(x.source).toContain(':locale(en|ar)');
      expect(x.destination).toMatch(/^\/:locale\/collections\//);
      expect(x.source.replace(':locale(en|ar)', ':locale')).not.toBe(x.destination);
    }
    const dests = new Set(r.map((x) => x.destination));
    for (const slug of ['soft-arc-corner-sofa', 'teal-sectional-sofa', 'luxury-corner-sofa']) expect(dests.has(`/:locale/collections/corner-sofas/${slug}`)).toBe(true);
  });
  it('no redirect source is also a live route', () => {
    for (const x of r) {
      const m = /collections\/([^/]+)\/([^/]+)$/.exec(x.source)!;
      const cat = categories.find((c) => c.slug === m[1])!;
      expect(productBySlug(cat.slug, m[2]) && cat.id, x.source).toBeFalsy();
    }
  });
});

describe('Inquiry canonicalisation', () => {
  it('moves a duplicate-id line onto the continuing id, keeping qty + note and recording the origin', () => {
    expect(migrateMergedItems([{ id: 'pv-br-12', qty: 3, note: 'silver' }], KEEP)).toEqual([{ id: 'pv-br-01', qty: 3, note: 'silver', from: ['pv-br-12'] }]);
  });
  it('never double-counts when both ids are saved, in either order', () => {
    const out = migrateMergedItems([{ id: 'pv-br-01', qty: 2, note: 'a' }, { id: 'pv-br-12', qty: 3, note: 'b' }], KEEP);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: 'pv-br-01', qty: 5, note: 'a / b', from: ['pv-br-12'] });
    const rev = migrateMergedItems([{ id: 'pv-br-12', qty: 3, note: 'b' }, { id: 'pv-br-01', qty: 2, note: 'a' }], KEEP);
    expect(rev).toHaveLength(1);
    expect(rev[0].qty).toBe(5);
  });
  it('leaves unrelated lines untouched and is idempotent', () => {
    const items = [{ id: 'pv-kb-04', qty: 1, note: '' }];
    expect(migrateMergedItems(items, KEEP)).toBe(items);
    const once = migrateMergedItems([{ id: 'pv-br-08', qty: 4, note: '' }], KEEP);
    expect(migrateMergedItems(once, KEEP)).toEqual(once);
  });
});

describe('category structure', () => {
  it('moved products appear in exactly one category; no duplicate records', () => {
    for (const id of ['pv-lr-01', 'pv-lr-02', 'pv-lr-03', 'pv-co-03']) {
      expect(categories.filter((c) => productsInCategory(c.slug).some((p) => p.id === id))).toHaveLength(1);
    }
    const ids = allProducts().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('listing counts equal active products plus cross-listings', () => {
    const total = categories.reduce((n, c) => n + productsInCategory(c.slug).length, 0);
    expect(total).toBe(activeProducts().length + activeProducts().filter((p) => p.alsoIn?.length).length);
  });
  it('sofas and chaise use sofa units, not "set"', () => {
    expect(unitKindOf(allProducts().find((p) => p.id === 'pv-lr-09')!)).toBe('chaise');
    for (const id of ['pv-lr-01', 'pv-lr-02', 'pv-lr-03']) expect(unitKindOf(allProducts().find((p) => p.id === id)!)).toBe('corner-sofa');
  });
});

describe('Arabic counts and units', () => {
  const f = { one: 'مجموعة واحدة', two: 'مجموعتان', few: '{n} مجموعات', many: '{n} مجموعة' };
  it('uses the right Arabic number form', () => {
    expect(countMessage('ar', 1, f)).toBe('مجموعة واحدة');
    expect(countMessage('ar', 2, f)).toBe('مجموعتان');
    expect(countMessage('ar', 8, f)).toBe('8 مجموعات');
    expect(countMessage('ar', 11, f)).toBe('11 مجموعة');
    expect(countMessage('ar', 14, f)).toBe('14 مجموعة');
    expect(countMessage('en', 3, { one: '1 collection', few: '{n} collections' })).toBe('3 collections');
  });
  it('unit labels are context-sensitive', () => {
    expect(unitLabel(allMessages.en.detail, 'corner-sofa', 1)).toMatch(/corner sofa$/i);
    expect(unitLabel(allMessages.en.detail, 'corner-sofa', 2)).toMatch(/corner sofas$/i);
    expect(unitLabel(allMessages.en.detail, 'chaise', 3)).not.toMatch(/set/i);
    expect(unitLabel(allMessages.ar.detail, 'bedroom-set', 2)).toMatch(/غرف نوم/);
  });
  it('active product descriptions are unique', () => {
    const d = activeProducts().map((p) => p.description.en);
    expect(new Set(d).size).toBe(d.length);
  });
});

describe('hero', () => {
  it('declares a tablet-aware sizes attribute', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../src/components/pages/Home.tsx'), 'utf8');
    expect(src).toContain('(min-width: 1200px) 560px, (min-width: 1024px) 48vw, 100vw');
  });
});
