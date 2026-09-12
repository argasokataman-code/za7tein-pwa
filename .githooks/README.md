# Git hooks — Sa7tein PWA

## Setup (sekali per clone)

```bash
git config core.hooksPath .githooks
```

Cek terpasang: `git config core.hooksPath` → harus `.githooks`.

## Yang dicek pre-commit

| # | Cek | Detail |
|---|---|---|
| 1 | Forbidden patterns | `dangerouslySetInnerHTML`, `eval()`, `new Function()`, `innerHTML=`, `console.log` di `src/`, `useAppStore`, paket ikon asing, URL gambar eksternal, `preserveAspectRatio="none"` |
| 2 | Line counts | components 600, pages 700, hooks 150, mock data 500 |
| 3 | Lint | `npx oxlint --quiet` |
| 4 | Build | `npm run build` (tsc -b && vite build) |
| 5 | Atlas | `node <atlas> check` (kalau folder `atlas/` ada) |
| 6 | Product governance | Satu PRD aktif, sumber PDF tetap sesuai SHA-256, milestone/decision tersedia, token CSS terdefinisi |
| 7 | Documentation sync | Perubahan app harus memperbarui `src/pages/Documentation.tsx` |

Semua harus lulus. Hook menolak commit jika ada yang gagal.

## Bypass (darurat saja)

```bash
git commit --no-verify -m "pesan"
```

Hanya untuk emergency (server down, fix urgent). Wajib lapor setelahnya.

## Sumber aturan

`.rules.json` (manifest), `AGENTS.md` (narasi + invarian layout/token).
