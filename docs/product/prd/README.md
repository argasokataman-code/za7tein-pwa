# PRD dan versioning produk

`manifest.json` adalah satu-satunya penunjuk revisi aktif. Semua PDF disimpan di `versions/<id>/source.pdf`. **Label versi yang tercetak di PDF bukan identitas unik**: dua PDF saat ini sama-sama menyebut v1.1. Identitas repo memakai `id` unik, status, sumber, dan rantai `supersedes`.

**Revisi aktif selalu dibaca dari `manifest.json` (`activeRevision`), jangan dihafal dari README ini** — nilai yang ditulis di prosa cepat basi. Per 2026-10-16 revisi aktif adalah `sa7tein-mvp-2026-10-11`; `irbid-mvp-v2-2026-09-21` `superseded`. Kode lama masih banyak mengikuti `radius-mvp-legacy`; jangan menyebut fitur lama sebagai requirement aktif hanya karena sudah ada di UI. Keputusan ini tercatat di `decision-sa7tein-mvp.md`.

## Menambah PRD atau BRS

1. Simpan PDF, Markdown, atau teks di `docs/product/prd/inbox/`.
2. Jalankan `npm run prd:intake -- docs/product/prd/inbox/NamaDokumen.pdf revisi-unik`.
3. Perintah memindahkan sumber ke `versions/revisi-unik/`, mencatat SHA-256, dan membuat formulir analisis, milestone, serta folder `features/`. Ia **tidak** mengaktifkan revisi atau menebak isi dokumen.
4. Agen membaca sumber **seluruhnya**, mengisi `analysis.md` dengan **tabel Requirement delta**: satu baris per ID requirement (`R-*`) berisi kutipan lokasi halaman/section, aturan lama vs baru, dampak UI/mock, kontrak BE, dan status. Setiap fakta wajib punya sumber. Konflik atau angka tak konsisten ditandai `UNRESOLVED`; jangan diselesaikan dengan tebakan.
5. **Define per fitur (wajib, sebelum aktivasi).** Untuk tiap ID di tabel Requirement delta, buat `features/<R-ID>.md` dengan section baku: **Untuk apa · Aturan (tiap baris menyitir `§` sumber) · Aktor & permukaan · Masukan → keluaran · State UI · Kontrak BE · Acceptance (baris `AC<n>` + cara ukur) · UNRESOLVED · Bukti (file:line, self-check, flow)**. Baris pertama dokumen: `# <R-ID> — <judul>`, baris kedua: `Status: complete|partial|blocked` (mesin membacanya). Contoh kanonik: `versions/sa7tein-mvp-2026-10-11/features/R-AUTOSORT.md`.
   - **Aturan inti**: requirement hanya boleh disalin dari tabel delta — tak ada requirement karangan. Acceptance wajib **terukur** (nomor/selector/perintah), bukan "sudah rapi". Yang mustahil dibuktikan di FE mock ditulis sebagai `UNRESOLVED` dengan sumber.
   - **Compare dengan PRD**: himpunan ID di `features/` harus **sama** dengan himpunan ID di tabel delta. Selisih = gerbang gagal.
6. Baru setelah keputusan produk tertulis, ubah `activeRevision`, status revisi lama/baru, dan `supersedes` di manifest. Perbarui AGENTS.md, `.rules.json`, `/documentation`, dan atlas agar tidak meninggalkan kebenaran ganda.
7. Pecah milestone berdasarkan dependensi: model domain dan kontrak → UI pembeli → merchant → kurir → admin → verifikasi lintas role (README §6). Acceptance tiap milestone = **gabungan acceptance fitur** yang dirujuk kolom Requirement IDs, bukan ringkasan bebas. Milestone hanya boleh berstatus `done`/`selesai` bila **semua** fitur rujukannya `Status: complete` — kalau ada yang `partial`/`blocked`, milestone-nya juga `partial` dan sebutkan fitur yang menghambat. Jalankan `npm run governance:check`, `npm run lint`, `npm run build`.

**Intake otomatis berarti scaffolding dan integritas versi otomatis, bukan penilaian semantik PDF tanpa agen.** Generator tidak boleh mengklaim requirement atau milestone sudah dianalisis sebelum manusia/agen mengisi dan memverifikasi sumbernya.

Status: `proposed` → `active` → `superseded`. Hanya satu `active`. PRD baru tidak otomatis mengalahkan PRD aktif berdasarkan nama file atau tanggal. BRS adalah sumber pelengkap: jika bertentangan dengan PRD aktif, catat konflik dan keputusan; jangan diam-diam mengganti aturan.

Kontrak backend masa depan dicatat per requirement: field/tipe, aktor, event, state, error, waktu/SLA, data sensitif, dan pemilik validasi. Repo ini tetap showcase front-end; catatan kontrak tidak berarti API, database, atau pembayaran sudah diimplementasikan.

## Enforcement (governance:check)

`npm run governance:check` menolak commit bila:

- ada sumber di `inbox/` yang belum terdaftar, atau revisi aktif tidak tunggal;
- folder flow tidak cocok dengan `INDEX.json`, spec/README hilang, atau flow tidak terikat revisi PRD aktif;
- **ada ID di tabel Requirement delta yang belum punya `features/<R-ID>.md`** (kecuali terdaftar di ratchet `features/_baseline.json`);
- **file fitur melanggar format**: heading `# <R-ID>`, baris `Status:`, section baku, sitiran `§`, atau tabel `AC<n>` hilang;
- **file fitur memakai ID yang tidak ada di tabel delta** (requirement karangan);
- **milestone `done`/`selesai` punya fitur rujukan yang belum `complete`** (kecuali terdaftar di ratchet).

`features/_baseline.json` bersifat **ratchet: hanya boleh menyusut.** Ia menyimpan `undefinedRequirements` dan `milestonesDoneWithGaps` yang sudah ada sebelum aturan ini berlaku. Begitu file fitur dibuat atau milestone diturunkan statusnya, entri **wajib dihapus** dari baseline — gerbang menolak entri yang sudah usang.
