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
npx opennextjs-cloudflare build
cp ./cloudflare/staging/_headers ./.open-next/assets/_headers
echo "staging bundle ready in .open-next/ (site URL: $NEXT_PUBLIC_SITE_URL)"
