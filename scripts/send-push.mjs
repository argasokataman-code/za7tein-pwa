/**
 * Kirim Web Push (VAPID) ke langganan demo — pembuktian ujung-ke-ujung.
 *
 * Skrip dev (bukan runtime app). Kunci VAPID diisi dari `.env.local`:
 *   VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 * URL + anon key Supabase dibaca dari `src/api/supabase.ts`.
 *
 * Pakai:
 *   npm run push:send -- --title "Pesanan siap" --body "Sate Ayam sedang dimasak" --url /customer/orders
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import webpush from 'web-push'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(resolve(root, 'src/api/supabase.ts'), 'utf8')
const url = process.env.VITE_SUPABASE_URL || src.match(/DEFAULT_URL = '([^']+)'/)?.[1]
const anon =
  process.env.VITE_SUPABASE_ANON_KEY || src.match(/DEFAULT_ANON_KEY\s*=\s*'([^']+)'/)?.[1]
const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const email = process.env.VITE_DEMO_CS_EMAIL || 'cs@sa7tein.app'
const password = process.env.VITE_DEMO_CS_PASSWORD || 'demo1234'
const userId = process.env.PUSH_USER_ID || '1'

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const title = arg('title', 'Sa7tein')
const body = arg('body', 'Ada pembaruan pesanan.')
const link = arg('url', '/customer/home')

if (!url || !anon || !publicKey || !privateKey) {
  console.error(
    'Butuh VAPID keys. Jalankan: npm run push:send -- --body "..."  (memuat .env.local)',
  )
  process.exit(1)
}
webpush.setVapidDetails('mailto:support@sa7tein.app', publicKey, privateKey)

const tokenRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: anon, 'content-type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
if (!tokenRes.ok) {
  console.error('Login gagal', tokenRes.status)
  process.exit(1)
}
const token = (await tokenRes.json()).access_token

const listRes = await fetch(
  `${url}/rest/v1/push_subscriptions?select=id,endpoint,p256dh,auth&user_id=eq.${userId}`,
  { headers: { apikey: anon, Authorization: `Bearer ${token}` } },
)
const subs = await listRes.json()
if (!Array.isArray(subs) || subs.length === 0) {
  console.log(`Tidak ada langganan push untuk user ${userId}. Aktifkan push di app dulu.`)
  process.exit(0)
}

const payload = JSON.stringify({ title, body, url: link, tag: `push-${Date.now()}` })
let sent = 0
for (const s of subs) {
  try {
    await webpush.sendNotification(
      { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
      payload,
    )
    sent += 1
    console.log(`OK  -> subscription ${s.id} (${String(s.endpoint).slice(0, 48)}…)`)
  } catch (error) {
    const code = error?.statusCode
    console.warn(`GAGAL subscription ${s.id}: ${code || error?.message}`)
    if (code === 404 || code === 410) {
      await fetch(`${url}/rest/v1/push_subscriptions?id=eq.${s.id}`, {
        method: 'DELETE',
        headers: { apikey: anon, Authorization: `Bearer ${token}`, Prefer: 'return=minimal' },
      })
      console.warn(`  langganan kedaluwarsa dihapus (${code})`)
    }
  }
}
console.log(`Terkirim: ${sent}/${subs.length}`)
