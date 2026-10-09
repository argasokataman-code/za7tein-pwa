# Setup agen di device baru

Panduan singkat untuk siapa pun (atau agen mana pun) yang baru meng-`clone` repo ini di device lain. Tujuannya: dependensi, git hook, dan protokol repo langsung terpasang sebelum menyentuh kode.

## Prasyarat

- **Node.js ≥ 20.19** (repo diuji di Node 24). Vite 8 menolak Node lebih lama.
- `git` dan `npm`.

## Langkah setup (sekali per clone)

```bash
git clone <url-repo> sa7tein-pwa
cd sa7tein-pwa

npm install --include=dev            # --include=dev wajib, kalau tidak devDependencies terlewat
git config core.hooksPath .githooks  # pasang hook pre-commit repo

npm run governance:check             # smoke test 1: PRD + flow + token konsisten
npm run scan                         # smoke test 2: audit statik (nol server)
npm run build                        # smoke test 3: tsc -b && vite build
```

Cek hook terpasang: `git config core.hooksPath` → harus `.githooks`.

Isi hook yang akan menolak commit kalau gagal: forbidden patterns, batas baris, `npm run lint`, `npm run build`, `governance:check`, atlas (kalau `atlas/` ada), dan sinkronisasi `src/pages/Documentation.tsx`.

## Prompt agen (salin-tempel)

Tempel ini ke agen di sesi baru setelah clone:

```text
Kamu bekerja di repo Sa7tein PWA — front-end showcase UI/UX. Sebelum menulis kode apa pun, jalankan protokol berikut, berurutan.

1. Pasang dependensi + hook:
   npm install --include=dev
   git config core.hooksPath .githooks
2. Baca sumber aturan sebelum kerja:
   - AGENTS.md — pintu masuk agen (§0 urutan kerja 4 langkah, §1 batas repo, §4 token, §5 invarian layout, §8 verifikasi)
   - .rules.json — manifest mesin (scope, command, forbidden patterns, workflow)
   - .githooks/pre-commit — cek otomatis saat commit
   - docs/product/prd/manifest.json + sumber PRD aktif + docs/product/prd/decision-irbid-mvp.md
   - docs/design/DNA.md, docs/design/app-map/, docs/design/flows/INDEX.json
3. Smoke test sebelum mulai:
   npm run governance:check && npm run scan && npm run build
4. Kalau tugas menyentuh UI/UX/tampilan/mobile/website: muat skill senior-fe DULU (skill({name:"senior-fe"}) atau /senior-fe), jalan sampai Delivery Gate.
5. Ikuti empat langkah AGENTS.md §0: PETA → npm run scan → UBAH → VERIFIKASI. Verifikasi = npm run lint && npm run build && npm run scan; browser-gate HANYA untuk yang mustahil dibaca dari sumber (lebar kolom, gutter, overflow-x, scroller bersarang, PWA, safe-area, hit-test klik).
6. Jangan pakai wrapper rtk. Verifikasi selalu persis npm run lint / npm run build.
7. Jangan start dev server atau klon Brave baru kalau sudah ada yang hidup — cek dulu yang jalan.
8. Setelah kerja signifikan: record minimal satu node atlas (kalau folder atlas/ ada).
9. Requirement ambigu atau menyentuh aturan bisnis → tanya user, jangan menebak.
10. Kalau ada alat yang tidak tersedia (atlas CLI, browser/klon brave-debug), ikuti tabel fallback di docs/agent-setup.md — jangan diam-diam melewati gerbang atau mengklaim verifikasi yang tidak dijalankan.

Konteks repo: front-end saja. Tanpa backend/API/DB, autentikasi sungguhan, pembayaran sungguhan, atau Web Push. Semua data mock di src/data/, state di Redux. Jangan menambah lapisan API — ketiadaan integrasi itu keputusan sadar, bukan utang.
```

## Verifikasi sebelum kirim

```bash
./scripts/verify.sh   # npm run lint + npm run build
npm run scan          # 0 FAIL
```

Perubahan UI wajib lewat gerbang browser (butuh dev server + klon `brave-debug`):

```bash
node scripts/browser-gate.mjs --route <path> --strict --click   # satu gate pada satu waktu
```

## Yang perlu di-install & penggantinya kalau tidak tersedia

| Perlu | Wajib? | Untuk apa | Kalau tidak tersedia |
|---|---|---|---|
| **Node.js ≥ 20.19** + **npm** | Wajib | jalankan Vite, tsc, oxlint, semua `scripts/*.mjs` | Pasang via `fnm`, `nvm`, atau `brew install node`. Manajer paket lain boleh: `pnpm install` / `yarn install` setara (repo pakai `package-lock.json`, jadi npm disarankan) |
| **git** + **bash** | Wajib | clone, hook pre-commit, `scripts/*.sh` | Windows: jalankan dari **Git Bash** atau **WSL** — hook dan `.sh` butuh bash |
| **Dependensi `package.json`** | Wajib | build, lint, dev, semua perintah repo | `npm install --include=dev`. Jangan lupa `--include=dev`; tanpa itu devDependencies (vite, oxlint, sass) terlewat dan build gagal |
| **Atlas CLI** (`atlas-owner`) | Opsional | memori graf proyek + cek integritas di hook | Hook **melewati** cek atlas otomatis kalau CLI absen (`[ -f "$ATLAS" ]`), jadi commit tetap jalan. Baca `atlas/*.json` langsung kalau butuh riwayat. Aktifkan: pasang skill `atlas-owner` |
| **Brave + klon `brave-debug`** (`~/.local/share/brave-debug-mcp/bin/launch.sh`) | Opsional untuk edit non-UI, **wajib untuk perubahan UI** | `browser-gate` (ukur lebar kolom, gutter, overflow-x, hit-test klik, PWA) | `browser-gate` menyalakan klon sendiri lewat `launch.sh`; arahkan `BRAVE_DEBUG_LAUNCH` ke skrip launch milikmu, atau `GATE_CDP` ke endpoint CDP Chromium/Brave sendiri (default `http://127.0.0.1:9359`). Kalau benar-benar tak ada browser: ukur manual di DevTools dan **catat di laporan** bahwa gerbang browser tidak dijalankan |
| **Skill `senior-fe`** (opencode, bukan npm) | Opsional | filter desain + Delivery Gate | Pakai `docs/design/DNA.md` + audit terbaru di `docs/design/` sebagai pengganti, dan sebut di laporan kalau skill tidak dimuat |
| **gdescrib / vision proxy** | Opsional | mendeskripsikan screenshot | Prioritas DOM: `document.body.innerText` — gratis dan selalu benar. Screenshot hanya kalau DOM tak cukup |
| **`rtk`** | **Jangan dipakai** | — | Tidak ada pengganti. Selalu pakai `npm run lint` / `npm run build`; `rtk lint`/`rtk tsc` rusak di oxlint/tsc repo ini |

**Skill bukan dependensi repo.** `senior-fe` dan `atlas-owner` adalah tooling agent yang terpasang global di mesin pengguna, bukan paket npm — tak ada di `package.json`, dan build/commit tetap jalan tanpanya. Keduanya hanya memperkuat protokol; kalau absen, pakai fallback di atas.

Aturan ringkas: yang **Wajib** menghalangi build/commit kalau absen. Yang **Opsional** tak menghalangi edit non-UI, tapi **perubahan UI wajib melewati gerbang browser** — kalau browser tak tersedia, itu bukan alasan melewatkannya diam-diam: laporkan.
