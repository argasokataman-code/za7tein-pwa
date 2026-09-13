import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

export function RouteProtectionSection() {
  return (
    <DocSection id="route-protection" num="06" title="Route Protection">
      <p className="doc-p">
        This showcase has no real authentication or route protection.
        The app boots with <code className="doc-inline">isAuthenticated: true</code> and a mock
        user. No credentials are verified. The only thing resembling "protection" is
        a basename split and a legacy redirect.
      </p>

      <h3 className="doc-h3">
        Two Routers, One Basename
      </h3>
      <p className="doc-p">
        <code className="doc-inline">App.tsx</code> checks the URL at mount time. If the path
        is <code className="doc-inline">/app</code> or starts with <code className="doc-inline">/app/</code>,
        it renders <code className="doc-inline">AppRouter</code> (a <code className="doc-inline">BrowserRouter</code> with{' '}
        <code className="doc-inline">basename="/app"</code>, wrapped in{' '}
        <code className="doc-inline">MobileDeviceFrame</code>). Otherwise it renders{' '}
        <code className="doc-inline">WebsiteRouter</code> (a plain <code className="doc-inline">BrowserRouter</code>).
      </p>
      <DocCode lang="typescript">
        <code>{`const APP_BASENAME = '/app'

// App.tsx — mount-time decision
const isApp =
  window.location.pathname === APP_BASENAME ||
  window.location.pathname.startsWith(APP_BASENAME + '/')

return isApp ? <AppRouter /> : <WebsiteRouter />`}</code>
      </DocCode>

      <h3 className="doc-h3">
        Legacy Redirect
      </h3>
      <p className="doc-p">
        <code className="doc-inline">WebsiteRouter</code> registers every app route path
        under a <code className="doc-inline">LegacyAppRedirect</code> component. On
        mount it calls <code className="doc-inline">window.location.replace('/app' + path)</code>,
        so old links like <code className="doc-inline">/home</code> or{' '}
        <code className="doc-inline">/signin</code> land inside the app basename.
        This redirect is the only routing logic beyond flat route arrays.
      </p>
      <DocCode lang="typescript">
        <code>{`function LegacyAppRedirect() {
  useEffect(() => {
    window.location.replace(
      \`/app\${window.location.pathname}\${window.location.search}\`
    )
  }, [])
  return null
}`}</code>
      </DocCode>

      <h3 className="doc-h3">
        Mock Auth
      </h3>
      <p className="doc-p">
        <code className="doc-inline">authSlice</code> initial state sets{' '}
        <code className="doc-inline">isAuthenticated: true</code> with a mock user.
        There is no login verification, no auth cookie, no{' '}
        <code className="doc-inline">useAuthCookie</code> hook, and no{' '}
        <code className="doc-inline">middleware.ts</code>. The{' '}
        <code className="doc-inline">auth</code> slice is not in the persist
        whitelist — it resets to "authenticated" on every page load.
      </p>
      <DocCode lang="typescript">
        <code>{`// authSlice.ts — initialState
const initialState: AuthState = {
  user: mockUser,
  isAuthenticated: true,  // always true
  isLoading: false,
}

// persistConfig whitelist (store/index.ts)
whitelist: ['cart', 'favorites', 'accountSetup', 'catalog']
// 'auth' is NOT persisted`}</code>
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
          No route is protected. All screens are directly browsable. Any future
          real auth would need a guard component and a persistent session check
          — neither exists today.
        </p>
      </div>
    </DocSection>
  )
}
