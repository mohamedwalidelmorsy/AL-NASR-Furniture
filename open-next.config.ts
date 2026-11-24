// OpenNext (Cloudflare) config. The site is fully pre-rendered (SSG), so the read-only
// static-assets incremental cache is used: no R2 / KV / D1 / Durable Objects (nothing paid to enable).
// See https://opennext.js.org/cloudflare/caching
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
