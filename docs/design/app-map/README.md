# Peta Aplikasi per Role (archify)

Diagram arsitektur app Sa7tein PWA — 14 node, sudut pandang per role (Customer, Merchant, Karyawan kurir, Ops, Super Admin legacy).

Semua berkas peta ini tinggal di folder ini. **Jangan pindahkan atau pecah ke luar folder.**

| Berkas | Isi |
|---|---|
| `app-map.architecture.json` | Sumber (spec) — satu-satunya yang diedit saat peta berubah |
| `app-map.html` | Artefak jadi, self-contained, dibuka di browser |
| `app-map.visual-check.*` | Bukti `visual-check` (screenshot 4 viewport light/dark + receipt + contact sheet) |

## UPDATE (alur wajib)

Edit spec, lalu dari root repo:

```bash
node /Users/vanviakingali/.agents/skills/archify/bin/archify.mjs validate architecture docs/design/app-map/app-map.architecture.json --quality showcase --json
node /Users/vanviakingali/.agents/skills/archify/bin/archify.mjs deliver architecture docs/design/app-map/app-map.architecture.json docs/design/app-map/app-map.html --quality showcase --json
ARCHIFY_CHROME="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  node /Users/vanviakingali/.agents/skills/archify/bin/archify.mjs visual-check docs/design/app-map/app-map.html --json
```

`deliver` wajib exit 0 dan lapor **9/9 checks, 0 error, 0 warning**. Jangan sebut sukses kalau exit non-zero. `visual-check` butuh Chromium; di mesin ini Chrome tidak ada, jadi set `ARCHIFY_CHROME` ke Brave (perintah di atas) — tanpa itu `visual-check` keluar 2 dengan `viewer/chrome-unavailable`.

Catatan:
- Spec harus tetap lolos `--quality showcase`; kalau gagal, perbaiki spec — jangan turunkan kualitas.
- Viewer UI-nya Inggris (renderer hanya mendukung `en`/`zh-CN`); isi diagram berbahasa Indonesia.
- `visual-check` menulis ulang sidecar di folder ini. Itu wajar.

## Isi peta (diperbarui 2026-11-05)

- **Aktor:** Customer (47 rute), Merchant (26), Karyawan kurir (14), Ops (14), Super Admin (11, legacy).
- **App:** Customer App, Merchant Console, Courier Console, Ops Console (kanonik, non-PWA), SA Console (legacy, alat audit).
- **Fondasi:** Redux Store (22 slice, persist 17), Mock Data (`src/data`, 48 modul), Kontrak BE beta (QRIS, ledger, WebSocket, R2, Durable Object), Web plain (Landing + Documentation, 2 rute).
- **Region:** `PWA app - 3 peran (87 rute)`, `Backoffice web - non-PWA (25 rute)`, `Web plain (2 rute)`.

Sumber kebenaran struktur: `src/App.tsx` (enam array rute: `webRoutes`, `customerRoutes`, `merchantRoutes`, `courierRoutes`, `superAdminRoutes`, `opsRoutes`), `src/store/index.ts` (daftar slice + `persist` whitelist), `src/data/`. Perbarui peta kalau rute/slice/modul berubah.

Hitungan di atas bukan perkiraan; perintah pemeriksanya:

```bash
node -e 'const t=require("fs").readFileSync("src/App.tsx","utf8").split("\n");const g={web:142,customer:162,merchant:213,courier:246,superadmin:272,ops:304};const n=Object.keys(g);for(let i=0;i<n.length;i++){const s=g[n[i]]-1,e=i+1<n.length?g[n[i+1]]-1:t.length;let c=0;for(let j=s;j<e;j++)if(/^\s*\[["\x27][^"\x27]+["\x27],\s*\w+\]/.test(t[j]))c++;console.log(n[i],c)}'
```

Hasil 2026-11-05: `web 2`, `customer 47`, `merchant 26`, `courier 14`, `superadmin 11`, `ops 14` (total 114).

## Hubungan dengan PRD beta

Peta ini menggambarkan **kondisi kode**, bukan target beta. Selisih kode vs PRD aktif
`sa7tein-beta-2026-11-05` ada di `docs/product/prd/versions/sa7tein-beta-2026-11-05/ui-impact.md`
(layar yang dihapus, diganti, dan flow yang wajib rebase). Node `handoff` sengaja diberi label
"kontrak BE (beta)" dan bergaris putus-putus: repo ini tidak mengimplementasikan backend (`AGENTS.md` §1).
