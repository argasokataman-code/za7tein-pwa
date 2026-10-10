# Todo — Audit 015 (role Admin) fix pass

Sumber temuan: `anti-slop/audit-015-2026-10-10.md`. Status: **SEMUA SELESAI**.

- [x] #1 HIGH — hapus `opacity:.85` di `.admin-res-effect` (kontras AA)
- [x] #2 MED — donut center nabrak cincin (guard `.chart-donut-center`)
- [x] #3 MED — `.admin-statline` → 2×2 grid
- [x] #4 MED — hero liability 2 baris terkendali + buang duplikasi center donut
- [x] #5 MED — `<select>` Merchant → picker bottom-sheet (reuse `.dispute-picker`)
- [x] #6 MED — catatan lepas antar kartu → `.admin-footnote`
- [x] #7 MED — sapu catatan internal (C-06, M9, OQ-29, F16, AGENTS §1, "append-only")
- [x] #8 MED — AdminOnboarding lonceng nyala (judul seragam)
- [x] #9 MED — putusan sengketa: 1 primer, sisanya outline
- [x] #10 LOW — `jod()` pakai pemisah ribuan
- [x] #11 LOW — badge `--open` beda dari `--investigating`
- [x] #12 LOW — `.admin-card-sub`/`.admin-note` → `--text-sm`
- [x] #13 LOW — hapus deklarasi mati `.admin-title`/`.admin-header`
- [x] #14 LOW — baris ledger sejajar (ref ke baris sekunder)
- [x] #15 LOW — tombol onboarding label pendek (stack)
- [x] #16 LOW — `ExchangeRateNote` hapus dari halaman non-uang
- [x] #17 LOW — slider refund ber-gaya app + nilai terikat opsi

Verifikasi: `./scripts/verify.sh` lulus · `npm run scan` 0 FAIL · `browser-gate --role admin --pwa --strict` 14/14.
Laporan fix: `anti-slop/audit-015-fix-2026-10-10.md`.
