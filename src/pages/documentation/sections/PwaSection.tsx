import { DocSection } from '../DocSection'

export function PwaSection() {
  return (
    <DocSection id="pwa" num="08" title="PWA Setup">
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                File
              </th>
              <th>
                Location
              </th>
              <th>
                Purpose
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                manifest.json
              </td>
              <td>
                public/
              </td>
              <td>
                App metadata, icons, display mode
              </td>
            </tr>
            <tr>
              <td>
                sw.js
              </td>
              <td>
                public/
              </td>
              <td>
                Service worker — caching strategies
              </td>
            </tr>
            <tr>
              <td>
                ServiceWorkerRegistrar.tsx
              </td>
              <td>
                src/components/pwa/
              </td>
              <td>
                Registers SW on mount
              </td>
            </tr>
            <tr>
              <td>
                offline/page.tsx
              </td>
              <td>
                src/app/offline/
              </td>
              <td>
                Offline fallback page
              </td>
            </tr>
            <tr>
              <td>
                next.config.ts
              </td>
              <td>
                root
              </td>
              <td>
                Headers so browser never caches sw.js
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="doc-h3">
        Caching Strategy
      </h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                Request Type
              </th>
              <th>
                Strategy
              </th>
              <th>
                Reason
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Page navigation
              </td>
              <td>
                Network-first → cache → /offline
              </td>
              <td>
                Always fresh, offline fallback
              </td>
            </tr>
            <tr>
              <td>
                /_next/static/*
              </td>
              <td>
                Cache-first
              </td>
              <td>
                Build hashes guarantee freshness
              </td>
            </tr>
            <tr>
              <td>
                Images, fonts
              </td>
              <td>
                Cache-first
              </td>
              <td>
                Rarely change
              </td>
            </tr>
            <tr>
              <td>
                /api/*
              </td>
              <td>
                Network-only
              </td>
              <td>
                Never stale data
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>
  )
}
