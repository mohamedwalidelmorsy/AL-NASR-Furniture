import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { activeProducts, allProducts, categories, categoryById, dimensionProfileOf, galleryFor, productBySlug, productsInCategory, standardDimensions } from '@/lib/catalog';
import { buildDimensions } from '@/lib/dimensions';
import { allMessages } from '@/lib/messages';
import inventory from '../data/catalog-import/drive-inventory-2026-11-26.json';
import legacy from '../src/data/catalog/products.json';

const pub = path.resolve(__dirname, '../public');
const exists = (p: string) => fs.existsSync(path.join(pub, p));
const LEGACY_IDS = (legacy as { id: string }[]).map((p) => p.id);

describe('catalog integrity (catalog expansion)', () => {
  it('ids, slugs and codes are unique across all catalog files', () => {
    const all = allProducts();
    expect(new Set(all.map((p) => p.id)).size).toBe(all.length);
    expect(new Set(all.map((p) => p.code)).size).toBe(all.length);
    expect(new Set(all.map((p) => `${p.categoryId}/${p.slug}`)).size).toBe(all.length);
  });

  it('never removes or renames a legacy product id/slug/url', () => {
    expect(LEGACY_IDS).toHaveLength(18);
    for (const l of legacy as { id: string; slug: string; categoryId: string }[]) {
      const p = allProducts().find((x) => x.id === l.id);
      expect(p, l.id).toBeTruthy();
      expect(p!.slug).toBe(l.slug);
      expect(p!.categoryId).toBe(l.categoryId);
      expect(productBySlug(categoryById(l.categoryId)!.slug, l.slug)?.id).toBe(l.id);
    }
  });

  it('classifies every legacy product (A/B/C) and keeps uncertain (C) products active and unchanged in identity', () => {
    for (const p of allProducts().filter((x) => LEGACY_IDS.includes(x.id))) {
      expect(['A', 'B', 'C'], p.id).toContain(p.migration?.class);
      if (p.migration!.class === 'C') {
        expect(p.status ?? 'active', `${p.id} must not be silently archived`).toBe('active');
        expect(p.migration!.equivalence?.status).toBe('pending');
      }
    }
    // 11 originally continuing + the 4 owner-approved bedroom merges (equivalence confirmed)
    expect(allProducts().filter((p) => p.migration?.class === 'B')).toHaveLength(15);
  });

  it('every published product has a cover and gallery images that exist on disk, in both locales', () => {
    for (const p of activeProducts()) {
      for (const loc of ['en', 'ar'] as const) {
        const g = galleryFor(p, loc);
        expect(g.length, `${p.id}/${loc}`).toBeGreaterThan(0);
        for (const im of g) {
          expect(exists(im.card), im.card).toBe(true);
          expect(exists(im.full), im.full).toBe(true);
        }
      }
    }
  });

  it('gallery images of new products live in that product’s own folder (no image is shared across unrelated designs)', () => {
    const seen = new Map<string, string>();
    for (const p of allProducts().filter((x) => !LEGACY_IDS.includes(x.id))) {
      for (const loc of ['en', 'ar'] as const) for (const im of p.gallery[loc]) {
        expect(im.full.includes(`/${p.slug}/`), `${p.id} ${im.full}`).toBe(true);
        const prev = seen.get(im.full);
        expect(prev === undefined || prev === p.id, `${im.full} used by ${prev} and ${p.id}`).toBe(true);
        seen.set(im.full, p.id);
      }
    }
  });

  it('the 20 intentionally deleted Drive images are excluded everywhere', () => {
    const deleted = new Set((inventory as { deletedExcludedIds: string[] }).deletedExcludedIds);
    expect(deleted.size).toBe(20);
    const active = new Set((inventory as { files: { driveFileId: string }[] }).files.map((f) => f.driveFileId));
    for (const id of deleted) expect(active.has(id)).toBe(false);
    for (const p of allProducts()) for (const loc of ['en', 'ar'] as const) for (const im of p.gallery[loc]) {
      expect(deleted.has(im.source.driveFileId), `${p.id}/${loc}`).toBe(false);
      if (p.id.startsWith('pv-kb-0') && LEGACY_IDS.includes(p.id)) expect(im.source.status).toBe('deleted-by-decision');
    }
  });

  it('all active inventory images that were downloaded have verified hashes', () => {
    const f = (inventory as { files: { status: string; sha256?: string; verified?: boolean }[] }).files;
    for (const x of f.filter((y) => y.status === 'downloaded')) { expect(x.sha256).toMatch(/^[0-9a-f]{64}$/); expect(x.verified).toBe(true); }
  });

  it('Dressing Rooms is an independent category with published designs; its pages exist', () => {
    expect(categories.map((c) => c.slug)).toContain('dressing-rooms');
    expect(productsInCategory('dressing-rooms').length).toBeGreaterThanOrEqual(2);
  });

  it('owner-approved category moves: pv-lr-01/02/03 are Corner Sofas only, pv-co-03 is a Living Room only', () => {
    for (const id of ['pv-lr-01', 'pv-lr-02', 'pv-lr-03']) {
      expect(productsInCategory('corner-sofas').map((p) => p.id)).toContain(id);
      expect(productsInCategory('living-rooms').map((p) => p.id)).not.toContain(id);
    }
    expect(productsInCategory('living-rooms').map((p) => p.id)).toContain('pv-co-03');
    expect(productsInCategory('corner-sofas').map((p) => p.id)).not.toContain('pv-co-03');
    expect(productBySlug('corner-sofas', 'soft-arc-corner-sofa')?.id).toBe('pv-lr-01');
    expect(productBySlug('living-rooms', 'soft-arc-corner-sofa')).toBeUndefined();
  });
});

