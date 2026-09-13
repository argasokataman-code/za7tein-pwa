import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './styles/index.scss'

// Older builds registered a root-scoped worker and could keep serving the
// marketing page from an old cache. The installed app now owns only /app/.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
    const rootWorker = registrations.find((item) => item.scope === `${location.origin}/`)
    if (rootWorker && await rootWorker.unregister()) location.reload()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
