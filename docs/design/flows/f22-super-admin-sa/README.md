# F22 — Konsol Super Admin (SA)

Konsol **Super Admin**: website penuh **non-PWA** di prefix `/superadmin`, dipakai owner & team untuk mengonfigurasi platform (master zona, role & permission, kill switch) dan mengawasinya (audit trail, laporan pajak, saldo keuntungan, ledger, banding sengketa). Dasar: keputusan PO **2026-09-23** di `docs/product/prd/decision-irbid-mvp.md` (cakupan SA) + `C-12` (panel CS kini role terpisah) + `R-DISPUTE-01` + `R-LEDGER-01` + `C-13` (zona). Repo ini front-end saja — konsol dan angkanya adalah tampilan mock (AGENTS.md §1).

| Berkas | Isi |
|---|---|
| `f22-super-admin-sa.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f22-super-admin-sa.html` | Artefak jadi |
| `f22-super-admin-sa.visual-check.*` | Bukti visual-check |

## Bisnis (kenapa flow ini ada)

- **Masalah:** platform butuh satu tempat untuk **mengonfigurasi** (zona master, role, pajak, kill switch) dan **mengawasi** (audit trail, ledger, banding) tanpa mencampurnya dengan kerja harian CS. Panel CS sudah memutuskan sengketa level-1; pertanyaannya siapa yang mengatur platform dan meninjau putusan itu.
- **Aktor & nilai:** owner & team (SA) memegang kontrol penuh platform · CS tetap fokus operasi harian · customer/merchant punya jalur banding.
- **Skenario:** merchant salah menandai coverage → SA perbaiki poligon master, merchant hanya mengaktifkan zona · CS memutus sengketa → pihak yang tidak puas naik banding ke SA · COD bermasalah sistemik → SA mematikan jalur COD sampai beres.

**Bukan tugas SA:** top-up dan payout customer/merchant berjalan **self-service oleh sistem** — bukan approval SA. SA hanya memantau ledger mereka.

## Alur

**Lane Konsol SA (website penuh, desktop):** Ringkasan menampilkan **saldo keuntungan platform** (boleh ditarik) berdampingan dengan **kewajiban platform** (dana user, tidak boleh disentuh) + status kill switch → Master zona: SA menentukan poligon **Hijazi & Syimali** global → Role & permission: izin per role + akun operator CS dibuat SA.

**Lane Kontrol platform & uang:** Laporan pajak (GST makanan ditanggung merchant, PPh final 0,5% atas fee platform) → Saldo keuntungan: fee terkumpul (0,37 JOD/order) dikurangi biaya operasional, PPh final, dan penarikan sebelumnya → SA menarik saldo bersih itu ke rekening platform.

**Lane Pengawasan & banding:** Audit trail mencatat **semua** aksi SA maupun CS (append-only) → Ledger merchant & customer dipantau **read-only** → Banding sengketa: putusan level-1 CS ditinjau SA (`f15` → `f22` → `f8`).

**Lane Guard role & dana:** Kill switch menghentikan jalur COD, menahan payout, atau mengaktifkan mode maintenance (order baru ditolak). Dana user **tertutup** untuk SA: liability = saldo customer + merchant + tips kurir yang belum di-payout, dan tidak ada jalur penarikan untuk itu.

## Aturan keras (jangan dilupakan)

