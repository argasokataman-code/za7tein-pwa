import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

export function FileStructureSection() {
  return (
    <DocSection id="file-structure" num="04" title="File Structure">
      <DocCode lang="bash">
        {`sa7tein-pwa/
│
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker (vite-plugin-pwa)
│   └── assets/
│       ├── img/               # Gambar, ikon
│       └── fonts/             # Manrope (self-hosted)
│
└── src/
    ├── main.tsx               # Entry — Redux Provider + PersistGate
    ├── App.tsx                # Router + toaster
    │
    ├── pages/                 # 50 layar
    │
    ├── components/
    │   ├── layout/            # BottomNav, HomeIndicator
    │   └── ui/                # FavoriteButton, BackButton
    │
    ├── store/
    │   ├── index.ts           # configureStore + redux-persist
    │   └── slices/            # auth, cart, favorites, ui, accountSetup
    │
    ├── hooks/                 # useAppStore, useOtpInput, useLeafletMap
    ├── lib/schemas.ts         # Skema Zod
    ├── data/                  # Data contoh (foods, reviews, user)
    └── styles/                # tokens, fonts, reboot, app, modules, docs`}
      </DocCode>
    </DocSection>
  )
}
