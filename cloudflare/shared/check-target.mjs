#!/usr/bin/env node
/**
 * Deploy guard: refuses to deploy a .open-next bundle that was built for another target.
 *
 *   node cloudflare/shared/check-target.mjs <allowed-target>... [--clean]
 *
 * Reads .open-next/deploy-target (written by cloudflare/shared/build.sh). With --clean it also refuses a working
 * tree with uncommitted changes to tracked files, so every production version maps to one git commit.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const clean = args.includes('--clean');
const allowed = args.filter((a) => a !== '--clean');
if (!allowed.length) { console.error('usage: check-target.mjs <allowed-target>... [--clean]'); process.exit(2); }

let built = '';
try { built = fs.readFileSync('.open-next/deploy-target', 'utf8').trim(); } catch { /* missing */ }
if (!allowed.includes(built)) {
  console.error(`error: .open-next was built for "${built || 'unknown'}", expected ${allowed.join(' or ')}. Rebuild for the right target.`);
  process.exit(1);
}
if (clean) {
  const dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim();
  if (dirty) { console.error('error: uncommitted changes to tracked files; commit first so the deploy maps to one commit.'); process.exit(1); }
}
console.log(`[deploy-target] ${built} OK${clean ? ', working tree clean' : ''}`);
