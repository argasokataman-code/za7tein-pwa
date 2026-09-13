#!/usr/bin/env bash
# Verifikasi lint + build. Satu-satunya cara yang disahkan — JANGAN ganti ke `rtk *`.
set -euo pipefail

echo "== lint (oxlint) =="
npm run lint

echo "== build (tsc -b && vite build) =="
npm run build