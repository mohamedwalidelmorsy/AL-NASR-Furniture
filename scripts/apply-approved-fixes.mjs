/**
 * Applies the owner-approved catalog fixes (2026-11-09) to src/data/catalog/*.json. Idempotent.
 *   node scripts/build-catalog-expansion.mjs && node scripts/apply-approved-fixes.mjs
 * - merges the four approved bedroom duplicate pairs (legacy id/URL kept, duplicate becomes `merged`)
 * - archives pv-kb-01..03, moves four products to their correct primary category (old URLs redirect 308)
 * - design-specific bilingual descriptions, context-sensitive unit kinds, Arabic names for GCC buyers
 * Nothing is deleted: original source files and legacy local images are untouched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { SUFFIX, MERGES, ARCHIVE, MOVES, ALSO_IN, POSTER_FROM_AR, UNIT_KIND, UNIT_OVERRIDE, COARSE_UNIT, NAMES, DESC } from './catalog-fix-data.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'src/data/catalog');
const legacy = JSON.parse(fs.readFileSync(path.join(dir, 'products.json'), 'utf8'));
const expansion = JSON.parse(fs.readFileSync(path.join(dir, 'products.expansion.json'), 'utf8'));
const all = [...legacy, ...expansion];
const byId = Object.fromEntries(all.map((p) => [p.id, p]));
const clone = (x) => JSON.parse(JSON.stringify(x));
const DATE = '2026-11-09';

// 1. merge approved duplicate pairs
for (const { keep, dup, evidence } of MERGES) {
  const k = byId[keep], d = byId[dup];
  if (!k || !d) throw new Error(`missing ${keep}/${dup}`);
  const dupGallery = d.status === 'merged' && d._gallery ? d._gallery : d.gallery; // idempotent if re-run
  k.gallery = clone(dupGallery);
  k.sort = Math.min(k.sort, d.sort);
  k.migration = { class: 'B', basis: `Same design as ${dup} — owner-approved merge (${DATE}); clean gallery transferred, legacy id/slug/URL kept`, equivalence: { status: 'confirmed', candidate: dup, confirmedBy: 'owner', date: DATE, evidence }, mergedFrom: dup };
  delete k.review; delete k.note;
  d._gallery = undefined; delete d._gallery;
  d.status = 'merged'; d.mergedInto = keep;
  d.migration = { class: 'merged', basis: `Duplicate of ${keep}; not listed; URL redirects 308 to the continuing product`, equivalence: { status: 'confirmed', candidate: keep, confirmedBy: 'owner', date: DATE, evidence } };
  delete d.review;
}

// 2. archive retired legacy kids products (records, ids, slugs and local images are kept)
for (const id of ARCHIVE) {
  const p = byId[id];
  p.status = 'archived';
  p.archived = { archivedAt: DATE, reason: 'retired legacy kids catalog (owner-approved)', equivalentId: null };
  p.migration = { class: 'A', basis: 'Superseded by the new kids designs; source images were intentionally deleted from Drive; local files kept', equivalence: { status: 'rejected', candidate: null } };
}

// 3. category corrections (same id; old URLs redirect)
for (const [id, cat] of Object.entries(MOVES)) {
  const p = byId[id];
  if (p.categoryId !== cat) {
    p.previousRoutes = [...(p.previousRoutes ?? []), { categoryId: p.categoryId, slug: p.slug }];
    p.categoryId = cat;
  }
  delete p.alsoIn;
}
for (const [id, cats] of Object.entries(ALSO_IN)) byId[id].alsoIn = cats;

// 4. clean bilingual posters replace the EN posters that carried marketing claims (same design, AR file)
for (const id of POSTER_FROM_AR) {
  const p = byId[id];
  const ar = clone(p.gallery.ar);
  p.gallery.en = ar.map((g) => ({ ...g, source: { ...g.source, locale: 'en' }, role: 'cover', hasEmbeddedText: true }));
  p.gallery.ar = ar.map((g) => ({ ...g, role: 'cover', hasEmbeddedText: true }));
}

// 5. names, descriptions, units
for (const p of all) {
  const n = NAMES[p.id]; if (n) p.name = { ...p.name, ...n };
  const d = DESC[p.id];
  if (d) p.description = { en: `${d[0]} ${SUFFIX.en}`, ar: `${d[1]} ${SUFFIX.ar}` };
  const kind = UNIT_OVERRIDE[p.id] ?? UNIT_KIND[p.categoryId];
  p.unitKind = kind; p.unit = COARSE_UNIT[kind];
}
// merged duplicates inherit the continuing product's description/name basis so nothing stale remains
for (const { keep, dup } of MERGES) byId[dup].description = byId[keep].description;

fs.writeFileSync(path.join(dir, 'products.json'), JSON.stringify(legacy, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'products.expansion.json'), JSON.stringify(expansion, null, 2) + '\n');
const st = {}; for (const p of all) st[p.status ?? 'active'] = (st[p.status ?? 'active'] ?? 0) + 1;
console.log('records', all.length, st);
