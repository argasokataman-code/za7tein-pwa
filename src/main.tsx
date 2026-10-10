import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import toast from 'react-hot-toast'

import App from './App'
import './styles/index.scss'

// Build sebelumnya mendaftarkan service worker berskala /app/. Sekarang worker
// memakai scope '/' agar mencakup semua prefix peran, jadi registrasi lama
// dilepas supaya tidak ada dua worker yang saling menimpa.
//
// Setelah itu, worker baru hanya ketahuan saat peramban memeriksa ulang
// `/sw.js` — dan Chrome menahan pemeriksaan itu sampai 24 jam sejak pemeriksaan
// terakhir. Di aplikasi terinstal itu berarti versi lama bisa bertahan
// seharian walau build baru sudah naik. Jadi pemeriksaan dipaksa saat aplikasi
// dibuka dan tiap kembali ke depan, lalu halaman dimuat ulang begitu worker
// baru mengambil alih (`skipWaiting` + `clientsClaim` di vite.config).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const item of registrations) {
      if (item.scope === `${location.origin}/app/`) void item.unregister()
    }
  })

  const hadController = navigator.serviceWorker.controller !== null
  let prompted = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Tanpa penjaga ini kunjungan pertama ikut memuat ulang (worker pertama
    // langsung `clientsClaim`) dan pengguna melihat halaman berkedip.
    if (!hadController || prompted) return
    prompted = true
    // Versi baru sudah mengambil alih (`skipWaiting` + `clientsClaim`), tapi
    // jangan reload diam-diam: beri tahu pengguna + tombol supaya isian form
    // yang sedang diketik tidak hilang. Update PWA sendiri sudah di-cache
    // service worker — tidak perlu unduh ulang aplikasi.
    toast.custom(
      (t) => (
        <div className="update-toast" role="status">
          <span className="update-toast__text">Versi baru siap.</span>
          <button
            type="button"
            className="update-toast__action"
            onClick={() => {
              toast.dismiss(t.id)
              window.location.reload()
            }}
          >
            Muat ulang
          </button>
        </div>
      ),
      { id: 'app-update', duration: Infinity },
    )
  })

  const checkForUpdate = () => {
    void navigator.serviceWorker.getRegistration().then((reg) => reg?.update())
  }
  checkForUpdate()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
