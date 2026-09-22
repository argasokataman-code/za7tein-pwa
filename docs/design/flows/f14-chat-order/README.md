# F14 — Chat Order

Chat per order: layar chat dibuka saat order placed, bubble pesan antara customer, merchant, dan kurir (maksimal 3 peserta), lalu chat jadi read-only setelah order `done` + N hari. Sumber gambaran: `docs/product/schema-draft-v1.md` entri 14 + PRD `irbid-mvp-v2-2026-09-21`. Repo ini front-end saja — layar chat adalah tampilan mock, pesan tidak benar-benar terkirim (AGENTS.md §1).

| Berkas | Isi |
|---|---|
| `f14-chat-order.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f14-chat-order.html` | Artefak jadi |
| `f14-chat-order.visual-check.*` | Bukti visual-check |

## Alur

**Lane Layar chat (app):** Order placed (buka chat dari layar order) → kurir masuk thread lewat event `courier_match` (sambungan `f12` → `f13`) → pesan gagal kirim → retry manual/otomatis.

**Lane Daftar chat & status pesan:** Daftar chat per order (`orderId`, peserta ≤3) → tulis pesan (bubble: sender, body, at) → status terkirim → badge dibaca (`readAt`) → order done + N hari → chat read-only.

**Lane Guard tampilan:** hanya peserta (≤3) yang melihat thread, `dispute_opened` dari F8 menandai thread priority, dan rate limit/abuse tampil sebagai pesan ditolak.

## Aturan keras (jangan dilupakan)

- Thread dibuat saat order placed (keputusan HEBOH: simplify) — bukan menunggu tahap `prepare`; participants customer/merchant/courier, kurir masuk saat event `courier_match` bila belum match.
- Akses hanya peserta thread (maksimal 3 peserta); non-peserta tidak melihat thread, rate limit/abuse tampil sebagai pesan ditolak di layar.
- Dispute (F8) menaikkan prioritas thread lewat flag `dispute_opened` — jangan buat thread chat terpisah untuk sengketa.
- Retensi: chat jadi read-only setelah order `done` + N hari — nilai N belum ditentukan (lihat UNRESOLVED).
- Repo ini front-end saja: layar chat, retry, dan badge dibaca adalah tampilan mock (AGENTS.md §1).

## Terhubung (lihat `../INDEX.json`)

`f8-dispute` → flag `dispute_opened` thread priority; `f12-merchant-console` → `f13-courier-view` (event `courier_match` menambah kurir ke participants); `f11-push-notification` → notifikasi chat masuk (belum dipastikan, lihat UNRESOLVED).

## Sumber (jangan dikarang)

- `docs/product/schema-draft-v1.md` entri 14 — tabel `chat` (`orderId`, `participants`, `lastMessage`, `lastAt`) dan `chatMessage` (`sender`, `body`, `at`, `readAt`)
- PRD `irbid-mvp-v2-2026-09-21` — `docs/product/prd/versions/`
- **Dasar: `C-18`** — in-app chat dipertahankan (keputusan PRD aktif); `C-12` — sengketa lewat jalur dispute, bukan chat baru. Tidak ada `R-*` khusus chat — **jangan dikarang**; skema `orderChat` di `schema-draft-v1.md` entri 14 hanya dipakai untuk nama field
- **UNRESOLVED (jangan ditebak):** retensi chat setelah order `done` (N hari archiving belum ditentukan) · media/gambar message (schema hanya `body: string`) · notifikasi push incoming chat (F11 ada, belum dipastikan)

## Update

```bash
./scripts/flows-gate.sh f14-chat-order   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).

Terakhir diperbarui: 2026-09-22 — label `R-CHAT-01 synthetic` diganti dasar **`C-18`** (in-app chat dipertahankan) + `C-12`; skema draft entri 14 hanya untuk nama field. Validate 9/9 pass, deliver exit 0 (spec `36eea886`, artifact `b7755122`), visual-check pass (1440x900, 2048x1320 light + dark, overflow 0).
