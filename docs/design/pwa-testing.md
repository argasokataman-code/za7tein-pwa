# Menguji Sa7tein sebagai PWA murni — Brave + CDP

Dokumen ini menjelaskan cara menyiapkan klon Brave (`brave-debug`) supaya pengujian
mengukur **aplikasi PWA yang sesungguhnya**, bukan halaman web di dalam jendela desktop.
Setiap angka di bawah adalah hasil pengukuran, bukan perkiraan.

Gerbang otomatisnya: `scripts/browser-gate.mjs` (mode `--pwa`). Aturan wajibnya di
`AGENTS.md` §8 dan `.rules.json` → `browserTesting`.

---

## 1. Kenapa tidak cukup buka `npm run dev` di tab biasa

| Masalah | Akibat |
|---|---|
| `devOptions.enabled: false` di `vite.config.ts` | **Service worker tidak ada di dev server.** Semua pengujian cache/offline di `npm run dev` mengukur sesuatu yang tidak akan pernah jalan di produksi |
| Tab biasa | `display-mode` tetap `browser`. App **memang** bercabang pada ini: `app/part-01.scss:499` dan `app/part-06.scss:221` hanya menambah padding safe-area saat `standalone`, dan `Onboarding.tsx:88` menyembunyikan tombol install hanya saat `standalone` |
| Jendela klon apa adanya | Ukurannya 500×600 saat itu — angka apa pun yang diambil dari situ tidak ada hubungannya dengan kolom 430px |
| Klik lewat `eval("el.click()")` | Menembus overlay dan lapisan apa pun, jadi "berhasil" tidak membuktikan apa pun |

---

## 2. Menyiapkan klon: jendela app-mode

`display-mode: standalone` **tidak bisa** dibuat lewat CDP — `Emulation.setEmulatedMedia`
tidak mendukung fitur `display-mode` (diuji: `standalone` tetap `false` walau diset dan
di-reload). Satu-satunya jalur adalah flag `--app=` saat launch, yang membuka jendela
tanpa chrome browser:

```bash
BRAVE_EXTRA_ARGS="--app=http://localhost:4173/customer/home --touch-events=enabled" \
  ~/.local/share/brave-debug-mcp/bin/launch.sh --fresh
```

Hasil terukur: `matchMedia('(display-mode: standalone)').matches` → **true**,
`(display-mode: browser)` → **false**, `outerWidth 397` vs `innerWidth 390` (hanya border
jendela, tanpa tab bar / address bar). `--touch-events=enabled` membuat
`'ontouchstart' in window` → **true**.

Klon tetap memakai profil terisolasi (`~/.local/share/brave-debug-mcp/bin/profile`), jadi
service worker, cache, dan localStorage tidak menyentuh browser utama.

---

## 3. Menyiapkan server: hasil build, bukan dev

Service worker hanya ada di build:

```bash
npm run build
npm run preview        # http://localhost:4173
```

Gerbang sudah tahu ini: dengan `--pwa`, base default-nya `http://localhost:4173`.

---

## 4. Menjalankan gerbang

```bash
node scripts/browser-gate.mjs --route /home --pwa --strict --click
node scripts/browser-gate.mjs --route /home --pwa --offline
node scripts/browser-gate.mjs --role customer --pwa
```

| flag | arti |
|---|---|
| `--pwa` | mode PWA murni: wajib app-mode, input sentuh, safe-area, syarat service worker |
| `--offline` | tiap rute diukur dua kali: online, lalu offline (`Network.emulateNetworkConditions`) |
| `--click` | klik tiap kontrol dari depan; `--pwa` memakai `Input.dispatchTouchEvent` (jari), bukan mouse |
| `--inset-top` / `--inset-bottom` | nilai safe-area yang dipaksa (default 59 / 34, seperti iPhone berponi) |
| `--width` | satu lebar saja; default mengukur **390 dan 1440** |
| `--json` | laporan mentah untuk dibaca mesin |

`--pwa` berhenti dengan kode `2` dan mencetak perintah launch yang benar kalau tabnya bukan
jendela app-mode. Lebih baik berhenti daripada mengukur angka yang tidak berlaku.

---

## 5. Yang dibuktikan tiap override

