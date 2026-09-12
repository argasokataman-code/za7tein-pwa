import { DocSection } from '../DocSection'

export function PagesRoutesSection() {
  return (
    <DocSection id="pages" num="03" title="Pages & Routes">
      <p className="doc-p">
        All routes are inside
        <code className="doc-inline">
          src/app/
        </code>
        . Route groups
        <code className="doc-inline">
          (auth)
        </code>
         and
        <code className="doc-inline">
          (main)
        </code>
         apply different layouts.
      </p>
      <h3 className="doc-h3">
        Entry &amp; Onboarding
      </h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                Route
              </th>
              <th>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="doc-inline">
                  /
                </code>
              </td>
              <td>
                Entry point → redirects to /signin or /home
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /onboarding
                </code>
              </td>
              <td>
                Splash + carousel
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /account-setup
                </code>
              </td>
              <td>
                5-step wizard (language, location, photo, finish)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="doc-h3">
        Authentication — (auth) group
      </h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                Route
              </th>
              <th>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="doc-inline">
                  /signin
                </code>
              </td>
              <td>
                Sign in form
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /signup
                </code>
              </td>
              <td>
                Sign up form
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /forgot-password
                </code>
              </td>
              <td>
                Email input for reset
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /forgot-password-otp
                </code>
              </td>
              <td>
                OTP verification
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /create-password
                </code>
              </td>
              <td>
                New password form
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /verification
                </code>
              </td>
              <td>
                Email verification
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="doc-h3">
        Order &amp; Checkout — (main) group
      </h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                Route
              </th>
              <th>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="doc-inline">
                  /checkout
                </code>
              </td>
              <td>
                Cart review
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /address-selection
                </code>
              </td>
              <td>
                Pick delivery address
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /payment-selection
                </code>
              </td>
              <td>
                Pick payment method
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /order-placed
                </code>
              </td>
              <td>
                Order placed (auto-advances)
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /order-tracking
                </code>
              </td>
              <td>
                Map tracking view
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /order-arrived
                </code>
              </td>
              <td>
                Order arrived + confetti
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /order-delivered
                </code>
              </td>
              <td>
                Tiba confirmation
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /rating-driver
                </code>
              </td>
              <td>
                5-star driver rating
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="doc-h3">
        Profile &amp; Settings — (main) group
      </h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                Route
              </th>
              <th>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="doc-inline">
                  /profile
                </code>
              </td>
              <td>
                Profile hub
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /profile/personal-data
                </code>
              </td>
              <td>
                Edit name, email, phone, DOB
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /profile/add-profile-photo
                </code>
              </td>
              <td>
                Change avatar
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /profile/change-password
                </code>
              </td>
              <td>
                Change password
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /profile/notifications
                </code>
              </td>
              <td>
                Notification toggles
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /profile/wallet
                </code>
              </td>
              <td>
                Payment account overview
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /profile/wallet/add-new-card
                </code>
              </td>
              <td>
                Add card (details step)
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /profile/wallet/add-card-address
                </code>
              </td>
              <td>
                Billing address step
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="doc-h3">
        Merchant Console — /merchant group
      </h3>
      <p>
        A separate role shell for merchants, distinct from the customer app.
        Merchant auth (<code className="doc-inline">/merchant/signin</code> and{' '}
        <code className="doc-inline">/merchant/signup</code>) is separate from customer auth{' '}
        (<code className="doc-inline">/signin</code>).
        It uses its own bottom nav (<code className="doc-inline">MerchantBottomNav</code>)
        and is entirely mock-data driven (no backend or auth).
        All routes are prefixed with <code className="doc-inline">/merchant</code>
        {' '}so they don't collide with the 46 customer routes.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                Route
              </th>
              <th>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="doc-inline">
                  /merchant/signin
                </code>
              </td>
              <td>
                Masuk merchant (email + password)
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /merchant/signup
                </code>
              </td>
              <td>
                Daftar toko
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /merchant/pending
                </code>
              </td>
              <td>
                Menunggu persetujuan Super Admin
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /merchant
                </code>
              </td>
              <td>
                Dashboard: toggle buka/tutup, kuota harian, statistik order
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /merchant/orders
                </code>
              </td>
              <td>
                Antrean order: tab status, terima/tolak, estimasi masak 15–30 menit
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /merchant/couriers
                </code>
              </td>
              <td>
                Kelola kurir khusus toko (maksimal 3)
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /merchant/settings
                </code>
              </td>
              <td>
                Setelan toko: form edit nama/telepon/alamat, peta lokasi
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">
                  /merchant/menu
                </code>
              </td>
              <td>
                Menu &amp; Stock: atur item, stok, dan ketersediaan
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Merchant <code className="doc-inline">Menu &amp; Stok</code> manages the shared Redux <code className="doc-inline">catalog</code> slice (also shown to customers), supporting add, edit, delete, image upload, stock bottom-sheet, and availability toggle. It is reachable via the "Menu" bottom-nav tab at <code className="doc-inline">/merchant/menu</code>. Data seed lives in <code className="doc-inline">src/data/catalog.ts</code>. Order screens use data from <code className="doc-inline">src/data/merchant.ts</code> and <code className="doc-inline">src/data/merchantOrders.ts</code>. Navigation is handled by <code className="doc-inline">MerchantBottomNav</code>.
      </p>
    </DocSection>
  )
}
