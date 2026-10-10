/*
 * Handler Web Push (VAPID) untuk service worker.
 *
 * `generateSW` (workbox) tidak bisa menambah listener sendiri, jadi berkas ini
 * diimpor ke `sw.js` lewat `workbox.importScripts: ['push-sw.js']`. Isinya hanya
 * dua event yang tak bisa digenerate: `push` (tampilkan notifikasi) dan
 * `notificationclick` (fokuskan/buka jendela).
 */
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'Sa7tein'
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || 'Ada pembaruan pesanan.',
      icon: data.icon || '/icons/sa7tein-192x192.png',
      badge: data.badge || '/icons/sa7tein-96x96.png',
      tag: data.tag,
      data: { url: data.url || '/customer/home' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/customer/home'
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of all) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
      return undefined
    })(),
  )
})
