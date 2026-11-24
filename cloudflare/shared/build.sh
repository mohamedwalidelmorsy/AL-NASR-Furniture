#!/bin/sh
# Build the OpenNext bundle for ONE Cloudflare target. Run from the repo root on macOS/Linux/WSL
# (OpenNext does not fully support native Windows builds).
#
#   sh ./cloudflare/shared/build.sh staging      → wrangler.jsonc            + cloudflare/staging/{build.env,_headers}
#   sh ./cloudflare/shared/build.sh production   → wrangler.production.jsonc + cloudflare/production/{build.env,_headers}
#
# The target is written to .open-next/deploy-target; the deploy scripts refuse a bundle built for another
# target (cloudflare/shared/check-target.mjs), so a staging build can never be deployed to production or back.
set -eu
TARGET="${1:-}"
case "$TARGET" in
  staging) CONFIG="wrangler.jsonc" ;;
  production) CONFIG="wrangler.production.jsonc" ;;
  *) echo "usage: sh ./cloudflare/shared/build.sh staging|production" >&2; exit 2 ;;
esac
DIR="./cloudflare/$TARGET"
ENV_FILE="$DIR/build.env"
MARKER="$TARGET"

if [ "$TARGET" = staging ] && grep -q 'CHANGE-ME-SUBDOMAIN' "$ENV_FILE" && [ "${CF_ALLOW_PLACEHOLDER:-0}" != "1" ]; then
  echo "error: set your workers.dev subdomain in $ENV_FILE (NEXT_PUBLIC_SITE_URL) before building." >&2
  exit 1
fi
set -a
. "$ENV_FILE"
set +a

if [ "$TARGET" = production ]; then
  # Production must never ship "PENDING" business data. CF_ALLOW_INCOMPLETE=1 allows a LOCAL test build only:
  # it is marked production-incomplete, which cf:deploy:production refuses.
  missing=""
  unset_or_placeholder() { case "$1" in ""|PENDING|STAGING-TEST|*CHANGE-ME*) return 0 ;; *) return 1 ;; esac; }
  unset_or_placeholder "${NEXT_PUBLIC_SITE_URL:-}" && missing="$missing NEXT_PUBLIC_SITE_URL"
  if [ "${NEXT_PUBLIC_RFQ_ENABLED:-true}" = "false" ]; then
    # Online RFQ off (MVP launch before e-mail delivery): no personal data is collected, but buyers need at least
    # one real contact channel.
    if unset_or_placeholder "${NEXT_PUBLIC_WHATSAPP_NUMBER:-}" && unset_or_placeholder "${NEXT_PUBLIC_SALES_EMAIL:-}"; then
      missing="$missing NEXT_PUBLIC_WHATSAPP_NUMBER|NEXT_PUBLIC_SALES_EMAIL(at-least-one)"
    fi
  else
    for v in NEXT_PUBLIC_WHATSAPP_NUMBER NEXT_PUBLIC_SALES_EMAIL NEXT_PUBLIC_CONSENT_TEXT_VERSION; do
      eval "val=\${$v:-}"
      unset_or_placeholder "$val" && missing="$missing $v"
    done
  fi
  case "${NEXT_PUBLIC_SITE_URL:-}" in
    https://*.workers.dev*|http://*) echo "error: NEXT_PUBLIC_SITE_URL must be the https production origin" >&2; exit 1 ;;
  esac
  if [ -n "$missing" ]; then
    if [ "${CF_ALLOW_INCOMPLETE:-0}" = "1" ]; then
      echo "warning: production values missing:$missing — LOCAL TEST BUILD ONLY, marked not deployable." >&2
      MARKER="production-incomplete"
    else
      echo "error: production values missing:$missing (set them in $ENV_FILE)." >&2
      exit 1
    fi
  fi
  # Search indexing opens only with an explicit owner go-ahead at launch.
  if [ "${NEXT_PUBLIC_ALLOW_INDEXING:-false}" = "true" ] && [ "${CF_CONFIRM_INDEXING:-}" != "yes" ]; then
    echo "error: NEXT_PUBLIC_ALLOW_INDEXING=true needs CF_CONFIRM_INDEXING=yes (owner launch approval)." >&2
    exit 1
  fi
fi

# --- SWC native binding preflight -------------------------------------------------------------
# next.config.ts → next-intl plugin → @swc/core. Since @swc/core 1.16 the Linux addon is unpacked
# into a native cache that must not have ancestors writable by other users (ERR_SWC_NATIVE_CACHE).
# If the default cache ($HOME/.cache, then /tmp) is rejected, pick an audited safe directory.
# SWC's security checks are never disabled. Diagnostics print only paths/uids/modes.
SWC_PROBE="require('@swc/core').transformSync('let a = 1', {}); console.log('[swc] native binding loaded and transform OK')"
if ! node -e "$SWC_PROBE" 2>/tmp/swc-probe.err; then
  echo "[swc] default native cache unusable:" >&2
  grep -o 'SWC native addon:[^"]*' /tmp/swc-probe.err | head -n 1 | cut -c1-600 >&2 || true
  SWC_NATIVE_BINDING_CACHE="$(node ./cloudflare/shared/swc-native-cache.mjs)" || {
    echo "error: no safe SWC native cache directory available in this build environment (see audit above)." >&2
    exit 1
  }
  export SWC_NATIVE_BINDING_CACHE
  echo "[swc] using SWC_NATIVE_BINDING_CACHE=$SWC_NATIVE_BINDING_CACHE"
  node -e "$SWC_PROBE"
fi

rm -f ./.open-next/deploy-target
npx opennextjs-cloudflare build -c "$CONFIG"
# Copy the prerendered route cache into the static assets (static-assets incremental cache; a local file copy,
# no remote call). Without it every page is server-rendered on request, which exceeds the Workers Free CPU
# limit and fails. A plain `wrangler deploy -c …` does NOT do this step, so the build always does it.
npx opennextjs-cloudflare populateCache local -c "$CONFIG"
CACHE_FILES="$(find ./.open-next/assets/cdn-cgi/_next_cache -type f 2>/dev/null | wc -l | tr -d ' ')"
if [ "${CACHE_FILES:-0}" -lt 1 ]; then
  echo "error: prerendered route cache missing in .open-next/assets/cdn-cgi/_next_cache — refusing to mark the build deployable." >&2
  exit 1
fi
cp "$DIR/_headers" ./.open-next/assets/_headers
printf '%s\n' "$MARKER" > ./.open-next/deploy-target
echo "$TARGET bundle ready in .open-next/ (marker: $MARKER, route-cache files: $CACHE_FILES, site URL: $NEXT_PUBLIC_SITE_URL)"
