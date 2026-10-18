#!/usr/bin/env bash
# Query cepat Cloudflare D1 `sa7tein` (SQLite) memakai kredensial dari env file
# (default .env.local, di-gitignore). Tidak pernah mencetak token.
#
# Pakai:
#   scripts/d1-check.sh                  -> daftar tabel
#   scripts/d1-check.sh "SELECT ..."     -> jalankan SQL apa pun
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="${ENV_FILE:-.env.local}"
[ -f "$ENV_FILE" ] || { echo "env file tidak ada: $ENV_FILE"; exit 1; }
# Nilai satu baris; PEM multi-baris dilewati (sama seperti r2-check.sh).
val() { sed -n "s/^$1=[\"']\{0,1\}\([^\"']*\)[\"']\{0,1\}$/\1/p" "$ENV_FILE" | head -1; }

ACC="$(val CLOUDFLARE_ACCOUNT_ID)"
TOKEN="$(val CLOUDFLARE_API_TOKEN)"
DB="$(val CLOUDFLARE_D1_DATABASE_ID)"
for k in CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN CLOUDFLARE_D1_DATABASE_ID; do
  [ -n "$(val "$k")" ] || { echo "KOSONG di $ENV_FILE: $k"; exit 1; }
done

SQL="${1:-SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name}"
BODY="$(node -e 'process.stdout.write(JSON.stringify({sql: process.argv[1]}))' "$SQL")"

curl -sS "https://api.cloudflare.com/client/v4/accounts/$ACC/d1/database/$DB/query" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data "$BODY" \
| node -e '
let s = ""; process.stdin.on("data", d => (s += d)).on("end", () => {
  const j = JSON.parse(s);
  if (!j.success) { console.error("ERROR:", JSON.stringify(j.errors)); process.exit(1); }
  const r = j.result ? j.result[0] : null;
  const rows = r ? r.results : j.result;
  console.log(JSON.stringify(rows, null, 2));
  if (r && r.meta) console.log("meta:", JSON.stringify({ rows_read: r.meta.rows_read, changes: r.meta.changes }));
});'
