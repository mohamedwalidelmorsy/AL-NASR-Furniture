import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import en from '../messages/en.json';
import ar from '../messages/ar.json';
import { allProducts, categories, categoryById, galleryFor, productBySlug, productsInCategory } from '@/lib/catalog';

const keysOf = (o: unknown, prefix = ''): string[] =>
  Array.isArray(o) ? o.flatMap((v, i) => keysOf(v, `${prefix}[${i}]`)) :
  o && typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => keysOf(v, prefix ? `${prefix}.${k}` : k)) : [prefix];

describe('translations', () => {
  it('Arabic and English expose identical key trees (except `term`, the English trade term shown only in Arabic)', () => {
    const strip = (k: string[]) => k.filter((x) => !/\.term$/.test(x)).sort();
    expect(strip(keysOf(ar))).toEqual(strip(keysOf(en)));
  });
  it('has no empty visible strings except intentionally blank optional fields', () => {
    const empties = (o: unknown, p = ''): string[] =>
      typeof o === 'string' ? (o.trim() === '' && !/(\.term|\.alt|body)$/.test(p) ? [p] : []) :
      Array.isArray(o) ? o.flatMap((v, i) => empties(v, `${p}[${i}]`)) :
      o && typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => empties(v, p ? `${p}.${k}` : k)) : [];
    expect(empties(en)).toEqual([]);
    expect(empties(ar)).toEqual([]);
  });
  it('declares the right direction per locale', () => {
    expect(en.dir).toBe('ltr');
    expect(ar.dir).toBe('rtl');
  });
});

describe('catalog', () => {
  const pub = path.resolve(__dirname, '../public');
  it('has the seven approved categories in order (Dressing Rooms is an independent top-level category)', () => {
    expect(categories.map((c) => c.slug)).toEqual(['bedrooms', 'dressing-rooms', 'kids-bedrooms', 'corner-sofas', 'living-rooms', 'china-cabinets', 'dining-rooms']);
  });
  it('has unique ids, slugs (per category) and codes', () => {
    const p = allProducts();
    expect(new Set(p.map((x) => x.id)).size).toBe(p.length);
    expect(new Set(p.map((x) => x.code)).size).toBe(p.length);
    expect(new Set(p.map((x) => `${x.categoryId}/${x.slug}`)).size).toBe(p.length);
  });
  it('every product belongs to a category and has localized names', () => {
    for (const p of allProducts()) {
      expect(categoryById(p.categoryId), p.id).toBeTruthy();
      expect(p.name.en && p.name.ar, p.id).toBeTruthy();
    }
  });
  it('every category has products; lookups resolve', () => {
    for (const c of categories) expect(productsInCategory(c.id).length).toBeGreaterThan(0);
    const first = allProducts()[0];
    expect(productBySlug(categoryById(first.categoryId)!.slug, first.slug)?.id).toBe(first.id);
  });
  it('every product has Arabic and English image variants that exist on disk (no broken images)', () => {
    for (const p of allProducts()) {
      for (const loc of ['en', 'ar'] as const) {
        const g = galleryFor(p, loc);
        expect(g.length, `${p.id}/${loc}`).toBeGreaterThan(0);
        for (const im of g) {
          expect(fs.existsSync(path.join(pub, im.card)), im.card).toBe(true);
          expect(fs.existsSync(path.join(pub, im.full)), im.full).toBe(true);
          expect(im.source.driveFileId, `${p.id}/${loc} source traceability`).toBeTruthy();
          expect(im.width).toBeGreaterThan(0);
        }
      }
    }
  });
  it('never invents specifications', () => {
    for (const p of allProducts()) {
      if (p.illustrative) { expect(p.pieces).toEqual([]); expect(p.materials).toBeNull(); }
    }
  });
});

describe('catalog import tooling', () => {
  it('validates PNG originals against the inventory (signature, size, dimensions)', async () => {
    const { verifyOriginal, isPng, pngSize, renditionPath } = await import('../scripts/lib/catalog-import');
    const png = Buffer.alloc(64);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png);
    png.writeUInt32BE(1024, 16); png.writeUInt32BE(1536, 20);
    expect(isPng(png)).toBe(true);
    expect(pngSize(png)).toEqual({ width: 1024, height: 1536 });
    const rec = { imageId: 'img-x', driveFileId: 'id', originalFilename: 'a.png', drivePath: 'p', sourceCategory: 'bedroom-sets', language: 'en' as const, bytes: 64, mimeType: 'image/png' };
    expect(verifyOriginal(rec, png).ok).toBe(true);
    expect(verifyOriginal({ ...rec, bytes: 99 }, png).problems[0]).toMatch(/size/);
    expect(verifyOriginal(rec, Buffer.alloc(64)).problems[0]).toMatch(/PNG/);
    expect(renditionPath(rec, 640)).toBe('public/assets/furniture/bedroom-sets/en/img-x-640.webp');
  });
  it('every image source references the active Drive inventory, or is explicitly flagged (remapped / orphaned / deleted-by-decision)', async () => {
    const inv = (await import('../data/catalog-import/drive-inventory-2026-11-09.json')).default as { activeImages: number; files: { driveFileId: string }[]; deletedExcludedIds: string[] };
    expect(inv.activeImages).toBe(inv.files.length);
    const ids = new Set(inv.files.map((f) => f.driveFileId));
    for (const p of allProducts()) for (const loc of ['en', 'ar'] as const) for (const im of p.gallery[loc]) {
      const st = im.source.status;
      expect(st, `${p.id}/${loc} needs a source status`).toBeTruthy();
      if (st === 'valid' || st === 'remapped') expect(ids.has(im.source.driveFileId), `${p.id}/${loc}`).toBe(true);
      else expect(['orphaned', 'deleted-by-decision']).toContain(st);
    }
  });
});