- **Saldo keuntungan ≠ dana user.** Yang boleh ditarik SA hanya fee terkumpul dikurangi biaya, PPh final, dan penarikan sebelumnya. Saldo customer/merchant/tips tetap liability — tidak pernah bisa ditarik SA.
- **SA bukan approver.** Top-up dan payout self-service oleh sistem; konsol SA hanya memantau ledger.
- **Master zona milik SA, aktivasi milik merchant.** SA menentukan poligon Hijazi/Syimali; merchant hanya `is_active_hijazi` / `is_active_syimali` (`f20`). Poligon disimpan **lat/lng sungguhan** dan dipakai gate coverage lewat `resolveCoverage()` (`src/data/zones.ts`), jadi menggeser titik mengubah alamat mana yang bisa diantar, bukan sekadar gambar. Setelah disimpan, alamat tersimpan divalidasi ulang.
- **Akun operator CS dibuat SA** (`OQ-30`, PO 2026-09-23) — role & permission ditentukan SA; tidak ada self-registration operator.
- **Audit trail menjangkau CS.** Aksi `/admin/*` ikut tercatat lewat jembatan audit di `src/store/index.ts`; tidak ada aksi CS yang boleh lolos.
- **Role pemilik platform tidak bisa dicabut dari UI** — kalau bisa, satu klik salah mengunci seluruh konsol.
- **Kill switch destruktif wajib konfirmasi** di layar, dan setiap perubahan tercatat di audit trail.
- **Pengecualian lebar disengaja.** Konsol SA tidak memakai kolom 430px (dashboard bertabel); pengecualiannya dicatat di `/documentation` §34, bukan bocor diam-diam (AGENTS.md §9). Di bawah 900px sidebar jadi bilah atas.
- **Non-PWA.** Manifest dilepas di `/superadmin` (`index.html`), dan tidak ada `MobileDeviceFrame`.
- Repo ini front-end saja: konsol, angka profit, dan kill switch adalah tampilan mock (AGENTS.md §1).

## Terhubung (lihat `../INDEX.json`)

`f20-address-zone` → master zona `f22` menentukan poligon Hijazi/Syimali; merchant hanya mengaktifkan · `f15-super-admin` → putusan sengketa level-1 CS bisa naik banding ke `f22:appeal` · `f22:appeal` → `f8-dispute` (putusan banding mengubah resolusi) · `f7-ledger-liability` → `f22:ledger` (pantau read-only, tanpa aksi) · `f16-merchant-onboarding` → tenant yang disetujui CS muncul di audit trail SA.

## Sumber (jangan dikarang)

- **Bisnis (dasar utama):** keputusan PO **2026-09-23** — `docs/product/prd/decision-irbid-mvp.md`, bagian *Klarifikasi peran konsol* + *Cakupan Super Admin*. Menetapkan: master zona, role & permission penuh, audit trail, laporan pajak aplikasi (GST makanan + PPh final 0,5%), saldo keuntungan platform, kill switch/maintenance, monitoring ledger read-only, banding sengketa. Menggantikan sebagian `C-12`.
- `C-12` (panel CS = approval tenant, blacklist COD, queue dispute) + PRD §5C (deposit COD 3,50 JOD) + `R-DISPUTE-01` + `R-LEDGER-01` + `C-13` (zona Hijazi/Syimali ≤2 km).
- Kode `src/data/superadmin.ts` — `saZoneGeometry`, `saPermissions`, `saRoles`, `saOperators`, `saAuditLog`, `taxReports`, `mockProfit`, `mockSwitches`, `profitBalance()`, `pphFinalFor()`, `feeGrossFor()`; state di `src/store/slices/superAdminSlice.ts` + jembatan audit di `src/store/index.ts`.
- **Tidak ada `R-SA-*`** — jangan dikarang. Nama field mengikuti `docs/product/schema-draft-v1.md` hanya untuk penamaan, bukan aturan bisnis.
- **UNRESOLVED (jangan ditebak):** tarif pajak final (`OQ-2/3/4`, `OQ-17/18`) · jumlah operator konkret (`OQ-30` dijawab sebagian: akun dibuat SA, role per kebutuhan) · jadwal settlement liability · geometri zona asli (server, bukan kanvas demo).

## Update

```bash
./scripts/flows-gate.sh f22-super-admin-sa   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).

Terakhir diperbarui: 2026-09-23 — **master zona tersambung ke coverage**: poligon lat/lng, kanvas proyeksi dengan dapur + lingkaran 2 km, pratinjau alamat demo, dan validasi ulang alamat setelah simpan. Sebelumnya: konsol SA dibangun penuh (M-SA-1..3): kerangka + Ringkasan, master zona + role/operator + audit trail, lalu pajak + saldo keuntungan + ledger + banding + kill switch. Semua aksi menulis audit trail; aksi CS ikut lewat jembatan audit. Angka tetap mock (AGENTS.md §1).
