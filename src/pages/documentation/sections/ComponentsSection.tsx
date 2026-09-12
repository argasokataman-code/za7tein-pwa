import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

export function ComponentsSection() {
  return (
    <DocSection id="components" num="11" title="Key Components">
      <h3 className="doc-h3">
        BackButton
      </h3>
      <p className="doc-p">
        <code className="doc-inline">
          src/components/ui/BackButton.tsx
        </code>
      </p>
      <DocCode lang="tsx">
        {`<BackButton
  variant="default"  // "default" | "card" | "map" | "dark"
  behavior="smart"   // "smart" | "history" | "href"
  href="/home"       // fallback URL for "smart", target for "href"
/>`}
      </DocCode>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                Behavior
              </th>
              <th>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                smart
              </td>
              <td>
                router.back() if history exists, else router.push(href)
              </td>
            </tr>
            <tr>
              <td>
                history
              </td>
              <td>
                Always router.back()
              </td>
            </tr>
            <tr>
              <td>
                href
              </td>
              <td>
                Always router.push(href)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="doc-h3">
        FavoriteButton
      </h3>
      <p className="doc-p">
        <code className="doc-inline">
          src/components/ui/FavoriteButton.tsx
        </code>
      </p>
      <DocCode lang="tsx">
        {`<FavoriteButton
  id={item.id}      // food item ID
  name={item.name}  // used in toast message
  variant="card"    // "card" | "header"
/>`}
      </DocCode>
      <div className="doc-info">
        <strong>
          Important:
        </strong>
         Never nest 
        <code>
          &lt;FavoriteButton&gt;
        </code>
         inside a 
        <code>
          &lt;Link&gt;
        </code>
        . Use 
        <code>
          &lt;div onClick=&#123;() =&gt; router.push(...)&#125;&gt;
        </code>
         as the card wrapper instead. Button-inside-anchor is invalid HTML and causes page reloads on favorite clicks.
      </div>
      <h3 className="doc-h3">
        LocationPicker
      </h3>
      <p className="doc-p">
        <code className="doc-inline">
          src/components/ui/LocationPicker.tsx
        </code>
      </p>
      <DocCode lang="tsx">
        {`// In HomeClient.tsx header
<LocationPicker />
// Opens bottom sheet with GPS + saved addresses
// Dispatches setLocationLabel(address) to uiSlice

// Customize saved addresses at top of LocationPicker.tsx:
// Ikon memakai lucide (strokeWidth 1.75), bukan emoji.
const SAVED_ADDRESSES = [
  { id: "1", label: "Home", address: "44 Street Town, New York", icon: Home },
  { id: "2", label: "Work", address: "120 Business Ave, Manhattan", icon: Briefcase },
];`}
      </DocCode>
    </DocSection>
  )
}
