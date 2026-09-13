import { DocSection } from '../DocSection'

export function WhatsNewSection() {
  return (
    <DocSection id="whats-new" num="02" title="What Changed from HTML Version">
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                Area
              </th>
              <th>
                HTML Version
              </th>
              <th>
                Sa7tein (React)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Routing
              </td>
              <td>
                window.location.href / &lt;a href&gt;
              </td>
              <td>
                react-router-dom — useNavigate(), &lt;Link&gt;
              </td>
            </tr>
            <tr>
              <td>
                State
              </td>
              <td>
                sessionStorage / localStorage manually
              </td>
              <td>
                Redux Toolkit + redux-persist
              </td>
            </tr>
            <tr>
              <td>
                Auth
              </td>
              <td>
                None
              </td>
              <td>
                Mock auth — isAuthenticated: true, no route guard
              </td>
            </tr>
            <tr>
              <td>
                Validation
              </td>
              <td>
                Inline JS checks
              </td>
              <td>
                React Hook Form + Zod schemas
              </td>
            </tr>
            <tr>
              <td>
                Navigation
              </td>
              <td>
                Full page reload on every link
              </td>
              <td>
                Client-side navigation — no reloads
              </td>
            </tr>
            <tr>
              <td>
                PWA
              </td>
              <td>
                service-worker.js + HTML registration
              </td>
              <td>
                vite-plugin-pwa — SW auto-generated at build, registration injected via injectRegister: 'auto'
              </td>
            </tr>
            <tr>
              <td>
                Images
              </td>
              <td>
                &lt;img&gt; tags
              </td>
              <td>
                &lt;img&gt; dengan object-fit: cover
              </td>
            </tr>
            <tr>
              <td>
                Favorites
              </td>
              <td>
                Not persisted
              </td>
              <td>
                Redux slice, persisted to localStorage
              </td>
            </tr>
            <tr>
              <td>
                Cart
              </td>
              <td>
                Not persisted
              </td>
              <td>
                Redux slice, persisted to localStorage
              </td>
            </tr>
            <tr>
              <td>
                Error handling
              </td>
              <td>
                alert() dialogs
              </td>
              <td>
                react-hot-toast throughout
              </td>
            </tr>
            <tr>
              <td>
                Loading state
              </td>
              <td>
                None
              </td>
              <td>
                PersistGate renders null while rehydrating — no visible skeleton
              </td>
            </tr>
            <tr>
              <td>
                Brand identity
              </td>
              <td>
                "Delivo" — package, service worker cache, redux-persist keys
              </td>
              <td>
                "Sa7tein" — package renamed, cache "sa7tein-static", persist prefix "sa7tein:"
              </td>
            </tr>
            <tr>
              <td>
                App scope
              </td>
              <td>
                One SPA; PWA started at "/" (the landing page), service worker controlled every URL
              </td>
              <td>
                App moved under "/app/*" with router basename; PWA start_url "/app/home" while the manifest keeps the legacy root identity for a one-time Delivo-to-Sa7tein upgrade; service worker scope is "/app/"
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>
  )
}
