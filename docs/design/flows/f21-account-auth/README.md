# F21 — Registrasi & Masuk Akun

Workflow pendaftaran akun customer + merchant/kurir: **login Google → nomor WA wajib (E.164), validasi format Level 1** → lanjut per peran. Milestone **M8**; PRD aktif `irbid-mvp-v2-2026-09-21`.

| Berkas | Isi |
|---|---|
| `f21-account-auth.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f21-account-auth.html` | Artefak jadi (generated, di-gitignore) |
| `f21-account-auth.visual-check.*` | Bukti visual-check (generated, di-gitignore) |

## Bisnis (kenapa flow ini ada)

- **Masalah:** nomor WA adalah satu-satunya kanal kontak kurir↔customer dan tujuan fallback `wa.me` (`f11`). Tanpa alur registrasi + verifikasi, nomor palsu langsung jadi order gagal antar.
- **Aktor & nilai:** customer daftar cepat (Google, tanpa bikin sandi) tapi nomor tetap sah karena diverifikasi OTP · merchant/kurir masuk jalur onboarding yang sudah ada (`f16`) · platform dapat kontak yang bisa dihubungi.
- **Skenario:** customer login Google → isi nomor WA → OTP → boleh order (setelah gate top-up 3,5 JOD). Merchant daftar toko → nomor WA → OTP → serahkan ke `f16` (deposit 3,50 JOD + approval Super Admin).

## Alur layar

**Lane Customer:** Onboarding → **Login Google** (menggantikan sandi) → **Nomor WA** (wajib, dinormalisasi E.164) → **Verifikasi nomor** (format + E.164) → profil & PIN → **Boleh order** (gate top-up 3,5 JOD, `f3`).

**Lane Merchant & kurir:** Daftar toko (nama, email, telepon) → Nomor WA toko (E.164) → **Onboarding merchant** (`f16`: form profil toko `/merchant/onboarding`, deposit 3,50 JOD, approval SA, `deliveryConfig`). **Kurir** (PO 2026-09-25): onboarding sendiri `/courier/onboarding` (nama, nomor WA, kendaraan) → masuk `/courier/signin`; rekrutmen tetap milik merchant (C-06).

**Lane Guard:** bukan E.164 / nomor sudah dipakai — tampil sebagai penolakan, bukan jalur lanjut.

## Aturan keras (jangan dilupakan)

- **Nomor WA wajib untuk customer & kurir/merchant** (`source.md:760`) dan disimpan ternormalisasi **E.164** (`:727`) supaya `wa.me` jalan tanpa sanitasi ulang.
- **Google menggantikan sandi, bukan nomor WA** — akun Google tidak memberi nomor telepon; nomor tetap diisi manual lalu diverifikasi OTP (keputusan PO 2026-09-22).
- **Verifikasi nomor = Level 1**: validasi format + simpan E.164. Tidak ada OTP WA / WhatsApp Business API di MVP — Level 2 ditunda (`source.md:728-731`).
- Gate top-up **3,5 JOD** untuk akun baru (`:641`, `:653`) tetap jadi penyaring akun sampah — jangan diganti jadi gate di registrasi.
- Merchant/kurir tidak menyelesaikan deposit/approval di sini: merchant diserahkan ke `f16`. Kurir punya layar onboarding sendiri (`/courier/onboarding`) sebelum masuk (PO 2026-09-25); rekrutmen tetap milik merchant.
- Frontend saja di repo ini: semua layar mock (AGENTS.md §1). Verifikasi OTP, sesi, dan token tidak berjalan sungguhan.

## Terhubung (lihat ../INDEX.json)

`f3-wallet-topup` (gate top-up sebelum order) · `f11-push-notification` (nomor E.164 = tujuan `wa.me`) · `f16-merchant-onboarding` (deposit + approval) · `f20-address-zone` (alamat diisi setelah akun aktif).

## Sumber (jangan dikarang)

- PRD aktif `versions/irbid-mvp-v2-2026-09-21/source.md`: `:760` (nomor WA wajib), `:727` (E.164), `:641`/`:653` (gate top-up), Open Question #24 (kini RESOLVED sebagian oleh PO 2026-09-22)
- Keputusan PO 2026-09-22: login Google untuk customer + nomor WA wajib (validasi format, tanpa OTP)
- Layar yang sudah ada di repo (mock): `SignIn.tsx` (+ tombol Google demo), `SignUp.tsx`, `ForgotPassword*`, `AccountSetup.tsx`, `MerchantSignUp.tsx`, `MerchantOnboarding.tsx` (form profil toko, f16), `MerchantPending.tsx`, `CourierOnboarding.tsx` (profil kurir, PO 2026-09-25), `CourierSignIn.tsx` (kurir, nomor WA + kata sandi)
- **UNRESOLVED (jangan ditebak):** apakah merchant/kurir juga boleh masuk lewat Google · sesi/token & PIN belum punya dasar di PRD · ganti nomor & retensi data · WA Business API (Level 2) tidak dipakai di MVP (PO 2026-09-23) — fallback tetap `wa.me`

## Update

```bash
./scripts/flows-gate.sh f21-account-auth   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: 9/9 checks, 0 error, 0 warning; deliver exit 0; visual-check pass 4 viewport (light + dark).

Terakhir diperbarui: 2026-09-25 — PO 2026-09-25: kurir punya layar onboarding sendiri (`/courier/onboarding`), merchant punya form profil toko terpasang (`/merchant/onboarding`, f16). Sebelumnya (2026-09-22): flow baru dari gap analysis: registrasi & masuk akun (Google + nomor WA, Level 1). **Koreksi:** OTP WA dibatalkan — itu Level 2 (`source.md:728-731`) yang PRD tunda; verifikasi nomor cukup validasi format + E.164. **PO 2026-09-23: WA Business API (Level 2) tidak dipakai di MVP** — fallback tetap `wa.me`. Validate 9/9 pass, deliver exit 0 (spec `4ab5b7f2`, artifact `cf503dad`), visual-check pass (1440x900, 2048x1320 light + dark, overflow 0).
