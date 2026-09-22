# F12 — Merchant Console (sisi dapur)

Workflow sisi merchant: toggle toko, antrean order, terima/tolak, kurir sendiri. **Belum di-develop sebagai flow backend** — sumber gambaran: `docs/plan-merchant.md` (FE showcase M0–M7) + PRD `irbid-mvp-v2-2026-09-21`.

| Berkas | Isi |
|---|---|
| `f12-merchant-console.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f12-merchant-console.html` | Artefak jadi |
| `f12-merchant-console.visual-check.*` | Bukti visual-check |

## Alur

**Lane Toko & Antrean:** Buka/Tutup (`isActive`, state tampilan) → Antrean order (kode · total · zona ≤2 km) → Terima/Tolak (`MerchantOrderStatus`) → Estimasi masak (timer **15/25/35 m** — source.md; catatan: `plan-merchant.md` FE memakai slider 15–30, **PRD aktif menang**) → Siap diambil (2-way confirm).

**Lane Kurir milik merchant:** Kelola kurir (maks 3 · mock) → **Pilih kurir sendiri** — edge emphasis ke `kurir match → hold_cut` (sambungan ke F2).

**Lane Guard:** Order macet (timer habis tanpa checkpoint) → reassign sendiri / batal → refund customer dari dana hold.

## Aturan keras (jangan dilupakan)

- **Platform TIDAK assign kurir** (C-06) — courier = karyawan merchant, digaji merchant, ongkir 100% merchant (C-07). Maks `MAX_COURIERS_PER_MERCHANT` (3).
- Detail order reuse `JourneyLine` (`OrderStageScreen`) — jangan gambar ulang.
- Kuota `7 / 10` = state tampilan, bukan counter.

## Terhubung (lihat `../INDEX.json`)

`f1:dapur → f12` (drill-down antrean); `f12:assign → f2` (`hold_cut`); `f12 → f13` (tugas kurir); macet → `f8` (dispute) / refund.

## Sumber (jangan dikarang)

- `docs/plan-merchant.md` M0–M7 (FE showcase, `merchantSlice`: `isActive`, `todayOrderCount`, `queue[]`)
- `C-06`, `C-07`, `C-17` — `analysis.md` · `R-COD-01` events `hold_*` · Milestone M4/M5/M11 — `versions/irbid-mvp-v2-2026-09-21/milestones.md`
- **UNRESOLVED (jangan ditebak):** OQ-30 — merchant sbg pihak bersengketa; nav merchant (bottom/top) belum diputuskan

## Update

```bash
./scripts/flows-gate.sh f12-merchant-console   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).
