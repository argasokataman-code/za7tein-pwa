import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { promptAppUpdate } from './lib/appUpdate'
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
    promptAppUpdate()
  })

  const checkForUpdate = () => {
    void navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) return
      await reg.update()
      // `skipWaiting` biasanya langsung mengambil alih (lihat controllerchange
      // di atas). Kalau worker baru masih menunggu, tawarkan muat ulang saat
      // itu juga supaya pengguna tidak terjebak di build lama sampai tab
      // ditutup — persis yang terjadi saat prod dipindah ke API v2.
      if (reg.waiting || reg.installing) promptAppUpdate()
    })
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
