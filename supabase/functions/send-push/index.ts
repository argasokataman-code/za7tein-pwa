/**
 * send-push — pengirim Web Push (VAPID) yang selalu hidup.
 *
 * Dipicu **Database Webhook** Supabase: setiap baris baru di `public.notifications`
 * memanggil function ini, lalu fan-out ke semua langganan `push_subscriptions`
 * milik `notifications.user_id`. Inilah yang membuat notifikasi tetap masuk saat
 * ponsel tidur — pengirimnya server, bukan laptop.
 *
 * Rahasia (set sekali):
 *   supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:support@sa7tein.app
 * `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` disuntik platform otomatis.
 *
 * Deploy: supabase functions deploy send-push
 * Webhook: Dashboard → Database Webhooks → tabel `notifications`, event Insert,
 *          tipe Edge Function `send-push`, header Authorization: Bearer <service_role>.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:support@sa7tein.app'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
}

interface NotificationRecord {
  id: number
  user_id: number | null
  title: string
  body: string
  audience: string
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: NotificationRecord
}

/** Tautan yang dibuka saat notifikasi diklik — per peran, bukan satu halaman. */
function audienceUrl(audience: string): string {
  switch (audience) {
    case 'merchant':
      return '/merchant'
    case 'courier':
      return '/courier'
    case 'cs':
      return '/admin'
    default:
      return '/customer/home'
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return Response.json({ error: 'VAPID keys belum di-set' }, { status: 500 })
  }

  let payload: WebhookPayload
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: 'body bukan JSON' }, { status: 400 })
  }

  const n = payload?.record
  if (payload?.type !== 'INSERT' || payload?.table !== 'notifications' || !n?.user_id) {
    return Response.json({ skipped: true })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', n.user_id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!subs?.length) return Response.json({ sent: 0, reason: 'tidak ada langganan' })

  const message = JSON.stringify({
    title: n.title,
    body: n.body,
    url: audienceUrl(n.audience),
    tag: `notif-${n.id}`,
  })

  const results = await Promise.allSettled(
    subs.map(async (s: { id: number; endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          message,
        )
        return s.id
      } catch (err) {
        // 404/410 = langganan mati (uninstall/izin dicabut) → bersihkan barisnya.
        const status = (err as { statusCode?: number })?.statusCode
        if (status === 404 || status === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', s.id)
        }
        throw err
      }
    }),
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return Response.json({ sent, total: subs.length })
})