| Yang dipaksa | Cara | Bukti terukur |
|---|---|---|
| Viewport ponsel | `Emulation.setDeviceMetricsOverride({width:390,height:844,deviceScaleFactor:2,mobile:true})` | `innerWidth 390`; gate **FAIL** kalau `innerWidth` ≠ lebar yang diminta |
| Jendela OS ikut menyesuaikan | `Browser.getWindowForTarget` + `Browser.setWindowBounds` | jendela 520×940, bukan 500×600 — yang di layar = yang diukur |
| `display-mode: standalone` | flag launch `--app=` | `standalone: true` |
| Touch event | flag launch `--touch-events=enabled` | `'ontouchstart' in window: true` |
| Input jari sungguhan | `Input.dispatchTouchEvent` (touchStart → 60 ms → touchEnd, satu sesi CDP) | halaman menerima `pointerdown` dengan `pointerType: "touch"` lalu `touchstart` |
| Safe-area | `Emulation.setSafeAreaInsetsOverride({insets:{top:59,bottom:34}})` | `env(safe-area-inset-top)` = **59px**, `-bottom` = **34px** |
| Service worker | `navigator.serviceWorker.getRegistrations()` + `caches.keys()` | 1 registrasi scope `/`, `active`, `controller` ada, cache `workbox-precache-v2-…` berisi **30 entri / 2,49 MB** |
| Installable | `Page.getInstallabilityErrors` | `[]` (tidak ada penghalang install) |
| Manifest per peran | `Page.getAppManifest` | `/manifest-customer.json`, `errors: []` |
| Offline sungguhan | `Network.emulateNetworkConditions({offline:true})` lalu navigasi ke URL yang **belum pernah dibuka** | `/customer/favorites?offline=1` tetap merender (`shell: true`, 190 karakter) |

Kontrol nonaktif dilewati, bukan dihitung sebagai klik mati. Titik tengah tiap elemen
di-hit-test dengan `document.elementFromPoint`; kalau tertutup elemen lain, gate melaporkan
`OVERLAY` alih-alih mengklaim berhasil.

---

## 6. Yang TIDAK bisa dibuktikan di sini (jujur)

- **`navigator.maxTouchPoints` tetap 0** dan `(pointer: coarse)` / `(hover: none)` tetap
  `false`, walau `Emulation.setTouchEmulationEnabled` diset dan `--touch-events=enabled`
  dipakai. `Emulation.setEmulatedMedia` juga menolak fitur `pointer`/`hover` (yang bekerja
  hanya `prefers-color-scheme`). Jadi CSS yang bergantung pada `pointer: coarse` **tidak
  bisa diverifikasi** di klon ini. Saat ini tidak ada stylesheet yang memakainya.
- **Instalasi OS sungguhan** (ikon launcher, window controls, splash OS) — itu tindakan
  browser/OS, bukan halaman.
- **Gesture perangkat keras** (swipe dari tepi, pull-to-refresh fisik, keyboard).
- **`display-mode` selain standalone** (mis. `minimal-ui`, `fullscreen`) — hanya `browser`
  dan `standalone` yang bisa dicapai.

Untuk tiga hal itu, validasi tetap butuh perangkat nyata.

---

## 7. Jebakan yang sudah memakan waktu

**Setelah `npm run build`, muat pertama masih menyajikan shell LAMA dari precache.**
Service worker baru mengambil alih lalu memuat ulang (perilaku `autoUpdate`), tapi
pengukuran yang jalan terlalu cepat akan mengukur build sebelumnya. Gejalanya pernah
muncul sebagai "scroller bersarang di 1440px" yang hilang begitu diukur ulang. Muat satu
kali lagi sebelum mencatat angka.

**Service worker bisa terdaftar, `active`, dan `controlling` sambil tetap tidak berguna.**
Ini pernah terjadi sungguhan: `includeAssets` di `vite.config.ts` tumpang tindih dengan
`globPatterns`, sehingga aset yang sama masuk dua kali (satu tanpa revision, satu dengan
`?__WB_REVISION__`). Workbox melempar
`add-to-cache-list-conflicting-entries` dari dalam `precacheAndRoute`; karena bundel SW
saat itu berbentuk AMD dengan `.then()` **tanpa `.catch()`**, error itu ditelan diam-diam.
Hasilnya: `caches.keys()` kosong, tidak ada fetch handler, offline mati total — dan tidak
ada satu pun pesan kesalahan yang terlihat.

Karena itu gate `--pwa` sekarang menuntut **cache tidak kosong**, bukan sekadar
"SW terdaftar". Kalau kamu mengubah `globPatterns`/`includeAssets`, jalankan
`--pwa --offline` dan pastikan dua-duanya lolos.

---

## 8. Daftar periksa perubahan yang menyentuh PWA

1. `npm run build` — 0 error.
2. `npm run preview` jalan.
3. Klon di app-mode (`--app=` + `--touch-events=enabled`).
4. `node scripts/browser-gate.mjs --route <path> --pwa --strict` — lolos.
5. `node scripts/browser-gate.mjs --route <path> --pwa --offline` — lolos (membuktikan
   precache benar-benar melayani, bukan cuma terdaftar).
6. `--click` untuk kontrol yang kamu ubah.
7. Tempel keluaran gate (per-rute PASS/FAIL + angka) di laporan. Sebut angka, bukan kesan.
