# F26 — Quick: dispatch & kurir partner (M6)

Alur **Quick**: order diterima merchant → estimasi prepare → aplikator **dispatch**
kurir partner → approve / reject ber-alasan → pickup (COD Quick: talangi tunai) →
antar satu order → **100% fee Quick** ke partner. Jalur **Regular** (batch + kurir
inhouse) ada di `../f25-batch-lifecycle/`.

| Berkas | Isi |
|---|---|
| `f26-quick-dispatch.json` | Spesifikasi diagram (workflow) — sumber render |
| `f26-quick-dispatch.milestones.md` | Rencana milestone (sumber kebenaran render, langkah Q01–Q10) |
| `f26-quick-dispatch.html` | Hasil render (gitignored) |
| `f26-quick-dispatch.visual-check.*` | Bukti visual-check (gitignored) |

## Alur

- **Main path:** Q01 `prepare siap` → Q02 `assignment_sent` → Q03 `approved` → Q04
  `pickup` → Q07 `delivering` → Q08 `order_completed` → Q09.
- **Cabang tolak:** Q03 →(`rejected{reason}`)→ Q05 →(`dispatch ulang`)→ Q02.
- **Cabang tanpa respons:** Q03 →(`tanpa respons`)→ Q06 (pengganti + SP + off) →(`pengganti`)→ Q02.
- **Cabang tanpa kandidat:** Q02 →(`tak ada kandidat`)→ Q10 Quick tak tersedia.

## Aturan keras (jangan dilupakan)

- Kurir partner bekerja **satu order per waktu** (COU-15) — Quick **tidak pernah** masuk batch (BR-B01).
- Kandidat dispatch wajib **online, tidak busy, tidak suspend, lokasi segar**; antrean **idle terlama dulu** dibatasi **jarak** (usulan PRD, OPEN-11).
- Reject **wajib ber-alasan** — submit aktif setelah alasan diisi (COU-18).
- Tanpa respons sampai prepare habis → **pengganti otomatis + SP + punishment + status off**.
- **100% delivery fee Quick** ke partner (multiplier × fee merchant); COD Quick **bukan hold** — kurir menalangi tunai ke merchant saat pickup.
- Fee **Regular** tetap ke kurir **inhouse** lewat `f25: fee_dana`; Quick tidak lewat batch.

## Terhubung (lihat `../INDEX.json`)

`f12-merchant-console:terima → f26:prepare` (cabang Quick); `f25-batch-lifecycle:quick_estimasi → f26:dispatch` (jalur partner didalami di sini).

## Sumber (jangan dikarang)

- PRD `sa7tein-mvp-2026-10-11` §7.3, §9.3, §9.4 (usulan), §9.5, §11 (MER-12), §12 (COU-15..18), §13 (OPS-13), §16.3, §18 — `docs/product/prd/versions/sa7tein-mvp-2026-10-11/`
- Milestone **M6** (kurir partner + dispatch) — `versions/sa7tein-mvp-2026-10-11/milestones.md` · dampak per layar — `ui-impact.md:60` (`f26-quick-dispatch` dipesan di situ)
- Flow saudara: `../f25-batch-lifecycle/` (Regular inhouse + gambaran dua jalur)
- Bukti tiap langkah: `f26-quick-dispatch.milestones.md` (menunjuk `analysis.md:35/36/38/43/46/72`)

## UNRESOLVED (jangan ditebak)

- **Penerbit SP belum diputuskan PO**: ops manual (§18) vs otomatis rule; **halaman ops M6 belum dibangun**. Dicatat apa adanya, bukan diputuskan.
- **OPEN-11 algoritma dispatch** masih terbuka — flow menggambar **usulan** PRD (idle terlama + batas jarak + tie-break).
- **Pemulihan "Quick tak tersedia"**: jalur lanjut (batal / refund / ubah ke Regular) belum diputuskan.
- **Parameter ops** (ambang jarak, kesegaran lokasi, multiplier Quick) = config ops, bukan nilai tetap.

## Update

Setiap perubahan perilaku Quick wajib memperbarui README ini **dan** `f26-quick-dispatch.milestones.md` + JSON di commit yang sama, lalu lolos `./scripts/flows-gate.sh f26-quick-dispatch`.
