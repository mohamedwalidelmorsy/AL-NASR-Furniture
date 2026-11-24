#!/bin/sh
# Build the Cloudflare STAGING bundle with OpenNext. Run from the repo root on macOS/Linux/WSL
# (OpenNext does not fully support native Windows builds).
set -eu
ENV_FILE="./cloudflare/staging/build.env"
if grep -q 'CHANGE-ME-SUBDOMAIN' "$ENV_FILE" && [ "${CF_ALLOW_PLACEHOLDER:-0}" != "1" ]; then
  echo "error: set your workers.dev subdomain in $ENV_FILE (NEXT_PUBLIC_SITE_URL) before building." >&2
  exit 1
fi
set -a
. "$ENV_FILE"
set +a

# --- SWC native binding preflight -------------------------------------------------------------
# next.config.ts → next-intl plugin → @swc/core. Since @swc/core 1.16 the Linux addon is unpacked
# into a native cache that must not have ancestors writable by other users (ERR_SWC_NATIVE_CACHE).
# If the default cache ($HOME/.cache, then /tmp) is rejected, pick an audited safe directory.
# SWC's security checks are never disabled. Diagnostics print only paths/uids/modes.
SWC_PROBE="require('@swc/core').transformSync('let a = 1', {}); console.log('[swc] native binding loaded and transform OK')"
if ! node -e "$SWC_PROBE" 2>/tmp/swc-probe.err; then
  echo "[swc] default native cache unusable:" >&2
  grep -o 'SWC native addon:[^"]*' /tmp/swc-probe.err | head -n 1 | cut -c1-600 >&2 || true
  SWC_NATIVE_BINDING_CACHE="$(node ./cloudflare/staging/swc-native-cache.mjs)" || {
    echo "error: no safe SWC native cache directory available in this build environment (see audit above)." >&2
    exit 1
  }
  export SWC_NATIVE_BINDING_CACHE
  echo "[swc] using SWC_NATIVE_BINDING_CACHE=$SWC_NATIVE_BINDING_CACHE"
  node -e "$SWC_PROBE"
fi

npx opennextjs-cloudflare build
cp ./cloudflare/staging/_headers ./.open-next/assets/_headers
echo "staging bundle ready in .open-next/ (site URL: $NEXT_PUBLIC_SITE_URL)"
