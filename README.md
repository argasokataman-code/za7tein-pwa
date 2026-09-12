# Delivo — Food Delivery PWA

React + Vite rebuild of the Delivo food-delivery PWA (originally a Next.js 16 app).
Dark theme, orange accent, mobile-first, installable.

## Stack

| Area | Choice |
|---|---|
| Build | **Vite 8** + TypeScript |
| UI | **React 19** + `react-router-dom` |
| Styling | **SCSS** (app stylesheet recovered from the original build) |
| State | **Redux Toolkit** + `redux-persist` (cart, favorites, accountSetup) |
| Forms | `react-hook-form` + `zod` |
| Icons | `lucide-react` |
| Maps | `leaflet` + `react-leaflet` |
| PWA | `vite-plugin-pwa` (Workbox `generateSW`) |
| Toasts | `react-hot-toast` |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

> **Heads-up:** if your shell exports `NODE_ENV=production` (or npm has `omit=dev`),
> `npm install` silently skips `devDependencies` and the dev server will not start.
> Install with `npm install --include=dev` in that case.

Other scripts:

```bash
npm run build    # tsc -b && vite build  -> dist/
npm run preview  # serve the production build (PWA works here)
npm run lint     # oxlint
```

Service workers only register on a real build, not in `npm run dev` — test PWA
features with `npm run build && npm run preview`.

## Structure

```
public/
  manifest.json           # PWA manifest
  icons/                  # 8 launcher icons (72 -> 512)
  assets/img/             # real app imagery
  assets/fonts/           # Plus Jakarta Sans (self-hosted subsets)
  assets/media/           # banner / map artwork
src/
  main.tsx  App.tsx       # entry + router (all 50 routes registered)
  pages/                  # one file per screen
  components/
    layout/               # BottomNav, HomeIndicator
    ui/                   # BackButton, FavoriteButton, FoodCard
  store/                  # configureStore + 5 slices + PersistGate provider
  data/                   # mock foods / reviews / user / cards
  hooks/useAppStore.ts
  styles/                 # tokens, reboot, fonts, recovered app stylesheet
  types.ts
```

## Fidelity

The stylesheet in `src/styles/_app.scss` (~10k lines) was recovered from the
production build of the original site, and every screen reuses the same class
names, so the markup and computed geometry match the original exactly.

Verified automatically: each of the **50 routes** was rendered in headless Chrome
for both the original deployment and this app, then the ordered class list of the
DOM was diffed — **50/50 are identical**. `/home` additionally matches down to the
pixel on box sizes and colors.

Two things the app inherits from Bootstrap's reboot (the original shipped it
globally) are reproduced in `src/styles/_reboot.scss`: body `line-height: 1.5`
and heading `line-height: 1.2`. Without them every text box is a few pixels off.

## How the screens were ported

The original is client-rendered, so its RSC payload only carries component
references. Each screen was therefore captured by rendering the deployed site in
headless Chrome, then converting the hydrated DOM into a React component that
keeps the original class names, inline styles and icon markup. Six order screens
also set a `<body>` class, which the generated components reproduce with a
`useEffect`.

`/home` and `/menu-detail/:id` are hand-written and fully wired to the store;
the remaining screens are faithful markup ports — interactive behaviour beyond
navigation is still to be added (see Status).

## Status

- [x] Project scaffold, design tokens, recovered stylesheet, fonts, assets
- [x] Redux store (auth / cart / favorites / ui / accountSetup) + persistence
- [x] App shell + shared UI components, all 50 routes registered
- [x] All 50 screens rebuilt — structure verified identical to the original
- [x] `/home` and `/menu-detail/:id` fully wired to the store
- [ ] Wire forms and interactions on the remaining screens (auth submit,
      checkout totals, filters, toggles) — currently presentational
