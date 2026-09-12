# Plan — Merchant Console (E2E UI/UX)

Front-end showcase only. Mock data, Redux state, tanpa backend/API/auth/DB/payment.
Referensi flow: `sa7tein-merchant.vercel.app` (auth-first → dashboard), disesuaikan ke shell PWA 430px.

## Prinsip

- Mock data di `src/data/`, state di Redux. Aturan bisnis = **state yang ditampilkan**, bukan logika.
- Reuse sebelum menggambar ulang. `JourneyLine` (`src/components/OrderStageScreen.tsx:124`) dipakai merchant — jangan duplikat.
- Gaya baru selalu ke `src/styles/_system.scss` (namespace `.merchant-*`). Jangan sentuh `_app.scss` borongan.
- Tanpa dependency baru. Token dari `_tokens.scss`, tanpa nilai mentah.
- Route prefix `/merchant/*` biar tidak tabrakan 46 route customer.
- Bar `fixed` wajib `max-width: var(--shell-max); margin-inline: auto`.
- Ikuti batas baris `.rules.json`: page ≤700, component ≤600, hook ≤150, data ≤500.

## Route & Peta Layar

| Route | Layar |
|---|---|
| `/merchant/signin` | Masuk |
| `/merchant/signup` | Daftar |
| `/merchant/pending` | Menunggu persetujuan (state) |
| `/merchant` | Dashboard |
| `/merchant/orders` | Antrean order |
| `/merchant/orders/:id` | Detail order |
| `/merchant/menu` | Menu & Stock |
| `/merchant/couriers` | Kelola kurir |
| `/merchant/settings` | Setelan toko |

---

## M0 — Fondasi

Tujuan: shell, navigasi, tipe, data, slice siap sebelum layar.

- `src/components/layout/MerchantBottomNav.tsx` — 4 tab: Dashboard, Order, Kurir, Setelan (turunan konsep `BottomNav`, bukan copy).
- Daftarkan routes sebagai tuple `[path, Page]` di array `routes` `src/App.tsx`.
- `src/types.ts` — `MerchantOrderStatus`, `MerchantOrder` (turunan `Order` + `OrderStage`), jangan duplikat tipe domain.
- `src/data/merchantOrders.ts` — `merchantOrders: MerchantOrder[]`, `QUEUE_TABS`.
- `src/store/slices/merchantSlice.ts` — `isActive`, `todayOrderCount`, `queue[]`. Masuk `combineReducers`. Tidak dipersist (mock).
- `_system.scss` — namespace `.merchant-*`.

Done-when: 4 route bisa dibuka, nav ganti tab, `npm run build` 0 error, overflow-x 0 di 390 & 1440.

## M1 — Auth Merchant

- **Halaman sendiri, terpisah dari customer** — jangan reuse `/signin`/`/signup`. Route merchant tetap `/merchant/*`.
- Reuse hanya *pola*-nya: `app-shell`, react-hook-form + zod dari `SignIn.tsx` / `SignUp.tsx`.
- Layar Sign in + Create account (tab toggle, sesuai referensi).
- Status "Menunggu persetujuan" tampil sebagai state layar, bukan logika.

Done-when: tab toggle jalan, validasi zod, submit → `/merchant`.

## M2 — Dashboard

- Toggle Buka/Tutup (reuse `toggle-*`, `_app.scss:8795`).
- Kartu kuota harian `7 / 10` dari `mockMerchant.dailyLimit` — state tampilan.
- Statistik: Antrean / Diproses / Selesai / Batal (dari `merchantOrders`).
- Kartu lokasi + foto toko.
- Ringkasan order terbaru → link ke M3.

Done-when: toggle ubah label status, angka kuota dari data (bukan literal JSX), lebar shell 430px.

## M3 — Order: Antrean + Detail

- Tab antrean: Antrean / Diproses / Selesai / Batal.
- Kartu order: kode, item, total (`rupiah()`), jarak (`formatDistance()`), zona (`zoneFor()`).
- Detail order reuse `JourneyLine` (`src/components/OrderStageScreen.tsx:124`) — jangan gambar ulang.
- Aksi: Terima / Tolak, slider estimasi masak 15–30 menit.

Done-when: `JourneyLine` dipakai (bukan SVG baru), slider 15–30, aksi ubah `MerchantOrderStatus`, tidak ada duplikasi `OrderStageScreen`.

## M4 — Menu & Stock

- List item (turunan pola `FoodCard`), stats: total / stok rendah / habis.
- Aksi +10 / −1, edit, hapus.
- Tambah item (react-hook-form + zod).

Done-when: perubahan stok cermin ke angka, form validasi, list >1 kategori.

## M5 — Kelola Kurir

- List `mockCouriers`, badge status (`at_store` / `delivering` / `offline`).
- Batas `MAX_COURIERS_PER_MERCHANT` (3) tampil sebagai state.
- Tambah/hapus kurir (mock).

Done-when: badge sesuai status, hitungan `x / 3`, tidak ada nilai 3 hardcoded di JSX.

## M6 — Setelan Toko

- Profil toko: nama, HP, alamat + peta.
- `useLeafletMap` **refactor** agar terima origin custom (sekarang hardcoded `mockMerchant → user`), tanpa merusak pemakaian customer.
- Info rekening (`mockMerchant.bank`), jam buka/tutup, tier (`free`/`pro`) + kuota.
- Keluar (pola modal `Profile.tsx`).

Done-when: peta render tanpa error, pin center benar, refactor tidak merusak layar customer.

## M7 — Polish & Verifikasi

- Responsif 390px & 1440px, overflow horizontal 0.
- Semua fixed bar dibatasi kolom.
- Tanpa emoji, tanpa warna di luar token, tanpa `var()` tak terdefinisi.
- `npm run build` 0 error, `npm run lint`.
- **Integrasi wajib ke `/documentation`** (halaman dokumentasi customer yang sudah ada): tambahkan bagian merchant — daftar layar, route, komponen yang dipakai ulang, dan keputusan shell/nav merchant.
- Record atlas `TASK`/`FEAT` per milestone.

---

## Urutan & Dependency

M0 → M1 → M2 → M3 (inti). M4–M6 boleh paralel setelah M2. M7 terakhir.

## Keputusan

1. **Auth merchant terpisah** — halaman sendiri di `/merchant/*`, bukan reuse `/signin`. ✅
2. **Wajib terintegrasi ke `/documentation`** — halaman docs customer yang sudah ada diperluas dengan bagian merchant. ✅
3. Nav: bottom-nav (rekomendasi, mobile 430px) atau ikut top-nav referensi. ⏳ belum diputuskan.
