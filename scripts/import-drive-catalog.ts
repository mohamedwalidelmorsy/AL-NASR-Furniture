/**
 * Reproducible importer for the Google Drive catalog ("الكتالوج", 94 PNG, 47 AR / 47 EN).
 *
 *   npm run catalog:import                       # status: what is imported / still missing (no network)
 *   npm run catalog:import -- --download         # download + verify originals into .catalog-cache/originals
 *   npm run catalog:import -- --convert          # convert cached originals to 640/1400 WebP in public/assets
 *   npm run catalog:import -- --download --convert --only=img-bedroom-sets-ar-02,img-bedroom-sets-en-04
 *
 * Download needs a Google OAuth access token with read access to the folder (the folder is shared with
 * the business Google account, it is NOT public):
 *   GOOGLE_DRIVE_ACCESS_TOKEN=$(gcloud auth print-access-token \
 *       --scopes=https://www.googleapis.com/auth/drive.readonly) npm run catalog:import -- --download
 * Required permission: scope `drive.readonly` on an account that can open the folder. Nothing is written to Drive.
 *
 * Importing files does NOT publish products: a product record must still be added to
 * src/data/catalog/products.json once the business confirms names, classification and specifications.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { renditionPath, verifyOriginal, type InventoryFile } from './lib/catalog-import.ts';

const root = path.resolve(import.meta.dirname, '..');
const inventoryPath = path.join(root, 'data/catalog-import/drive-inventory.json');
const cacheDir = path.join(root, '.catalog-cache/originals');
const reportPath = path.join(root, 'data/catalog-import/import-report.json');

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const only = args.find((a) => a.startsWith('--only='))?.slice(7).split(',').filter(Boolean);

const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8')) as { source: { folderId: string }; files: InventoryFile[] };
const files = inventory.files.filter((f) => !only || only.includes(f.imageId));
const original = (f: InventoryFile) => path.join(cacheDir, `${f.imageId}.png`);
const published = (f: InventoryFile) => fs.existsSync(path.join(root, renditionPath(f, 640))) && fs.existsSync(path.join(root, renditionPath(f, 1400)));

type Row = { imageId: string; driveFileId: string; status: string; problems?: string[]; width?: number; height?: number; sha256?: string };
const report: Row[] = [];

async function download(f: InventoryFile) {
  const token = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  if (!token) throw new Error('GOOGLE_DRIVE_ACCESS_TOKEN is not set (see the header of this script)');
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${f.driveFileId}?alt=media&supportsAllDrives=true`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive responded ${res.status} for ${f.imageId} (check token scope and folder access)`);
  return Buffer.from(await res.arrayBuffer());
}

async function convert(f: InventoryFile, data: Buffer) {
  for (const w of [640, 1400] as const) {
    const out = path.join(root, renditionPath(f, w));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sharp(data).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  }
}

async function main() {
  fs.mkdirSync(cacheDir, { recursive: true });
  const imported = files.filter(published).length;
  console.log(`Inventory: ${inventory.files.length} files · selected: ${files.length} · already published as WebP: ${imported} · remaining: ${files.length - imported}`);

  if (!flag('download') && !flag('convert')) {
    for (const f of files.filter((x) => !published(x))) console.log(`  missing  ${f.imageId}  (${f.drivePath}/${f.originalFilename})`);
    console.log('\nNext: GOOGLE_DRIVE_ACCESS_TOKEN=… npm run catalog:import -- --download --convert');
    return;
  }

  let failed = 0;
  for (const f of files) {
    const row: Row = { imageId: f.imageId, driveFileId: f.driveFileId, status: 'skipped' };
    try {
      let data: Buffer | null = fs.existsSync(original(f)) ? fs.readFileSync(original(f)) : null;
      if (!data && flag('download')) { data = await download(f); }
      if (!data) { row.status = 'not-downloaded'; report.push(row); continue; }
      const v = verifyOriginal(f, data);
      Object.assign(row, { width: v.width, height: v.height, sha256: v.sha256 });
      if (!v.ok) { row.status = 'invalid'; row.problems = v.problems; failed++; report.push(row); console.error(`✘ ${f.imageId}: ${v.problems.join('; ')}`); continue; }
      fs.writeFileSync(original(f), data);
      if (flag('convert')) { await convert(f, data); row.status = 'converted'; } else row.status = 'downloaded';
      console.log(`✔ ${f.imageId} ${row.status} (${v.width}×${v.height})`);
    } catch (e) {
      row.status = 'error'; row.problems = [(e as Error).message]; failed++;
      console.error(`✘ ${f.imageId}: ${(e as Error).message}`);
    }
    report.push(row);
  }
  fs.writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), folderId: inventory.source.folderId, rows: report }, null, 2) + '\n');
  console.log(`\nReport: ${path.relative(root, reportPath)} · failures: ${failed}`);
  if (failed) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
