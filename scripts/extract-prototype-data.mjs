// One-time migration: reads the archived Claude Design prototype (_source/site-content.js)
// and writes typed-data JSON used by the production app. Re-runnable; output is deterministic.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = fs.readFileSync(path.join(root, '_source/site-content.js'), 'utf8');
const win = {};
vm.runInNewContext(src, { window: win });
const A = win.ALNASR;

const write = (rel, data) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log('wrote', rel);
};

write('messages/en.json', A.i18n.en);
write('messages/ar.json', A.i18n.ar);
write('src/data/countries.json', A.countries);
write('src/data/catalog/categories.json', A.categories.slice().sort((a, b) => a.sort - b.sort));
write('src/data/catalog/styles.json', A.styles);

const toImage = (im, locale) => ({
  card: '/' + im.card,
  full: '/' + im.full,
  width: im.w,
  height: im.h,
  source: { driveFileId: im.drive, locale },
});
const products = A.collections.map((c) => ({
  id: c.id,
  slug: c.slug,
  code: c.code,
  categoryId: c.cat,
  style: c.style,
  unit: c.unit,
  sort: c.sort,
  illustrative: c.illustrative === true,
  name: c.name,
  description: c.desc,
  pieces: c.pieces,
  materials: c.materials,
  gallery: {
    en: [toImage(c.images.en, 'en')],
    ar: [toImage(c.images.ar, 'ar')],
  },
}));
write('src/data/catalog/products.json', products);
console.log('products', products.length, 'categories', A.categories.length);
