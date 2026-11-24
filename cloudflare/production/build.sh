#!/bin/sh
# Build the Cloudflare PRODUCTION bundle (see cloudflare/shared/build.sh). Refuses missing business values.
exec sh ./cloudflare/shared/build.sh production
