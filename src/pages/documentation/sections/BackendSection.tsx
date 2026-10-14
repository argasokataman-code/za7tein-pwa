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
      <ul className="doc-list">
        <li>
          <strong>Realtime</strong> uses a WebSocket (Supabase Realtime, channel{' '}
          <code className="doc-inline">orders</code>, <code className="doc-inline">src/api/realtime.ts</code>):
          an order change refreshes the inbox + merchant queue + courier tasks with no reload. Status
          transitions are persisted to <code className="doc-inline">orders.status</code> and courier
          checkpoints to <code className="doc-inline">checkpoints</code>.
        </li>
        <li>
          <strong>Status enum.</strong> The backend <code className="doc-inline">orders.status</code>{' '}
          CHECK uses <code className="doc-inline">cart · quotation · canceled · prepare ·
          waitingCourier · waitingDelivery · delivery · done</code>. The read map (
          <code className="doc-inline">STATUS_MAP</code> / <code className="doc-inline">STAGE_OF_STATUS</code>{' '}
          in <code className="doc-inline">src/api/orders.ts</code>) must cover every backend value, or the
          order falls back to <code className="doc-inline">baru</code> on read even though the write
          succeeded.
        </li>
        <li>
          <strong>Customer tracking is live.</strong> The order-placed screen reads the active order (
          <code className="doc-inline">cart.activeOrder</code>, set at checkout) and mirrors{' '}
          <code className="doc-inline">orders.status</code> through the same realtime channel; the
          journey stage and the OTP shown to the customer come from that order, not from a mock.
        </li>
        <li>
          <strong>Courier OTP is verified server-side.</strong> The code lives in{' '}
          <code className="doc-inline">orders.otp</code> (revoked from{' '}
          <code className="doc-inline">authenticated</code>). The customer reads it via the{' '}
          <code className="doc-inline">my_order_otp</code> RPC and shows it; the courier never sees
          it and verifies by calling <code className="doc-inline">verify_order_otp</code>, which
          matches the code, sets <code className="doc-inline">otp_verified</code>, and writes the{' '}
          <code className="doc-inline">otp_verified</code> checkpoint. The deterministic{' '}
          <code className="doc-inline">otpOf</code> is only a mock fallback for orders without a BE
          row. <strong>Assigned courier is required</strong> before the merchant can dispatch (
          <code className="doc-inline">waitingCourier → delivery</code>): the button is disabled until
          a courier is chosen. The picker lists each courier as a selectable card (monogram, live
          status dot, active-task count); the chosen one is marked and a hint stays until a courier
          is picked.
        </li>
        <li>
          <strong>Courier tasks come from one RPC.</strong>{' '}
          <code className="doc-inline">fetchCourierOrders()</code> calls{' '}
          <code className="doc-inline">courier_orders()</code> (SECURITY DEFINER, scoped to the
          caller's courier id), which joins the customer, delivery address, order items, tip, and
          haversine distance in the database — the courier task no longer fills{' '}
          <code className="doc-inline">Customer N</code>/<code className="doc-inline">-</code>{' '}
          placeholders. RLS keeps <code className="doc-inline">customers</code>/
          <code className="doc-inline">addresses</code> private, so the courier reads the address
          through this RPC instead of a table grant. Courier status writes use the courier session (
          <code className="doc-inline">updateOrderStatus(id, status, 'courier')</code>), not the
          merchant token.
        </li>
        <li>
          <strong>Merchant confirm is gated on payment (f18).</strong> Checkout writes the order
          immediately, so it shows up in the merchant Antrean right away, but <em>Terima</em> stays
          disabled until payment is confirmed: <code className="doc-inline">payment_status = paid</code>{' '}
          for wallet, DANA VA/QRIS after the payment screen succeeds, or the merchant verifying a
          transfer proof (accept sets <code className="doc-inline">paid</code>). COD is confirmable at
          once because checkout reserves a wallet hold (f2). A still-unpaid order carries a
          &ldquo;Menunggu bayar&rdquo; chip and a note instead of an active Terima.
        </li>
        <li>
          <strong>Writes name their columns.</strong> A returning insert must list the columns it
          wants (<code className="doc-inline">createWithReturn(..., 'id,code')</code>):{' '}
          <code className="doc-inline">Prefer: return=representation</code> without a{' '}
          <code className="doc-inline">select</code> makes PostgREST do{' '}
          <code className="doc-inline">RETURNING *</code>, and any column whose{' '}
          <code className="doc-inline">SELECT</code> is revoked from{' '}
          <code className="doc-inline">authenticated</code> (e.g.{' '}
          <code className="doc-inline">orders.otp</code>, exposed only via the{' '}
          <code className="doc-inline">my_order_otp</code> RPC) fails the whole INSERT with{' '}
          <code className="doc-inline">42501 permission denied</code> — even though the INSERT
          privilege itself is granted.
        </li>
      </ul>
      <h3 className="doc-h3">
        Reference data — live reads
      </h3>
      <p className="doc-p">
        Couriers, wallets, merchant incentive, SA zones/roles/operators, and kill switches are
        read from PostgREST in <code className="doc-inline">src/api/reference.ts</code> and synced
        into Redux once from <code className="doc-inline">App</code> (
        <code className="doc-inline">useApiSync</code>), mock-first: a failed call leaves the seed
        in place. Storefront rating and opening hours come straight from{' '}
        <code className="doc-inline">merchants</code> (
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
        storefront polls for changes. The customer home reads the default address from{' '}
        <code className="doc-inline">addresses</code> for the live location label and computes each
        store's distance and delivery time locally (the backend stores no delivery time). The
        category chips are hidden while <code className="doc-inline">menus.category</code> is empty
        in the backend, instead of filtering the store list down to nothing. RLS guards the user
        tables, so reads sign in the demo
        <code className="doc-inline">cs@</code> account (explicit token, never the global one).
      </p>
      <h3 className="doc-h3">
        Order tracking — WebSocket
      </h3>
      <p className="doc-p">
        The customer order screen calls <code className="doc-inline">fetchCustomerOrder</code> and
        replays <code className="doc-inline">orders.status</code> over the realtime channel, so
        merchant and courier actions update the customer's stage with no reload. Courier GPS is still
        simulated with <code className="doc-inline">setTimeout</code>; replace it with a live location
        feed from your delivery backend.
      </p>
    </DocSection>
  )
}
