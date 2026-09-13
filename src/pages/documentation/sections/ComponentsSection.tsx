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
  to="/home"            // optional — navigate(to) when set
  label="Kembali"       // optional — defaults to "Kembali"
  className=""           // optional
/>`}
      </DocCode>
      <p className="doc-p">
        Calls <code className="doc-inline">navigate(to)</code> when <code className="doc-inline">to</code> is passed, otherwise <code className="doc-inline">navigate(-1)</code>.
      </p>
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
  name={item.name}  // used in aria-label
  size={18}          // optional — Heart icon size, default 18
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
        . Button-inside-anchor is invalid HTML and causes page reloads on favorite clicks.
      </div>
      <h3 className="doc-h3">
        FoodCard
      </h3>
      <p className="doc-p">
        <code className="doc-inline">
          src/components/ui/FoodCard.tsx
        </code>
      </p>
      <DocCode lang="tsx">
        {`<FoodCard
  food={item}                // Food object
  onOpen={(food) => openSheet(food)}  // called on card click
/>`}
      </DocCode>
      <p className="doc-p">
        Renders image, name, price, delivery time, distance, rating, discount badge (if present), FavoriteButton, and AddToCartButton. The entire card is clickable via <code className="doc-inline">onOpen</code>.
      </p>
      <h3 className="doc-h3">
        AddToCartButton
      </h3>
      <p className="doc-p">
        <code className="doc-inline">
          src/components/ui/AddToCartButton.tsx
        </code>
      </p>
      <DocCode lang="tsx">
        {`<AddToCartButton
  food={item}       // Food object — dispatched to cartSlice
/>`}
      </DocCode>
      <p className="doc-p">
        Dispatches <code className="doc-inline">addItem</code> to the cart slice and shows a toast. Does not navigate away.
      </p>
      <h3 className="doc-h3">
        BottomSheet
      </h3>
      <p className="doc-p">
        <code className="doc-inline">
          src/components/ui/BottomSheet.tsx
        </code>
      </p>
      <DocCode lang="tsx">
        {`<BottomSheet
  open={isOpen}
  title="Detail Item"     // optional
  onClose={() => setOpen(false)}
>
  <p>Sheet content here</p>
</BottomSheet>`}
      </DocCode>
      <p className="doc-p">
        Returns <code className="doc-inline">null</code> when closed. Closes on Escape key and overlay click.
      </p>
      <h3 className="doc-h3">
        MerchantPageHeader
      </h3>
      <p className="doc-p">
        <code className="doc-inline">src/components/merchant/MerchantPageHeader.tsx</code>
        {' '}menyatukan header sticky pada seluruh console merchant. Beri
        <code className="doc-inline">title</code>, optional
        <code className="doc-inline"> eyebrow</code>, dan optional
        <code className="doc-inline"> action</code>; jangan membuat header merchant baru
        per halaman.
      </p>
    </DocSection>
  )
}
