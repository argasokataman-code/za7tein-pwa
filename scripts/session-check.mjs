// Self-check sesi demo: kegagalan login **tidak boleh** ikut ter-cache.
//
// Dulu `if (!session) session = signInToken(...)` menyimpan promise yang reject,
// jadi satu gangguan jaringan membuat semua permintaan berikutnya gagal sampai
// app dimuat ulang. Jalankan:
//   node --import ./scripts/lib/ts-resolve.mjs scripts/session-check.mjs
import assert from 'node:assert/strict'

let calls = 0
globalThis.fetch = async () => {
  calls += 1
  if (calls === 1) throw new Error('jaringan mati')
  return { ok: true, status: 200, json: async () => ({ access_token: 'tok-1' }) }
}

const { sessionFor } = await import('../src/api/supabase.ts')

await assert.rejects(sessionFor('demo@sa7tein.app', 'x'), /jaringan mati/)
assert.equal(calls, 1)

const token = await sessionFor('demo@sa7tein.app', 'x')
assert.equal(token, 'tok-1', 'percobaan kedua harus benar-benar memanggil ulang')
assert.equal(calls, 2, 'kegagalan tidak boleh tersimpan di cache')

await sessionFor('demo@sa7tein.app', 'x')
assert.equal(calls, 2, 'sesi yang berhasil dipakai ulang, bukan login tiap panggilan')

console.log('ok session-check: kegagalan auth dibuang dari cache, sesi sukses dipakai ulang')
