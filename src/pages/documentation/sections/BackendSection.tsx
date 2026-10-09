import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function BackendSection() {
  return (
    <DocSection id="backend" num="12" title="Connecting a Real Backend">
      <p className="doc-p">
        The app runs fully on mock data. Here's where to swap each piece:
      </p>
      <h3 className="doc-h3">
        Authentication — disable mock user
      </h3>
      <DocCode lang="typescript">
        {`// src/store/slices/authSlice.ts
const initialState: AuthState = {
  user: null,              // was mockUser
  isAuthenticated: false,  // the mock gate already starts signed out
  isLoading: false,
};`}
      </DocCode>
      <h3 className="doc-h3">
        Route protection — server-side guard
      </h3>
      <p className="doc-p">
        This repo is a front-end showcase — no server, Edge Runtime, or
        <code className="doc-inline">middleware.ts</code>
        exists here. In a production setup, route guards live server-side
        (API middleware, route handlers) or via a client-side auth wrapper
        that checks Redux state before rendering protected pages.
      </p>
      <h3 className="doc-h3">
        Food data — RTK Query
      </h3>
      <DocCode lang="typescript">
        {`// src/store/api/foodApi.ts
export const foodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFoods: builder.query<FoodItem[], void>({
      query: () => "/foods",
    }),
  }),
});`}
      </DocCode>
      <h3 className="doc-h3">
        Orders — Supabase PostgREST
      </h3>
      <p className="doc-p">
        Customer checkout writes an order (
        <code className="doc-inline">POST /rest/v1/orders</code>) and the merchant queue reads it
        back ({' '}
        <code className="doc-inline">GET /rest/v1/orders?merchant_id=eq.1</code>) through
        <code className="doc-inline">src/api/orders.ts</code>. Both are best-effort: if the API is
        unreachable or RLS rejects, the mock list stays on screen (mock-first, API-override). Reads
        re-login the demo merchant account so RLS returns the rows.
      </p>
      <h3 className="doc-h3">
        Reference data — live reads
      </h3>
      <p className="doc-p">
        Couriers, wallets, merchant incentive, SA zones/roles/operators, and kill switches are
        read from PostgREST in <code className="doc-inline">src/api/reference.ts</code> and synced
        into Redux once from <code className="doc-inline">App</code> (
        <code className="doc-inline">useApiSync</code>), mock-first: a failed call leaves the seed
        in place. Storefront rating and opening hours come straight from{' '}        <code className="doc-inline">merchants</code> (
        <code className="doc-inline">rating_avg</code>,{' '}
        <code className="doc-inline">rating_count</code>,{' '}
        <code className="doc-inline">open_time</code>,{' '}
        <code className="doc-inline">close_time</code>); merchant orders carry the assigned{' '}
        <code className="doc-inline">orders.courier_id</code>. The merchant's own profile (name,
        phone, address, photo, opening hours, delivery config) is hydrated into the merchant slice
        from the same table. The full merchant registry (owner, city, tier, tenant/deposit
        status, active zones, COD issues) is read into <code className="doc-inline">admin.merchants</code>{' '}
        for the CS panel and SA console. SA roles and operators are read too, now that the backend
        permission verbs match the UI catalog. The merchant incentive history is
        read from <code className="doc-inline">merchant_credit_events</code>. The merchant store
        open/close toggle writes back{' '}
        <code className="doc-inline">PATCH /rest/v1/merchants?id=eq.1</code>, and the customer
        storefront polls for changes. RLS guards the user tables, so reads sign in the demo
        <code className="doc-inline">cs@</code> account (explicit token, never the global one).
      </p>
      <h3 className="doc-h3">
        Order tracking — WebSocket
      </h3>
      <p className="doc-p">
        The tracking pages simulate GPS movement with
        <code className="doc-inline">
          setTimeout
        </code>
        . Replace with a WebSocket or polling endpoint from your delivery backend.
      </p>
    </DocSection>
  )
}
