import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

export function RouteProtectionSection() {
  return (
    <DocSection id="route-protection" num="06" title="Route Protection">
      <p className="doc-p">
        <code className="doc-inline">
          middleware.ts
        </code>
         runs on the Edge Runtime before every request. It cannot access Redux or localStorage — only cookies. The{' '}
        <code className="doc-inline">
          useAuthCookie
        </code>
         hook bridges the gap.
      </p>
      <h3 className="doc-h3">
        Auth Flow
      </h3>
      <DocCode lang="typescript">
        <code>{`// 1. User logs in → Redux: isAuthenticated = true
// 2. useAuthCookie → writes: document.cookie = "sa7tein_auth=true"
// 3. User navigates to /checkout
// 4. middleware reads cookie → passes through ✓

// Logout
dispatch(logout());
// useAuthCookie detects false → clears cookie
// middleware blocks all protected routes immediately`}</code>
      </DocCode>
      <h3 className="doc-h3">
        Route Groups
      </h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                Group
              </th>
              <th>
                Routes
              </th>
              <th>
                Behavior
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="doc-badge doc-badge--muted">
                  Public
                </span>
              </td>
              <td>
                /signin, /signup, /forgot-password*, /onboarding
              </td>
              <td>
                Always accessible
              </td>
            </tr>
            <tr>
              <td>
                <span className="doc-badge doc-badge--yellow">
                  Guest-only
                </span>
              </td>
              <td>
                Auth pages
              </td>
              <td>
                Logged-in users redirected to /home
              </td>
            </tr>
            <tr>
              <td>
                <span className="doc-badge doc-badge--green">
                  Protected
                </span>
              </td>
              <td>
                Everything else
              </td>
              <td>
                Unauthenticated → /signin?from=...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>
  )
}
