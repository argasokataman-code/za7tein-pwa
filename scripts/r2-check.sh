#!/usr/bin/env bash
# Cek koneksi Cloudflare R2 + token API memakai kredensial dari env file
# (default .env.local, di-gitignore). Read-only: verify token + ListBuckets
# (+ HeadBucket bila R2_BUCKET diisi). Tidak pernah mencetak secret.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="${ENV_FILE:-.env.local}"
[ -f "$ENV_FILE" ] || { echo "env file tidak ada: $ENV_FILE"; exit 1; }

# Ambil nilai satu baris tanpa mengeksekusi file (PEM multi-baris aman dilewati).
val() { sed -n "s/^$1=[\"']\{0,1\}\([^\"']*\)[\"']\{0,1\}$/\1/p" "$ENV_FILE" | head -1; }

ACC="$(val CLOUDFLARE_ACCOUNT_ID)"
TOKEN="$(val CLOUDFLARE_API_TOKEN)"
AKID="$(val R2_ACCESS_KEY_ID)"
SAK="$(val R2_SECRET_ACCESS_KEY)"
ENDPOINT="$(val R2_ENDPOINT)"
BUCKET="$(val R2_BUCKET)"

missing=0
for k in CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_ENDPOINT; do
  [ -n "$(val "$k")" ] || { echo "KOSONG: $k"; missing=1; }
done
[ "$missing" -eq 0 ] || { echo "lengkapi $ENV_FILE dulu"; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "1) token API — /tokens/verify"
code="$(curl -sS -o "$TMP/token.json" -w '%{http_code}' \
  "https://api.cloudflare.com/client/v4/accounts/$ACC/tokens/verify" \
  -H "Authorization: Bearer $TOKEN" || echo 000)"
status="$(node -e 'try{const j=require(process.argv[1]);process.stdout.write(String(j.result?.status||("err "+(j.errors?.[0]?.code??"?"))))}catch{process.stdout.write("?")}' "$TMP/token.json" 2>/dev/null || echo '?')"
echo "   HTTP $code · status=$status"

echo "2) R2 S3 — ListBuckets (SigV4)"
code2="$(curl -sS -o "$TMP/buckets.xml" -w '%{http_code}' \
  --aws-sigv4 "aws:amz:auto:s3" --user "$AKID:$SAK" "$ENDPOINT" || echo 000)"
echo "   HTTP $code2"
if [ "$code2" = "200" ]; then
  sed -n 's:.*<Name>\([^<]*\)</Name>.*:     - \1:p' "$TMP/buckets.xml"
else
  echo "   (403/AccessDenied = kredensial sah tapi token di-scope ke bucket tertentu;"
  echo "    ListBuckets butuh izin account-level. Isi R2_BUCKET lalu jalankan ulang.)"
fi

if [ -n "$BUCKET" ]; then
  echo "3) R2 S3 — HeadBucket '$BUCKET'"
  code3="$(curl -sS -o /dev/null -w '%{http_code}' \
    --aws-sigv4 "aws:amz:auto:s3" --user "$AKID:$SAK" "$ENDPOINT/$BUCKET" || echo 000)"
  echo "   HTTP $code3"
else
  echo "3) R2_BUCKET kosong — set dari daftar di atas untuk uji HeadBucket"
fi
