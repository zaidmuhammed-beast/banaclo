#!/usr/bin/env sh
# Packages the theme as dist/econsco.zip for WP Admin → Appearance → Themes → Upload.
set -e
cd "$(dirname "$0")"
mkdir -p dist
rm -f dist/econsco.zip
zip -rq dist/econsco.zip econsco -x '*.DS_Store'
echo "Built $(pwd)/dist/econsco.zip"
