/**
 * Builds the web renditions + catalog records for the catalog expansion (2026-11-09).
 *
 *   node scripts/build-catalog-expansion.mjs          # needs the originals in .catalog-cache/originals (git-ignored)
 *
 * Inputs : data/catalog-import/drive-inventory-2026-11-09.json   (active Drive images, SHA-256, local originals)
 *          data/catalog-import/catalog-design-groups.json         (hand-reviewed design groups: product -> ordered images)
 * Outputs: public/images/catalog/<category>/<slug>/NN-<role>-{640,1400}.webp   (never upscaled, never stretched; the legacy read-only public/assets/furniture tree is not touched)
 *          src/data/catalog/products.expansion.json              (new product records)
 *          data/catalog-import/asset-manifest.json               (Drive source -> local asset -> product -> role)
 * Originals are never modified. Deleted Drive images (deleted-sources list in the inventory) are refused.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const inv = JSON.parse(fs.readFileSync(path.join(root, 'data/catalog-import/drive-inventory-2026-11-09.json'), 'utf8'));
const groups = JSON.parse(fs.readFileSync(path.join(root, 'data/catalog-import/catalog-design-groups.json'), 'utf8'));
const deleted = new Set(inv.deletedExcludedIds);
const DIR = { bedrooms: 'bedrooms', 'kids-bedrooms': 'kids-bedrooms', 'dressing-rooms': 'dressing-rooms', 'corner-sofas': 'corner-sofas', 'living-rooms': 'living-rooms', 'china-cabinets': 'china-cabinets', 'dining-rooms': 'dining-rooms' };
const CODE = { bedrooms: 'BR', 'kids-bedrooms': 'KB', 'dressing-rooms': 'DG', 'corner-sofas': 'CO', 'living-rooms': 'LR', 'china-cabinets': 'CC' };
const DESC = {
  en: 'Illustrative design from the AL NASR FURNITURE catalog. The image is AI-generated and shows a design concept; final pieces, materials, finishes and dimensions are confirmed during quotation.',
  ar: 'تصميم توضيحي من كتالوج النصر للأثاث. الصورة مُنشأة بالذكاء الاصطناعي وتعرض فكرة تصميمية، ويتم تأكيد القطع والخامات والتشطيبات والمقاسات النهائية أثناء إعداد عرض السعر.',
};

const resolve = (sel) => {
  const hits = inv.files.filter((f) => f.drivePath === sel.folder && f.originalFilename.includes(sel.match) && f.status === 'downloaded');
  if (hits.length !== 1) throw new Error(`Selector ${JSON.stringify(sel)} matched ${hits.length} files`);
  if (deleted.has(hits[0].driveFileId)) throw new Error(`Deleted Drive image refused: ${hits[0].driveFileId}`);
  return hits[0];
};

/** Proven non-content edge slivers only: an outer line (≤ 6 px) that is almost entirely white while the content 4 px further in is not. Display-only; originals untouched. */
async function edgeTrim(buf) {
  const { data, info } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const frac = (get, n) => { let c = 0; for (let i = 0; i < n; i++) if (get(i) > 238) c++; return c / n; };
  const row = (y) => frac((x) => data[y * W + x], W);
  const col = (x) => frac((y) => data[y * W + x], H);
  const blank = (line, inner) => line >= 0.9 && inner < 0.6;
  const t = { left: 0, right: 0, top: 0, bottom: 0 };
  while (t.top < 6 && blank(row(t.top), row(Math.min(H - 1, t.top + 4)))) t.top++;
  while (t.bottom < 6 && blank(row(H - 1 - t.bottom), row(Math.max(0, H - 1 - t.bottom - 4)))) t.bottom++;
  while (t.left < 6 && blank(col(t.left), col(Math.min(W - 1, t.left + 4)))) t.left++;
  while (t.right < 6 && blank(col(W - 1 - t.right), col(Math.max(0, W - 1 - t.right - 4)))) t.right++;
  return t;
}
const trims = [];

