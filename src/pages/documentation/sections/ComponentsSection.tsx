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
      <p className="doc-p">
        Saran pencarian yang bergantian di kolom search hero. Kata-katanya dari katalog
        yang ada (nama menu populer), bukan daftar karangan. Dipakai elemen overlay,
        bukan atribut <code className="doc-inline">placeholder</code>: placeholder tak
        bisa dianimasikan per-kata, tak bisa di-<code className="doc-inline">overflow: hidden</code>,
        dan tetap terlihat saat <code className="doc-inline">value</code> terisi sehingga
        dua teks bertumpuk. Inputnya karena itu{' '}
        <code className="doc-inline">placeholder=&quot;&quot;</code>, dan sarannya
        disembunyikan begitu ada isi. Rotasinya berhenti saat{' '}
        <code className="doc-inline">prefers-reduced-motion</code>. Satu temuan saat
        mengukur: keyframe sempat memakai{' '}
        <code className="doc-inline">translateY(100%)</code> +{' '}
        <code className="doc-inline">opacity: 0</code> dengan{' '}
        <code className="doc-inline">fill-mode: both</code>, sehingga keadaan awalnya
        adalah &ldquo;kata di luar kotak&rdquo; &mdash; kalau animasinya tidak berjalan
        (terukur di klon headless, waktunya beku), yang terlihat cuma kotak kosong, jadi
        sarannya hilang total. Sekarang geserannya 9px (kotak 44px, kata 24px, ruang bebas
        (44&minus;24)/2 = 10px),{' '}
        <code className="doc-inline">fill-mode: none</code>, dan{' '}
        <code className="doc-inline">opacity</code> tidak ikut dianimasikan &mdash; kata
        selalu terbaca di posisi mana pun animasinya berhenti, dan tetap meluncur saat
        normal. Overlay-nya <code className="doc-inline">pointer-events: none</code>,
        diuji dengan klik nyata: ketukan di atasnya tetap memfokuskan{' '}
        <code className="doc-inline">INPUT[name=q]</code>.
      </p>
      <h3 className="doc-h3">
        Carousel promo Home (<code className="doc-inline">.promo-carousel</code>)
      </h3>
      <p className="doc-p">
        Tiga kartu promo beranda bergeser sendiri, di{' '}
        <code className="doc-inline">src/components/customer/HomePromoCarousel.tsx</code>.
        Latarnya tiga gelombang SVG dari bawah
        (<code className="doc-inline">.promo-waves</code>) plus tekstur titik di kanan
        atas, memakai motif yang sama dengan hero beranda supaya seluruh halaman
        terbaca satu keluarga bentuk &mdash; menggantikan tiga lingkaran sepusat yang
        tidak terhubung ke apa pun di aplikasi ini. Jumlah lapisan yang memberi
        kedalaman, bukan gradient pada bentuknya: opasitas pita{' '}
        <code className="doc-inline">6/9/14%</code>, titik{' '}
        <code className="doc-inline">14%</code>, semuanya di dalam batas dekorasi 4&ndash;14%
        di atas oranye. Sudut ditahan di <code className="doc-inline">--radius-lg</code>{' '}
        (12px). Tiap kartu punya bilah aksi selebar kartu dengan target 44px; titik
        penunjuk di kanan atas juga 44px penuh (<code className="doc-inline">--touch-min</code>),
        dengan batang yang terlihat tetap 7px di tengahnya &mdash; target dan bentuknya
        dipisah. Isinya dari data
        yang ada: klaim diskon 30% dari notifikasi promo, sisanya item katalog yang{' '}
        <code className="doc-inline">discountPercent</code>-nya memang terisi &mdash; PRD
        aktif tidak punya fitur promo, jadi tidak ada klaim baru. Pergeseran otomatis
        dijeda saat disentuh dan dimatikan oleh{' '}
        <code className="doc-inline">prefers-reduced-motion</code>. Gaya hidup di{' '}
        <code className="doc-inline">src/styles/system/_home.scss</code>.
      </p>
      <p className="doc-p">
        Dua angka kontras di kartu ini hasil pengukuran, bukan perkiraan, dan keduanya
        pernah salah. Angka promonya memakai{' '}
        <code className="doc-inline">background-clip: text</code> dengan gradien putih
        yang berhenti di <code className="doc-inline">#fffaf3</code> &mdash; ujung krem{' '}
        <code className="doc-inline">#ffe9b8</code> sempat dipakai dan terukur 2.81:1,
        di bawah ambang 3:1 untuk teks besar. Keterangan kecilnya wajib GELAP:{' '}
        <code className="doc-inline">#F15A37</code> terlalu terang untuk teks 12px,
        putih hanya 3.36:1 dan <code className="doc-inline">--orange-soft-ink</code>{' '}
        malah 2.12:1 (keduanya gagal AA 4.5:1), sementara charcoal{' '}
        <code className="doc-inline">--text-primary</code> terukur 4.86:1. Versi
        sebelumnya memakai <code className="doc-inline">opacity: 0.92</code> pada
        keterangan itu, yang dilarang DNA untuk teks kecil di bidang oranye.
      </p>
    </DocSection>
  )
}
