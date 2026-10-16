import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { cpSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * SHA commit untuk versi build. Dipakai agar SEMUA target deploy dari commit
 * yang sama menampilkan versi identik (main + 4 host peran). Urutan: env Vercel
 * (deploy via Git / dashboard) → `APP_BUILD_SHA` (deploy CLI dengan --build-env)
 * → git lokal → kosong (build tanpa repo, mis. CI arsip). Kosong = versi dasar
 * saja tanpa sufiks.
 */
function resolveBuildSha() {
  const fromEnv = process.env.VERCEL_GIT_COMMIT_SHA || process.env.APP_BUILD_SHA
  if (fromEnv) return fromEnv.slice(0, 7)
  try {
    return execSync('git rev-parse --short=7 HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()
  } catch {
    return ''
  }
}

const BUILD_SHA = resolveBuildSha()

/**
 * Salin peta flow archify (`docs/design/flows`) ke `dist/flows` supaya viewer-nya
 * bisa dibuka dari prod di `/flows/index.html`. HTML diagram ikut di-commit
 * (lihat .gitignore) karena Vercel build dari Git dan runner-nya tak punya
 * archify/Chrome. Artefak `.visual-check.*` dilewati.
 */
function copyFlowViewer(): Plugin {
  return {
    name: 'copy-flow-viewer',
    closeBundle() {
      const src = resolve(process.cwd(), 'docs/design/flows')
      if (!existsSync(src)) return
      cpSync(src, resolve(process.cwd(), 'dist/flows'), {
        recursive: true,
        filter: (path) => !path.includes('.visual-check.'),
      })
    },
  }
}

export default defineConfig({
  define: { __BUILD_SHA__: JSON.stringify(BUILD_SHA) },
  plugins: [
    react(),
    copyFlowViewer(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      scope: '/',
      injectRegister: 'auto',
      // the app ships its own public/manifest-<role>.json, satu per peran
      manifest: false,
      // JANGAN pakai includeAssets untuk berkas yang sudah cocok globPatterns:
      // entri ganda (satu tanpa revision, satu dengan ?__WB_REVISION__) membuat
      // workbox melempar `add-to-cache-list-conflicting-entries`, precache batal
      // diam-diam, dan offline mati. webp cukup ditambahkan ke globPatterns.
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,webp,svg,woff2}'],
        // push-sw.js diimpor saat runtime (importScripts), jangan ikut precache:
        // entri ganda bikin `add-to-cache-list-conflicting-entries`.
        // dist/flows/** = viewer archify (~22 MB) — disajikan statis, bukan app.
        globIgnores: ['**/push-sw.js', '**/flows/**'],
        importScripts: ['push-sw.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/$/, /^\/documentation/, /^\/flows\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'image' || request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'sa7tein-static',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
