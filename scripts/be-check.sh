#!/usr/bin/env bash
# Cek koneksi ke backend Worker Cloudflare (D1 + R2). Read-only.
# Baca VITE_API_BASE_URL dari env file (default .env.local). Tanpa secret.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="${ENV_FILE:-.env.local}"
[ -f "$ENV_FILE" ] || { echo "env file tidak ada: $ENV_FILE"; exit 1; }
val() { sed -n "s/^$1=[\"']\{0,1\}\([^\"']*\)[\"']\{0,1\}$/\1/p" "$ENV_FILE" | head -1; }

BASE="$(val VITE_API_BASE_URL)"
[ -n "$BASE" ] || { echo "VITE_API_BASE_URL kosong di $ENV_FILE"; exit 1; }
BASE="${BASE%/}"
echo "BE: $BASE"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fail=0
get() {
  printf '  %-32s ' "$1"
  code="$(curl -sS -m 12 -o "$TMP/body" -w '%{http_code}' "$BASE$1" || echo 000)"
  printf 'http=%-3s ' "$code"
  head -c 110 "$TMP/body" | tr -d '\n'
  echo
  [ "$code" = "200" ] || fail=1
}

echo "1) Worker health/versi"
get /health
get /version

echo "2) REST baca (subset PostgREST di D1)"
get "/rest/v1/merchants?limit=1"
get "/rest/v1/marketing?limit=1"

if [ "$fail" -eq 0 ]; then
  echo "OK: Worker + D1 terjangkau, kontrak /rest/v1 cocok."
else
  echo "GAGAL: ada endpoint yang tidak 200."
  exit 1
fi
