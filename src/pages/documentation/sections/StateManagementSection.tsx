import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

export function StateManagementSection() {
  return (
    <DocSection id="state" num="07" title="State Management">
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                Slice
              </th>
              <th>
                Persisted Key
              </th>
              <th>
                Persisted Fields
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                cart
              </td>
              <td>
                sa7tein:cart
              </td>
              <td>
                items, selectedAddressId, selectedPaymentId
              </td>
            </tr>
            <tr>
              <td>
                favorites
              </td>
              <td>
                sa7tein:favorites
              </td>
              <td>
                ids
              </td>
            </tr>
            <tr>
              <td>
                accountSetup
              </td>
              <td>
                sa7tein:accountSetup
              </td>
              <td>
                currentScreen, selectedLanguage, profilePhoto, isSetupCompleted
              </td>
            </tr>
            <tr>
              <td>
                catalog
              </td>
              <td>
                sa7tein:catalog
              </td>
              <td>
                items
              </td>
            </tr>
            <tr>
              <td>
                auth
              </td>
              <td>
                not persisted
              </td>
              <td>
                mirrored to sa7tein_auth cookie
              </td>
            </tr>
            <tr>
              <td>
                ui
              </td>
              <td>
                not persisted
              </td>
              <td>
                notificationCount, locationLabel, cartBadgeCount
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="doc-p">
        <code className="doc-inline">catalog</code> is the single source of truth for the menu, shared between the merchant console and the customer app (Home, Search, Favorites, MenuDetail). Seed data lives in <code className="doc-inline">src/data/catalog.ts</code>.
      </p>
      <h3 className="doc-h3">
        Dispatch Examples
      </h3>
      <DocCode lang="typescript">
        <code>{`import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { addItem } from "@/store/slices/cartSlice";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import { setLocationLabel } from "@/store/slices/uiSlice";
import { logout } from "@/store/slices/authSlice";

const dispatch = useAppDispatch();

dispatch(addItem({ id, name, price, quantity: 1, image }));
dispatch(toggleFavorite(foodId));
dispatch(setLocationLabel("5th Ave, New York"));
dispatch(logout());`}</code>
      </DocCode>
      <div className="doc-info">
        <strong>
          PersistGate matters:
        </strong>
         Without it, components render once with empty Redux defaults before rehydration — causing cart guard to redirect users and auth guard to see isAuthenticated: false.
      </div>
    </DocSection>
  )
}
