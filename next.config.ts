import type { NextConfig } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

type CatalogRecord = { id: string; slug: string; categoryId: string; status?: string; mergedInto?: string; previousRoutes?: { categoryId: string; slug: string }[] };
const readCatalog = (file: string) => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/catalog', file), 'utf8')) as CatalogRecord[];

/**
 * Permanent (308) redirects generated from the catalog data, never hand-written:
 *  - approved duplicate records (`status: merged`) → the continuing product's URL
 *  - products moved to another primary category (`previousRoutes`) → their current URL
 * The locale segment is preserved (`/en/…` → `/en/…`, `/ar/…` → `/ar/…`).
 */
export function catalogRedirects(records: CatalogRecord[]) {
  const byId = new Map(records.map((p) => [p.id, p]));
  const out: { source: string; destination: string; permanent: true }[] = [];
  const add = (fromCat: string, fromSlug: string, to: CatalogRecord) =>
    out.push({ source: `/:locale(en|ar)/collections/${fromCat}/${fromSlug}`, destination: `/:locale/collections/${to.categoryId}/${to.slug}`, permanent: true });
  for (const p of records) {
    if (p.status === 'merged' && p.mergedInto) { const to = byId.get(p.mergedInto); if (to) add(p.categoryId, p.slug, to); }
    for (const r of p.previousRoutes ?? []) add(r.categoryId, r.slug, p);
  }
  return out;
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 768, 1024, 1280, 1600],
    imageSizes: [72, 112, 224, 320, 480],
  },
  async redirects() {
    return catalogRedirects([...readCatalog('products.json'), ...readCatalog('products.expansion.json')]);
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