describe('standard dimensions come from approved reference data only', () => {
  const t = allMessages.en;
  it('bedroom: wardrobe is 250 wide × 230 high and depth is never rendered', () => {
    expect(standardDimensions.profiles['bedroom-standard']).toMatchObject({ wardrobe: { width: 250, height: 230, depth: null }, bed: { size: 160 }, nightstand: { count: 2, size: 50 }, dressingTable: { min: 120, max: 150 } });
    const v = buildDimensions('bedroom-standard', t);
    const text = JSON.stringify(v);
    expect(v.rows.find((r) => r.label === 'Wardrobe')?.value).toBe('250 cm wide × 230 cm high');
    expect(v.rows.map((r) => `${r.label} ${r.value}`).join(' ')).not.toMatch(/depth|deep|× ?D\b/i);
    expect(text).not.toMatch(/"depth"/);
    // every number that is displayed is one of the approved numbers
    const allowed = new Set(['250', '230', '160', '2', '50', '120', '150']);
    for (const r of v.rows) for (const n of r.value.match(/\d+/g) ?? []) expect(allowed.has(n), `${r.label}: ${n}`).toBe(true);
  });
  it('kids: two 120 cm beds, 150 cm wardrobe, one nightstand, dressing table on request', () => {
    const v = buildDimensions('kids-standard', t);
    expect(v.rows.map((r) => r.value)).toEqual(['2 beds, 120 cm each', '150 cm', '1 nightstand', 'Available on request']);
  });
  it('Arabic uses the same numbers; dressing rooms have no numbers at all', () => {
    const ar = buildDimensions('bedroom-standard', allMessages.ar);
    expect(ar.rows[0].value).toBe('عرض 250 سم × ارتفاع 230 سم');
    const mtm = buildDimensions('made-to-measure', t);
    expect(mtm.rows).toEqual([]);
    expect(mtm.customization).not.toMatch(/\d/);
  });
  it('bedroom and kids categories show their profile; others do not invent one', () => {
    expect(dimensionProfileOf(allProducts().find((p) => p.id === 'pv-br-05')!)).toBe('bedroom-standard');
    expect(dimensionProfileOf(allProducts().find((p) => p.id === 'pv-kb-04')!)).toBe('kids-standard');
    expect(dimensionProfileOf(allProducts().find((p) => p.id === 'pv-dg-03')!)).toBe('made-to-measure');
    expect(dimensionProfileOf(allProducts().find((p) => p.id === 'pv-co-01')!)).toBeNull();
    expect(standardDimensions.customizable).toBe(true);
  });
});
