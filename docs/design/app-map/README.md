# Peta Aplikasi per Role (archify)

Diagram arsitektur app Sa7tein PWA — 12 node, sudut pandang per role (Customer, Merchant, Kurir, Super Admin).

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
node /Users/vanviakingali/.agents/skills/archify/bin/archify.mjs visual-check docs/design/app-map/app-map.html --json
```

`deliver` wajib exit 0 dan lapor **9/9 checks, 0 error, 0 warning**. Jangan sebut sukses kalau exit non-zero.

Catatan:
- Spec harus tetap lolos `--quality showcase`; kalau gagal, perbaiki spec — jangan turunkan kualitas.
- Viewer UI-nya Inggris (renderer hanya mendukung `en`/`zh-CN`); isi diagram berbahasa Indonesia.
- `visual-check` menulis ulang sidecar di folder ini. Itu wajar.

## Isi peta

- **Aktor:** Customer, Merchant (sudah ada) · Kurir, Super Admin (planned)
- **App:** Customer App, Merchant Console · Courier Console, Super Admin Console (planned)
- **Fondasi:** Redux Store (8 slice · persist 4), Mock Data (`src/data`), Kontrak BE (Xendit/ledger/push), Web plain (Landing + Documentation)
- **Region:** `PWA /app — 53 rute`, `Belum dibangun (planned)`, `Web (plain)`

Sumber kebenaran struktur: `src/App.tsx` (array `routes`), `src/store/`, `src/data/`. Perbarui peta kalau rute/slice/modul berubah.