async function render(file, outBase, cropBottom) {
  const src = path.join(root, file.localOriginal);
  const buf = fs.readFileSync(src);
  let img = sharp(buf);
  const meta = await img.metadata();
  const t = meta.format === 'jpeg' ? await edgeTrim(buf) : { left: 0, right: 0, top: 0, bottom: 0 };
  if (t.left || t.right || t.top || t.bottom) trims.push({ file: file.originalFilename, drivePath: file.drivePath, ...t });
  const left = t.left, top = t.top;
  const width = meta.width - t.left - t.right;
  const height = (cropBottom ? meta.height - cropBottom : meta.height - t.bottom) - t.top; // display-only crops; the original file is untouched
  const make = async (w, suffix) => {
    const target = Math.min(w, width); // never upscale
    const out = `${outBase}-${suffix}.webp`;
    fs.mkdirSync(path.dirname(path.join(root, 'public', out)), { recursive: true });
    const info = await sharp(buf).extract({ left, top, width, height }).resize({ width: target }).webp({ quality: 82 }).toFile(path.join(root, 'public', out));
    return { path: '/' + out, width: info.width, height: info.height };
  };
  const card = await make(640, '640');
  const full = await make(1400, '1400');
  return { card: card.path, full: full.path, width: full.width, height: full.height };
}

const manifest = [];
const products = [];
const perCat = {};
for (const g of groups.products) {
  perCat[g.category] = (perCat[g.category] ?? 0) + 1;
  const num = String(Number(g.id.split('-').pop())).padStart(2, '0');
  const gallery = { en: [], ar: [] };
  let n = 0;
  const cache = new Map();
  for (const sel of g.images) {
    n += 1;
    const file = resolve(sel);
    const role = n === 1 ? 'cover' : 'detail';
    const base = `images/catalog/${DIR[g.category]}/${g.slug}/${String(n).padStart(2, '0')}-${role}`;
    const key = `${file.driveFileId}|${sel.cropBottom ?? 0}`;
    const rend = cache.get(key) ?? (await render(file, base, sel.cropBottom));
    cache.set(key, rend);
    const entry = {
      ...rend,
      role,
      alt: sel.label,
      source: { driveFileId: file.driveFileId, locale: sel.locale ?? 'en', drivePath: file.drivePath, originalFilename: file.originalFilename, sha256: file.sha256, status: 'valid' },
      ...(sel.poster ? { hasEmbeddedText: true } : {}),
      ...(sel.cropBottom ? { displayCrop: { bottomPx: sel.cropBottom, note: sel.note } } : {}),
    };
    for (const loc of sel.locale ? [sel.locale] : ['en', 'ar']) gallery[loc].push({ ...entry, source: { ...entry.source, locale: loc } });
    manifest.push({ driveFileId: file.driveFileId, driveFolderId: file.driveFolderId, originalFilename: file.originalFilename, drivePath: file.drivePath, sha256: file.sha256, originalDimensions: [file.width, file.height], local: { card: rend.card, full: rend.full, width: rend.width, height: rend.height }, productId: g.id, role, locales: sel.locale ? [sel.locale] : ['en', 'ar'], ...(sel.cropBottom ? { displayCropBottomPx: sel.cropBottom } : {}) });
  }
  products.push({
    id: g.id, slug: g.slug, code: `PV-${CODE[g.category]}-${num}`, categoryId: g.category, style: null, unit: 'set', sort: -1000 + products.length,
    illustrative: true, verification: 'concept-render', status: 'active',
    name: g.name, description: DESC, pieces: [], materials: null, gallery,
    ...(g.review ? { review: g.review } : {}), ...(g.note ? { note: g.note } : {}), ...(g.gap ? { sourceGap: g.gap } : {}),
  });
}
fs.writeFileSync(path.join(root, 'src/data/catalog/products.expansion.json'), JSON.stringify(products, null, 2) + '\n');

// manifest also lists the Drive images deliberately not used, so nothing is silently skipped
const used = new Set(manifest.map((m) => m.driveFileId));
const unused = inv.files.filter((f) => !used.has(f.driveFileId)).map((f) => ({ driveFileId: f.driveFileId, originalFilename: f.originalFilename, drivePath: f.drivePath, sha256: f.sha256 ?? null, status: f.status, note: 'not used by an expansion product (legacy-product image, excluded, or not persisted)' }));
fs.writeFileSync(path.join(root, 'data/catalog-import/asset-manifest.json'), JSON.stringify({ builtFrom: 'drive-inventory-2026-11-09.json + catalog-design-groups.json', products: products.length, images: manifest.length, manifest, notUsed: unused }, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'data/catalog-import/edge-trim-report.json'), JSON.stringify({ rule: 'outer line <= 6px, >=90% pixels brighter than 238, content 4px inside <60% bright', trimmed: trims }, null, 2) + '\n');
console.log(`trimmed ${trims.length} sources;`, `products ${products.length} · images ${manifest.length} · not used ${unused.length}`, perCat);
