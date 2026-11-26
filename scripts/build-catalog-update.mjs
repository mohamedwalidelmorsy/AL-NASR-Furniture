/**
 * Catalog update 2026-11-26: adds the new Drive designs, extra images for existing products, and re-points
 * existing image sources at the re-uploaded Drive files. Idempotent (re-running gives the same output).
 *
 *   node scripts/build-catalog-update.mjs      # needs the originals in .catalog-cache/originals (git-ignored)
 *
 * Inputs : data/catalog-import/drive-inventory-2026-11-26.json  (full Drive listing, SHA-256 of downloaded files, re-upload map)
 *          data/catalog-import/catalog-update-2026-11-26.json   (hand-reviewed groups: product -> ordered images)
 * Outputs: public/images/catalog/<category>/<slug>/NN-<role>-{640,1400}.webp  (WebP q82, never upscaled; same as the expansion)
 *          src/data/catalog/products.expansion.json                (new records appended / replaced by id; extra images; source remaps)
 *          src/data/catalog/products.json                          (source remaps only)
 *          data/catalog-import/asset-manifest-2026-11-26.json
 * Originals are never modified. An original whose SHA-256 differs from the inventory is refused.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const write = (p, v) => fs.writeFileSync(path.join(root, p), JSON.stringify(v, null, 2) + '\n');
const inv = read('data/catalog-import/drive-inventory-2026-11-26.json');
const upd = read('data/catalog-import/catalog-update-2026-11-26.json');
const byId = new Map(inv.files.map((f) => [f.driveFileId, f]));
const excluded = new Set(upd.excluded.map((e) => e.driveFileId));

const CODE = { bedrooms: 'BR', 'kids-bedrooms': 'KB', 'corner-sofas': 'CO', 'living-rooms': 'LR' };
const UNIT_KIND = { bedrooms: 'bedroom-set', 'kids-bedrooms': 'kids-set', 'corner-sofas': 'corner-sofa', 'living-rooms': 'sofa' };
const COARSE = { 'bedroom-set': 'set', 'kids-set': 'set', 'sofa-set': 'set', 'corner-sofa': 'piece', sofa: 'piece' };
const SUFFIX = {
  en: ' Illustrative design — final pieces, materials, finishes and dimensions are confirmed during quotation.',
  ar: ' تصميم توضيحي — تُؤكَّد القطع والخامات والتشطيبات والمقاسات النهائية عند إعداد عرض السعر.',
};

function original(id) {
  const f = byId.get(id);
  if (!f) throw new Error(`Drive file ${id} is not in the 2026-11-26 inventory`);
  if (excluded.has(id)) throw new Error(`Excluded Drive file refused: ${id}`);
  if (f.status !== 'downloaded' || !f.localOriginal) throw new Error(`Drive file ${id} was not downloaded`);
  const buf = fs.readFileSync(path.join(root, f.localOriginal));
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  if (sha !== f.sha256) throw new Error(`SHA-256 mismatch for ${id} (${f.originalFilename})`);
  return { f, buf };
}

async function render(buf, base) {
  const meta = await sharp(buf).metadata();
  const make = async (w, suffix) => {
    const out = `${base}-${suffix}.webp`;
    fs.mkdirSync(path.dirname(path.join(root, 'public', out)), { recursive: true });
    const info = await sharp(buf).resize({ width: Math.min(w, meta.width) }).webp({ quality: 82 }).toFile(path.join(root, 'public', out));
    return { path: '/' + out, width: info.width, height: info.height };
  };
  const card = await make(640, '640');
  const full = await make(1400, '1400');
  return { card: card.path, full: full.path, width: full.width, height: full.height };
}

const source = (f, locale) => ({ driveFileId: f.driveFileId, locale, drivePath: f.drivePath, originalFilename: f.originalFilename, sha256: f.sha256, status: 'valid' });
const manifest = [];

const legacy = read('src/data/catalog/products.json');
const expansion = read('src/data/catalog/products.expansion.json');

// 1. existing image sources: follow the 2026-11-19 re-upload (new Drive ids, same files); flag sources that left Drive
const remap = { remapped: 0, orphaned: 0, unchanged: 0 };
for (const p of [...legacy, ...expansion]) for (const loc of ['en', 'ar']) for (const im of p.gallery[loc]) {
  const s = im.source;
  if (s.status === 'orphaned' || s.status === 'deleted-by-decision') { remap.unchanged++; continue; }
  if (byId.has(s.driveFileId)) { s.drivePath = byId.get(s.driveFileId).drivePath; remap.unchanged++; continue; }
  const next = inv.supersededDriveFileIds[s.driveFileId];
  if (next) {
    const f = byId.get(next);
    if (s.previousDriveFileId) s.earlierDriveFileIds = [...(s.earlierDriveFileIds ?? []), s.previousDriveFileId];
    Object.assign(s, { previousDriveFileId: s.driveFileId, driveFileId: next, drivePath: f.drivePath, status: 'remapped', note: 'Re-uploaded to Drive on 2026-11-19 with a new id; matched by filename and byte size (2026-11-26 inventory).' });
    remap.remapped++;
  } else {
    Object.assign(s, { status: 'orphaned', note: 'Source image is no longer in Drive (2026-11-26 listing); the published web image is kept.' });
    remap.orphaned++;
  }
}

// 2. new products (appended after the existing ones; replaced by id when re-run)
const newIds = new Set(upd.products.map((g) => g.id));
const kept = expansion.filter((p) => !newIds.has(p.id));
let sort = Math.max(...[...legacy, ...kept].map((p) => p.sort)) + 1;
const added = [];
for (const g of upd.products) {
  const unitKind = g.unitKind ?? UNIT_KIND[g.category];
  const gallery = { en: [], ar: [] };
  fs.rmSync(path.join(root, 'public/images/catalog', g.category, g.slug), { recursive: true, force: true }); // no stale renditions when a gallery shrinks
  for (const [i, sel] of g.images.entries()) {
    const { f, buf } = original(sel.id);
    const role = i === 0 ? 'cover' : 'detail';
    const rend = await render(buf, `images/catalog/${g.category}/${g.slug}/${String(i + 1).padStart(2, '0')}-${role}`);
    for (const loc of ['en', 'ar']) gallery[loc].push({ ...rend, role, alt: sel.label, source: source(f, loc), ...(g.poster ? { hasEmbeddedText: true } : {}) });
    manifest.push({ driveFileId: f.driveFileId, drivePath: f.drivePath, originalFilename: f.originalFilename, sha256: f.sha256, originalDimensions: [f.width, f.height], local: rend, productId: g.id, role });
  }
  added.push({
    id: g.id, slug: g.slug, code: `PV-${CODE[g.category]}-${g.id.split('-').pop()}`, categoryId: g.category, style: null, unit: COARSE[unitKind], sort: sort++,
    illustrative: true, verification: 'concept-render', status: 'active',
    name: g.name, description: { en: g.desc.en + SUFFIX.en, ar: g.desc.ar + SUFFIX.ar }, pieces: [], materials: null, gallery, unitKind,
    ...(g.review ? { review: g.review } : {}),
  });
}

// 3. extra images for existing products (skipped when already present)
const all = [...legacy, ...kept];
for (const x of upd.extraImages) {
  const p = all.find((q) => q.id === x.productId);
  if (!p) throw new Error(`unknown product ${x.productId}`);
  if (x.review) p.review = { ...(p.review ?? {}), extraImage: { driveFileId: x.driveFileId, ...x.review } };
  const present = p.gallery.en.find((im) => im.source.driveFileId === x.driveFileId);
  if (present) {
    const f = byId.get(x.driveFileId);
    manifest.push({ driveFileId: f.driveFileId, drivePath: f.drivePath, originalFilename: f.originalFilename, sha256: f.sha256, originalDimensions: [f.width, f.height], local: { card: present.card, full: present.full, width: present.width, height: present.height }, productId: p.id, role: 'detail' });
    continue;
  }
  const { f, buf } = original(x.driveFileId);
  const n = String(p.gallery.en.length + 1).padStart(2, '0');
  const rend = await render(buf, `images/catalog/${p.categoryId}/${p.slug}/${n}-detail`);
  for (const loc of ['en', 'ar']) p.gallery[loc].push({ ...rend, role: 'detail', alt: x.label, source: source(f, loc) });
  if (x.clearsSourceGap) delete p.sourceGap;
  manifest.push({ driveFileId: f.driveFileId, drivePath: f.drivePath, originalFilename: f.originalFilename, sha256: f.sha256, originalDimensions: [f.width, f.height], local: rend, productId: p.id, role: 'detail' });
}

write('src/data/catalog/products.json', legacy);
write('src/data/catalog/products.expansion.json', [...kept, ...added]);
write('data/catalog-import/asset-manifest-2026-11-26.json', { builtFrom: 'drive-inventory-2026-11-26.json + catalog-update-2026-11-26.json', newProducts: added.length, images: manifest.length, excluded: upd.excluded, manifest });
const perCat = added.reduce((a, p) => ({ ...a, [p.categoryId]: (a[p.categoryId] ?? 0) + 1 }), {});
console.log(`sources ${JSON.stringify(remap)} · new products ${added.length} ${JSON.stringify(perCat)} · images rendered ${manifest.length}`);
