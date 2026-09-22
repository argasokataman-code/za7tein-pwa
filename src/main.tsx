import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './styles/index.scss'

// Build sebelumnya mendaftarkan service worker berskala /app/. Sekarang worker
// memakai scope '/' agar mencakup semua prefix peran, jadi registrasi lama
// dilepas supaya tidak ada dua worker yang saling menimpa.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const item of registrations) {
      if (item.scope === `${location.origin}/app/`) void item.unregister()
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
