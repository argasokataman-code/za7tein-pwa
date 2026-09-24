import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

export function RouteProtectionSection() {
  return (
    <DocSection id="route-protection" num="06" title="Route Protection">
      <p className="doc-p">
        There is no real authentication: no credentials are verified, no token is issued, and no
        backend is involved. What exists is a <strong>mock session gate</strong> that keeps the
        screen order promised by flow <code className="doc-inline">f21-account-auth</code> —
        onboarding, then sign-in, then the app. The session is a boolean flag in Redux, nothing
        more.
      </p>

      <h3 className="doc-h3">
        One Router per Role
      </h3>
      <p className="doc-p">
        <code className="doc-inline">App.tsx</code> checks the URL at mount time. Each role
        prefix (<code className="doc-inline">/customer</code>,{' '}
        <code className="doc-inline">/merchant</code>,{' '}
        <code className="doc-inline">/courier</code>,{' '}
        <code className="doc-inline">/admin</code>) renders its own{' '}
        <code className="doc-inline">RoleRouter</code> &mdash; a{' '}
        <code className="doc-inline">BrowserRouter</code> with that prefix as{' '}
        <code className="doc-inline">basename</code> and an error boundary + offline
        redirect. Everything else renders{' '}
        <code className="doc-inline">WebsiteRouter</code> (a plain{' '}
        <code className="doc-inline">BrowserRouter</code>).
      </p>
      <DocCode lang="typescript">
        <code>{`const ROLE_BASES = ['/customer', '/merchant', '/courier', '/admin'] as const

// App.tsx — mount-time decision
const role = ROLE_BASES.find(
  (base) => pathname === base || pathname.startsWith(base + '/'),
)

return role ? (
  <RoleRouter basename={role} routes={routesFor(role)} home={homeFor(role)} />
) : (
  <WebsiteRouter />
)`}</code>
      </DocCode>

      <h3 className="doc-h3">
        Session Gate (AuthGate)
      </h3>
      <p className="doc-p">
        Every route that is not on the role&apos;s public list is wrapped in{' '}
        <code className="doc-inline">AuthGate</code>. Without a session it renders a{' '}
        <code className="doc-inline">Navigate</code> to the role&apos;s entry screen, so opening
        an installed app on a fresh device lands on onboarding or sign-in instead of the home
        screen. Public lists are matched by path string, not by{' '}
        <code className="doc-inline">useLocation</code>, so the gate does not depend on how the
        router trims <code className="doc-inline">basename</code>.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Entry when signed out</th>
              <th>Public routes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="doc-inline">/customer</code>
              </td>
              <td>
                <code className="doc-inline">/onboarding</code>
              </td>
              <td>
                onboarding, signup, signin, forgot-password, forgot-password-otp,
                create-password, verification, account-setup, offline
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">/merchant</code>
              </td>
              <td>
                <code className="doc-inline">/signin</code>
              </td>
              <td>signin, signup, pending, offline</td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">/courier</code>
              </td>
              <td>
                <code className="doc-inline">/signin</code>
              </td>
              <td>signin, offline</td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">/admin</code>,{' '}
                <code className="doc-inline">/superadmin</code>
              </td>
              <td>&mdash;</td>
              <td>
                Not gated. The CS panel is documented as having no auth, and Super Admin is a
                full website rather than an installable app.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="doc-p">
        The install prompt is suppressed on the sign-in screens (
        <code className="doc-inline">AUTH_FORM_PATHS</code>). Measured before that: a click aimed
        at <code className="doc-inline">.auth-submit</code> landed on{' '}
        <code className="doc-inline">.install-prompt-box</code>, so the sign-in button could not
        be pressed at all.
      </p>

      <h3 className="doc-h3">
        Legacy Redirect
      </h3>
      <p className="doc-p">
        <code className="doc-inline">WebsiteRouter</code> registers every customer route path
        under a <code className="doc-inline">LegacyAppRedirect</code> component, plus{' '}
        <code className="doc-inline">/app</code> and <code className="doc-inline">/app/*</code>.
        On mount it rewrites the path into the right role prefix, so old links like{' '}
        <code className="doc-inline">/home</code>,{' '}
        <code className="doc-inline">/app/home</code>, or{' '}
        <code className="doc-inline">/app/merchant/menu</code> land in{' '}
        <code className="doc-inline">/customer/*</code> or <code className="doc-inline">/merchant/*</code>.
        This redirect is the only routing logic beyond flat route arrays.
      </p>
      <DocCode lang="typescript">
        <code>{`function LegacyAppRedirect() {
  useEffect(() => {
    const target = pathname.startsWith('/app')
      ? pathname
          .replace(/^\\/app\\/merchant/, '/merchant')
          .replace(/^\\/app/, '/customer')
      : \`/customer\${pathname}\`
    window.location.replace(target + search + hash)
  }, [])
  return null
}`}</code>
      </DocCode>

      <h3 className="doc-h3">
        Mock Session
      </h3>
      <p className="doc-p">
        <code className="doc-inline">authSlice</code> starts signed out. The four sign-in screens
        dispatch <code className="doc-inline">signIn(&#39;/role&#39;)</code> on submit &mdash; a
        toast, a flag, and a navigate, with nothing verified. The session is persisted, because a
        session that does not survive a reload would throw the user back to onboarding on every
        visit, which is exactly the defect this gate fixed.
      </p>
      <p className="doc-p">
        The session is split per role (<code className="doc-inline">role</code> field). All four
        PWAs are served from one origin, so they share{' '}
        <code className="doc-inline">localStorage</code>; without the split, signing in to the
        customer app also unlocked merchant and courier.
      </p>
      <DocCode lang="typescript">
        <code>{`// authSlice.ts — initialState
const initialState: AuthState = {
  user: mockUser,
  isAuthenticated: false,  // signed out until signIn()
  role: null,              // '/customer' | '/merchant' | '/courier'
  isLoading: false,
}

// persistConfig whitelist (store/index.ts)
whitelist: [..., 'superAdmin', 'auth']
// 'auth' IS persisted since the route gate exists`}</code>
      </DocCode>

      <h3 className="doc-h3">
        Onboarding, Not Access Control
      </h3>
      <p className="doc-p">
        <code className="doc-inline">accountSetupSlice</code> tracks onboarding progress:{
        ' '}<code className="doc-inline">currentScreen</code>,{' '}
        <code className="doc-inline">selectedLanguage</code>,{' '}
        <code className="doc-inline">profilePhoto</code>, and{' '}
        <code className="doc-inline">isSetupCompleted</code>. It does not gate
        access to any route.
      </p>

      <div className="doc-callout">
        <p className="doc-p" style={{ margin: 0 }}>
          Routes inside a role are gated by a mock flag; the flag is not security. Any real auth
          would replace <code className="doc-inline">AuthGate</code> with a server session check.
          To get back to the sign-in screen, use Keluar in the profile, or clear site data.
        </p>
      </div>
    </DocSection>
  )
}
