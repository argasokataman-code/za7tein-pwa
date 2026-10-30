import toast from 'react-hot-toast'

export type UpdateResult = 'updated' | 'current' | 'unsupported'

/**
 * Muat ulang yang benar-benar memuat versi baru.
 *
 * `location.reload()` saja berbahaya di PWA: kalau service worker lama masih
 * memegang `index.html` lama (aset hashed-nya sudah dihapus deploy baru),
 * reload mengembalikan halaman yang sama dan splash boot menggantung. Jadi
 * lepas worker + cache dulu, lalu navigasi dengan URL baru supaya cache HTTP
 * tidak menyajikan index basi.
 */
async function reloadFresh() {
  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((reg) => reg.unregister()))
    }
  } catch {
    // Cache/worker tidak bisa diakses: reload biasa tetap lebih baik daripada diam.
  }
  const base = window.location.href.split('#')[0]
  const separator = base.includes('?') ? '&' : '?'
  window.location.replace(`${base}${separator}v=${Date.now()}`)
}

/**
 * Toast "versi baru siap" + tombol muat ulang.
 *
 * Dipakai dua jalur: deteksi otomatis (`controllerchange` di `main.tsx`) dan
 * tombol "Cek pembaruan" di halaman setelan. `id` tetap supaya kedua jalur
 * tidak menumpuk jadi dua toast saat keduanya menyala.
 */
export function promptAppUpdate() {
  toast.custom(
    (t) => (
      <div className="update-toast" role="status">
        <span className="update-toast__text">Versi baru siap.</span>
        <button
          type="button"
          className="update-toast__action"
          onClick={() => {
            toast.dismiss(t.id)
            void reloadFresh()
          }}
        >
          Muat ulang
        </button>
      </div>
    ),
    { id: 'app-update', duration: Infinity },
  )
}

/**
 * Paksa pemeriksaan service worker (`reg.update()`).
 *
 * `controllerchange` (versi baru sudah mengambil alih, `skipWaiting` aktif)
 * atau worker `waiting`/`installing` → `'updated'`. Kalau tak ada dalam 4 detik
 * → `'current'`. Tanpa service worker (dev server) → `'unsupported'`.
 */
export async function checkForAppUpdate(): Promise<UpdateResult> {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return 'unsupported'
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return 'unsupported'

  const found = await new Promise<boolean>((resolve) => {
    let settled = false
    let timer = 0
    const onChange = () => finish(true)
    const finish = (value: boolean) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      navigator.serviceWorker.removeEventListener('controllerchange', onChange)
      resolve(value)
    }
    navigator.serviceWorker.addEventListener('controllerchange', onChange)
    timer = window.setTimeout(() => finish(Boolean(reg.waiting || reg.installing)), 4000)
    void reg.update().then(() => {
      if (reg.waiting || reg.installing) finish(true)
    })
  })

  return found ? 'updated' : 'current'
}
