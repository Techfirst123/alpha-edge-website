#!/usr/bin/env bash
# One-time migration: uploads admin-uploaded images that currently live in
# public/uploads/ (git-tracked, served from disk on Vercel) into the new
# UPLOADS_BUCKET R2 bucket, preserving their relative path so existing
# MongoDB documents that already reference /uploads/<path> keep working
# unchanged after cutover to Cloudflare Pages.
#
# Run this ONCE, after creating the R2 bucket (see README.md) and before
# (or right after) your first Cloudflare Pages deploy:
#   chmod +x scripts/migrate-uploads-to-r2.sh
#   ./scripts/migrate-uploads-to-r2.sh
set -euo pipefail

BUCKET="alpha-edge-uploads"
SRC_DIR="public/uploads"

if [ ! -d "$SRC_DIR" ]; then
  echo "No $SRC_DIR directory found — nothing to migrate."
  exit 0
fi

count=0
while IFS= read -r -d '' file; do
  key="${file#"$SRC_DIR"/}"
  echo "Uploading: $key"
  npx wrangler r2 object put "$BUCKET/$key" --file "$file" --remote
  count=$((count + 1))
done < <(find "$SRC_DIR" -type f -print0)

echo "Done — migrated $count file(s) to r2://$BUCKET."
echo "Once you've confirmed images load correctly from the deployed site,"
echo "public/uploads/ can be deleted (it's no longer read at runtime)."
