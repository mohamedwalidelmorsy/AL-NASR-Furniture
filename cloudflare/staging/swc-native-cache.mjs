#!/usr/bin/env node
/**
 * Select a safe absolute directory for SWC_NATIVE_BINDING_CACHE (build-time only).
 *
 * Why: @swc/core >= 1.16 ships its Linux addon as a compressed "carrier" that is unpacked into a
 * native cache before loading. SWC refuses a cache root that has an ancestor writable by another
 * user without trusted sticky protection (ERR_SWC_NATIVE_CACHE). On Cloudflare Workers Builds both
 * the default user cache ($HOME/.cache) and the /tmp fallback were rejected, so next.config.ts
 * (next-intl plugin → @swc/core) could not load.
 *
 * This script never weakens SWC's checks (it does not set SWC_NATIVE_BINDING_CACHE_SKIP_SECURITY_CHECK
 * and changes no permissions). It audits candidate directories with the same rules SWC applies
 * (verified empirically against @swc/core 1.16.22) and prints the first safe one on stdout.
 * Diagnostics go to stderr and contain only paths, numeric owners, modes and mount flags.
 *
 * Exit 0 + path on stdout = safe candidate found (created with mode 0700). Exit 1 = none safe.
 */
import fs from 'node:fs';
import path from 'node:path';

const uid = process.getuid();
const log = (...a) => console.error('[swc-cache]', ...a);

/** Mount table (Linux) → noexec lookup for the filesystem containing a path. */
function mountFlags(p) {
  let best = { mp: '', opts: '' };
  try {
    for (const line of fs.readFileSync('/proc/self/mountinfo', 'utf8').split('\n')) {
      const f = line.split(' ');
      if (f.length < 10) continue;
      const mp = f[4].replace(/\\040/g, ' ');
      const sep = f.indexOf('-');
      const opts = `${f[5]},${f[sep + 3] ?? ''}`;
      if ((p === mp || p.startsWith(mp.endsWith('/') ? mp : mp + '/')) && mp.length >= best.mp.length) best = { mp, opts };
    }
  } catch { /* non-Linux */ }
  return { mountPoint: best.mp, noexec: /(^|,)noexec(,|$)/.test(best.opts) };
}

/** Audit every existing ancestor of `root` (the root itself may not exist yet). */
function audit(root) {
  const rows = [];
  let ok = path.isAbsolute(root);
  let reason = ok ? '' : 'not absolute';
  // Walk from the deepest existing path upwards to '/'.
  let p = root;
  const chain = [];
  while (true) { chain.push(p); const up = path.dirname(p); if (up === p) break; p = up; }
  for (const dir of chain) {
    let st;
    try { st = fs.lstatSync(dir); } catch { rows.push({ dir, note: 'missing (will be created by owner)' }); continue; }
    const mode = st.mode & 0o7777;
    const sticky = (mode & 0o1000) !== 0;
    const trustedOwner = st.uid === 0 || st.uid === uid;
    let verdict = 'ok';
    if (st.isSymbolicLink() || !st.isDirectory()) verdict = 'UNSAFE: symlink or non-directory';
    else if (dir !== root) {
      if (!trustedOwner && (mode & 0o200)) verdict = `UNSAFE: owned by uid ${st.uid} (another user can write)`;
      else if ((mode & 0o022) && !(sticky && trustedOwner)) verdict = 'UNSAFE: group/other-writable without trusted sticky bit';
    } else if (st.uid !== uid) verdict = `UNSAFE: cache root owned by uid ${st.uid}`;
    rows.push({ dir, uid: st.uid, mode: mode.toString(8).padStart(4, '0'), verdict });
    if (verdict !== 'ok' && ok) { ok = false; reason = `${dir}: ${verdict}`; }
  }
  const existing = chain.find((d) => fs.existsSync(d)) ?? '/';
  const { mountPoint, noexec } = mountFlags(existing);
  if (ok && noexec) { ok = false; reason = `filesystem ${mountPoint} is mounted noexec (native addon cannot be loaded)`; }
  return { root, ok, reason, rows, mountPoint, noexec };
}

const home = process.env.HOME;
const candidates = [
  process.env.XDG_CACHE_HOME && path.join(process.env.XDG_CACHE_HOME, 'swc-native'),
  home && path.join(home, '.cache', 'swc-native'),
  path.join(process.cwd(), 'node_modules', '.cache', 'swc-native'),
  `/var/tmp/swc-native-${uid}`,
  process.env.XDG_RUNTIME_DIR && path.join(process.env.XDG_RUNTIME_DIR, 'swc-native'),
  `/dev/shm/swc-native-${uid}`,
].filter(Boolean);

log(`build uid=${uid} cwd=${process.cwd()} HOME=${home ?? '(unset)'}`);
for (const c of candidates) {
  const r = audit(c);
  log(`candidate ${c} → ${r.ok ? 'SAFE' : 'rejected: ' + r.reason} (mount ${r.mountPoint || '?'}${r.noexec ? ', noexec' : ''})`);
  for (const row of r.rows) log(`    ${row.dir}  ${row.note ?? `uid=${row.uid} mode=${row.mode} ${row.verdict}`}`);
  if (r.ok) {
    try {
      fs.mkdirSync(c, { recursive: true, mode: 0o700 });
      fs.chmodSync(c, 0o700); // our own new directory only; never touches shared directories
      process.stdout.write(c + '\n');
      process.exit(0);
    } catch (e) { log(`    could not create ${c}: ${e.code ?? e.message}`); }
  }
}
log('no safe SWC native cache directory found; refusing to weaken SWC security checks.');
process.exit(1);
