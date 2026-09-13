import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

export function FileStructureSection() {
  return (
    <DocSection id="file-structure" num="04" title="File Structure">
      <DocCode lang="bash">
        {`sa7tein-pwa/
│
├── public/
│   ├── favicon.ico, favicon.svg, icons.svg
│   ├── manifest.json
│   ├── icons/                 # PWA icons (72..512 png, mark, cloche)
│   └── assets/
│       ├── fonts/             # Manrope (self-hosted)
│       ├── illustrations/
│       ├── img/
│       └── media/
│
└── src/
    ├── main.tsx               # Entry — Redux Provider + PersistGate
    ├── App.tsx                # Router + routes array
    ├── types.ts               # Domain types (satu sumber)
    │
    ├── pages/                 # ~54 layar (satu per rute)
    │
    ├── components/
    │   ├── customer/          # CustomerHomeHero, CustomerHomeHero.css
    │   ├── layout/            # BottomNav, HomeIndicator, MerchantBottomNav, MobileDeviceFrame
    │   ├── ui/                # AddToCartButton, BackButton, BottomSheet, FavoriteButton, FoodCard
    │   ├── JourneyLine.tsx
    │   └── OrderStageScreen.tsx
    │
    ├── store/
    │   ├── index.ts           # configureStore + redux-persist
    │   └── slices/            # 8 slice (accountSetup, auth, cart, catalog, favorites, merchant, notifications, ui)
    │
    ├── hooks/                 # useAppStore, useCatalog, useFoodActions, useLeafletMap, useOtpInput, useToggleSet
    │
    ├── data/                  # catalog, foods, merchant, merchantOrders, merchantReviews, notifications, reviews, user
    │
    └── styles/
        ├── index.scss         # Urutan import (load-bearing)
        ├── _tokens.scss       # Desain token
        ├── app/               # part-01..part-17 (porting lama)
        └── system/            # Design system (18 partial: buttons, cards, forms, dll)`}
      </DocCode>
    </DocSection>
  )
}
