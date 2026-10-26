// Halaman checkout. Sebelumnya ini empty state yang di-hardcode: apa pun isi
// keranjang, yang tampil selalu "Your cart is empty", dan tombolnya memanggil
// navigate('/payment-selection') lewat cabang yang tidak pernah tercapai. Jadi
// prototipenya tidak pernah memperlihatkan pesanan yang sebenarnya ada.
//
// Sekarang isinya dibaca dari store: daftar item, alamat antar, dan ringkasan
// biaya dengan ongkir zona yang sama seperti halaman pembayaran.
import { Bike, Check, Minus, Plus, ShoppingBag, Store, Tag, Trash2 } from 'lucide-react'

import { useState } from 'react'

import { useNavigate, Link } from 'react-router-dom'

import { validatePromo } from '../api/promos'

import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { WalletTopUpGate } from '../components/ui/WalletTopUpGate'
import {
  GST_FOOD_PERCENT,
  PLATFORM_GST_PERCENT,
  formatDistance,
  gstFoodIdr,
  mockMerchant,
  needsTopUpGate,
  platformGstIdr,
} from '../data/merchant'
import { mockUser } from '../data/user'
import { getStorefront, swapBrokenImage } from '../data/storefronts'
import { QUICK_DISPATCH_AVAILABLE } from '../data/marketplace'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { switchBlockCopy } from '../data/superadmin'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useChargedBreakdown } from '../hooks/useChargedBreakdown'
import { useDeliveryQuote } from '../hooks/useDeliveryQuote'
import { useProgramDiscount } from '../hooks/useProgramDiscount'
import { useMoney } from '../hooks/useMoney'
import { selectOtherCarts, selectSubtotal, removeCart, setDeliveryType, setOrderNote, setPromo, switchCart, updateQuantity } from '../store/slices/cartSlice'
import { BackButton } from '../components/ui/BackButton'

/**
 * Daftar keranjang toko lain (PRD §6). Dirender di dua tempat — keranjang aktif
 * berisi maupun kosong — supaya isi keranjang lain tetap terjangkau walau
 * keranjang aktif sedang kosong; setiap baris bisa dipindah atau dibuang.
 */
function OtherCarts({
  carts,
  formatAmount,
  onSwitch,
  onRemove,
}: {
  carts: ReturnType<typeof selectOtherCarts>
  formatAmount: (idr: number) => string
  onSwitch: (merchantId: string) => void
  onRemove: (merchantId: string) => void
}) {
  if (carts.length === 0) return null
  return (
    <div className="checkout-section">
      <h2 className="section-title s7-parallax--title">Keranjang lain</h2>
      <div className="checkout-other-carts">
        {carts.map((cart) => {
          const store = getStorefront(cart.merchantId)
          const name = store?.name ?? 'Toko lain'
          return (
            <div className="checkout-other-cart list-row" key={cart.merchantId}>
              <button
                type="button"
                className="checkout-other-cart__open"
                aria-label={`Buka keranjang ${name}`}
                onClick={() => onSwitch(cart.merchantId)}
              >
                <span className="checkout-other-cart__thumb" aria-hidden="true">
                  {store?.logo ? (
                    <img
                      src={store.logo}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={swapBrokenImage}
                    />
                  ) : (
                    <Store size={18} strokeWidth={1.75} />
                  )}
                </span>
                <span className="checkout-other-cart__text">
                  <span className="checkout-other-cart__name">{name}</span>
                  <span className="checkout-other-cart__meta">{cart.count} item</span>
                </span>
              </button>
              <span className="checkout-other-cart__rail">
                <span className="checkout-other-cart__total">{formatAmount(cart.subtotal)}</span>
                <button
                  type="button"
                  className="checkout-other-cart__drop"
                  aria-label={`Buang keranjang ${name}`}
                  onClick={() => onRemove(cart.merchantId)}
                >
                  <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Checkout() {
  const { money, moneyPlain } = useMoney()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const items = useAppSelector((s) => s.cart.items)
  // Keranjang ganda per toko (PRD §6) + catatan tingkat pesanan (PRD §11).
  const activeMerchantId = useAppSelector((s) => s.cart.activeMerchantId)
  const otherCarts = useAppSelector((s) => selectOtherCarts(s.cart.carts))
  const orderNote = useAppSelector((s) => s.cart.orderNote)
  const activeStore = activeMerchantId ? getStorefront(activeMerchantId) : undefined
  // Toko demo (keranjang lama tanpa merchantId) tetap memakai nama mock; toko
  // yang idnya tak dikenal tampil sebagai "Toko lain" — jangan menamainya
  // dengan toko lain yang kebetulan ada di mock.
  const storeName = activeStore?.name ?? (activeMerchantId ? 'Toko lain' : mockMerchant.name)
  const storeHours = activeStore
    ? `Buka ${activeStore.openTime}–${activeStore.closeTime}`
    : `Buka ${mockMerchant.openTime}–${mockMerchant.closeTime}`
  const stored = useAppSelector((s) => s.cart.addresses)
  const addresses = Array.isArray(stored) ? stored : mockUser.addresses
  const addressId = useAppSelector((s) => s.cart.selectedAddressId)
  const walletAvailable = useAppSelector((s) => s.wallet.balance.available)
  /** Gate saldo awal menahan langkah berikutnya, bukan cuma pesan (R-TOPUP-01). */
  const gated = needsTopUpGate(walletAvailable)

  const subtotal = selectSubtotal(items)
  const address = addresses.find((a) => a.id === addressId) ?? addresses[0]
  const quoteFor = useDeliveryQuote()
  const quote = address ? quoteFor(address) : null
  const deliverable = quote?.covered ?? false
  const fee = quote?.feeIdr ?? 0
  const deliveryType = useAppSelector((s) => s.cart.deliveryType)
  const quickMultiplier = useAppSelector((s) => s.ops.config.quickMultiplier)
  const quickFee = Math.round(fee * quickMultiplier)
  // Promo terpasang (`cart.promo`) memotong total di sini dan di PaymentAmount —
  // satu sumber, jadi dua layar tidak bisa menampilkan angka berbeda.
  const promo = useAppSelector((s) => s.cart.promo)
  // Rincian yang ditagih: `Pc` dari JOD, `Ft` khusus QRIS, tagihan dibulatkan ke
  // atas ratusan (§16.2/§16.3) — satu sumber yang sama dengan layar bayar.
  const charged = useChargedBreakdown()
  const program = useProgramDiscount()
  const total = charged.totalIdr

  // Validasi kode dikerjakan server (`validate_promo`): jendela, kuota, dan
  // kepemilikan merchant diperiksa di sana, bukan di klien.
  const [promoCode, setPromoCode] = useState('')
  const [promoBusy, setPromoBusy] = useState(false)
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const applyPromo = async () => {
    const code = promoCode.trim()
    if (!code) {
      setPromoMsg({ ok: false, text: 'Masukkan kode promo dulu.' })
      return
    }
    setPromoBusy(true)
    try {
      const res = await validatePromo(code, subtotal)
      if (res.valid && res.promoId) {
        dispatch(
          setPromo({ id: res.promoId, code: res.code ?? code, discountIdr: res.discountIdr }),
        )
        setPromoMsg({ ok: true, text: res.message })
        setPromoCode('')
      } else {
        dispatch(setPromo(null))
        setPromoMsg({ ok: false, text: res.message })
      }
    } catch {
      setPromoMsg({ ok: false, text: 'Gagal memeriksa kode — coba lagi.' })
    } finally {
      setPromoBusy(false)
    }
  }
  // Kill switch platform: maintenance menutup semua order baru, jadi gate-nya
  // dipasang di sini juga, bukan hanya di layar SA.
  const switches = useAppSelector((s) => s.superAdmin.switches)
  const maintenanceCopy = switchBlockCopy('maintenance', switches)

  return (
    <div className="app-shell">
      <main>
        <div className="checkout-screen">
          <div className="checkout-header">
            <BackButton className="btn-back" />
            <h1 className="checkout-page-title">Checkout</h1>
            <div className="header-spacer" />
          </div>

          {items.length === 0 ? (
            <div className="checkout-empty-state">
              <div className="empty-cart-icon">
                <ShoppingBag size={52} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h2 className="empty-cart-title">Keranjang masih kosong</h2>
              <p className="empty-cart-text">
                Tambahkan makanan dari menu, lalu kembali ke sini untuk menyelesaikan pesanan.
              </p>
              <button
                type="button"
                className="proceed-btn checkout-empty-cta"
                onClick={() => navigate('/home')}
              >
                Lihat Menu
              </button>
              <OtherCarts
                carts={otherCarts}
                formatAmount={moneyPlain}
                onSwitch={(id) => dispatch(switchCart(id))}
                onRemove={(id) => dispatch(removeCart(id))}
              />
            </div>
          ) : (
            <>
              <div className="checkout-content">
                {/* Toko — memberi konteks bahwa ini satu pesanan dari satu tempat. */}
                <div className="checkout-section">
                  <h2 className="section-title s7-parallax--title">Pesanan dari</h2>
                  <div className="checkout-store s7-parallax--card">
                    <span className="checkout-store__name">{storeName}</span>
                    <span className="checkout-store__hours">{storeHours}</span>
                  </div>
                </div>

                {/* Mode pengantaran (PRD §6, CUS-14..20): Regular lewat batch
                    kurir inhouse, Quick satu order per kurir partner. Ongkir
                    Quick = tarif zona × pengali ops, jadi angkanya tampil di
                    opsi — bukan kejutan di ringkasan. */}
                <div className="checkout-section">
                  <h2 className="section-title s7-parallax--title">Jenis pengantaran</h2>
                  <div
                    className="delivery-mode"
                    role="radiogroup"
                    aria-label="Jenis pengantaran"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={deliveryType === 'regular'}
                      className={`delivery-mode__option${
                        deliveryType === 'regular' ? ' is-selected' : ''
                      }`}
                      onClick={() => dispatch(setDeliveryType('regular'))}
                    >
                      <span className="delivery-mode__title">
                        Regular
                        <span className="delivery-mode__mark" aria-hidden="true">
                          {deliveryType === 'regular' ? <Check size={14} strokeWidth={2.5} /> : null}
                        </span>
                      </span>
                      <span className="delivery-mode__sub">
                        Kurir toko, berbagi rute antar pesanan.
                      </span>
                      <span className="delivery-mode__fee">{moneyPlain(fee)}</span>
                      {/* Baris delta selalu ada di kedua kartu supaya baris harga
                          Quick dan Regular duduk di garis yang sama. */}
                      <span className="delivery-mode__delta" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={deliveryType === 'quick'}
                      className={`delivery-mode__option delivery-mode__option--quick${
                        deliveryType === 'quick' ? ' is-selected' : ''
                      }`}
                      disabled={!QUICK_DISPATCH_AVAILABLE}
                      onClick={() => dispatch(setDeliveryType('quick'))}
                    >
                      <span className="delivery-mode__title">
                        <span className="delivery-mode__name">
                          <Bike size={18} strokeWidth={1.75} aria-hidden="true" />
                          Quick
                        </span>
                        <span className="delivery-mode__mark" aria-hidden="true">
                          {deliveryType === 'quick' ? <Check size={14} strokeWidth={2.5} /> : null}
                        </span>
                      </span>
                      <span className="delivery-mode__sub">
                        Kurir partner, khusus untuk pesananmu.
                      </span>
                      <span className="delivery-mode__fee">{moneyPlain(quickFee)}</span>
                      <span className="delivery-mode__delta">
                        {quickFee > fee ? `+${moneyPlain(quickFee - fee)} dari Regular` : ''}
                      </span>
                    </button>
                  </div>
                  {!QUICK_DISPATCH_AVAILABLE ? (
                    <p className="summary-info-note">
                      Quick belum tersedia — belum ada kurir partner di area ini.
                    </p>
                  ) : null}
                </div>

                {otherCarts.length ? (
                  <OtherCarts
                    carts={otherCarts}
                    formatAmount={moneyPlain}
                    onSwitch={(id) => dispatch(switchCart(id))}
                    onRemove={(id) => dispatch(removeCart(id))}
                  />
                ) : null}

                {/* Catatan pesanan (PRD §11) — tingkat order, bukan per menu. */}
                <div className="checkout-section">
                  <h2 className="section-title s7-parallax--title">Catatan untuk pesanan</h2>
                  <textarea
                    className="checkout-note"
                    value={orderNote}
                    onChange={(e) => dispatch(setOrderNote(e.target.value))}
                    placeholder="mis. jangan pakai bawang, antar ke resepsionis"
                    rows={3}
                  />
                </div>

                {/* Item — setiap baris bisa diubah jumlahnya atau dibuang. */}
                <div className="checkout-section">
                  {/* Menghitung baris, bukan kuantitas. selectCartCount
                      menjumlahkan satuan — Sate Ayam x2 + 1 + 1 = 4 — sehingga
                      judulnya berbunyi "4 item" di atas daftar tiga baris. */}
                  <h2 className="section-title s7-parallax--title">{items.length} item</h2>
                  <div className="checkout-items-list">
                    {items.map((item) => (
                      <div
                        className="checkout-item"
                        key={`${item.id}-${item.modifiers ?? ''}-${item.notes ?? ''}`}
                      >
                        <img
                          className="checkout-item__image"
                          src={item.image}
                          alt=""
                          width={52}
                          height={52}
                        />

                        <div className="checkout-item__info">
                          <span className="checkout-item__name">{item.name}</span>
                          {item.modifiers ? (
                            <span className="checkout-item__modifier">{item.modifiers}</span>
                          ) : null}
                          {item.notes ? (
                            <span className="checkout-item__modifier">Catatan: {item.notes}</span>
                          ) : null}
                          {/* Harga satuan hanya dicetak kalau kuantitasnya > 1.
                              Di kuantitas 1 angkanya identik dengan total baris
                              di kanan, jadi mencetaknya dua kali cuma bising. */}
                          {item.quantity > 1 ? (
                            <span className="checkout-item__unit">
                              {moneyPlain(item.price)} × {item.quantity}
                            </span>
                          ) : null}
                        </div>

                        <div className="checkout-item__side">
                          {/* moneyPlain: pasangan JOD cukup di Total Bayar +
                              catatan kurs (audit 005 #6) — kolom kanan dulu
                              141px menyisakan nama item 107px. */}
                          <span className="checkout-item__total">
                            {moneyPlain(item.price * item.quantity)}
                          </span>

                          {/* Tanpa tombol buang terpisah: menekan - sampai 0
                              sudah menghapus barisnya, dan empat tombol 44px
                              menyisakan hanya 78px untuk nama item sehingga
                              "Sate Kambing" terpotong jadi "Sate Ka...". */}
                          <div className="qty-stepper">
                            <button
                              type="button"
                              aria-label={`Kurangi ${item.name}`}
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    id: item.id,
                                    quantity: item.quantity - 1,
                                  }),
                                )
                              }
                            >
                              <Minus size={16} strokeWidth={1.75} aria-hidden="true" />
                            </button>
                            <span className="qty-stepper__value">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Tambah ${item.name}`}
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    id: item.id,
                                    quantity: item.quantity + 1,
                                  }),
                                )
                              }
                            >
                              <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alamat — angka ongkir di bawah bergantung pada zona alamat ini. */}
                {address ? (
                  <div className="order-summary-section s7-parallax--card">
                    <h2 className="section-title s7-parallax--title">
                      Antar ke
                      <Link className="summary-change-link" to="/address-selection">
                        Ubah
                      </Link>
                    </h2>
                    <div className="summary-item">
                      <span>{address.building}</span>
                      <span className="zone-fee">
                        {address.floor} · {address.unit}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span
                        className={
                          deliverable ? 'zone-badge' : 'zone-badge zone-badge--blocked'
                        }
                      >
                        {deliverable ? 'Dalam jangkauan toko' : 'Di luar jangkauan toko'}
                      </span>
                      <span className="zone-fee">
                        {deliverable
                          ? `${formatDistance(address.distanceMeters)} dari toko · ongkir ${money(fee)}`
                          : `${formatDistance(address.distanceMeters)}, di luar jangkauan toko`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="order-summary-section s7-parallax--card">
                    <h2 className="section-title s7-parallax--title">Antar ke</h2>
                    <div className="summary-item">
                      <span>Belum ada alamat pengantaran</span>
                      <Link className="summary-change-link" to="/address-selection">
                        Tambah
                      </Link>
                    </div>
                  </div>
                )}

                {/* Satu aksi, bukan baris struk: kartunya punya permukaan merek
                    sendiri (.checkout-promo) supaya terbaca sebagai ajakan
                    memasang potongan, bukan potongan yang sudah dihitung. */}
                <div className="checkout-promo s7-parallax--card">
                  <h2 className="checkout-promo__title">
                    <Tag size={16} strokeWidth={1.75} aria-hidden="true" />
                    Kode promo
                  </h2>
                  {promo ? (
                    <div className="checkout-promo__applied">
                      <span>
                        <strong>{promo.code}</strong> terpasang
                      </span>
                      <button
                        type="button"
                        className="summary-change-link"
                        onClick={() => {
                          dispatch(setPromo(null))
                          setPromoMsg(null)
                        }}
                      >
                        Lepas
                      </button>
                    </div>
                  ) : (
                    /* Judul kartu di atas sudah berbunyi "Kode promo", jadi
                       tidak ada label kedua; input + tombol satu baris supaya
                       terbaca sebagai satu kontrol. */
                    <div className="checkout-promo-row">
                      <input
                        id="checkout-promo"
                        className="form-control"
                        aria-label="Kode promo"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value)
                          // Pesan lama ("kode kosong"/hasil sebelumnya) milik
                          // percobaan sebelumnya; mengetik = niat baru.
                          if (promoMsg) setPromoMsg(null)
                        }}
                        placeholder="mis. HEMAT10"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={promoBusy}
                        onClick={() => void applyPromo()}
                      >
                        {promoBusy ? 'Memeriksa…' : 'Terapkan'}
                      </button>
                    </div>
                  )}
                  {promoMsg ? (
                    <p className={promoMsg.ok ? 'summary-info-note' : 'error-message'} role="status">
                      {promoMsg.text}
                    </p>
                  ) : null}
                </div>

                <div className="order-summary-section s7-parallax--card">
                  <h2 className="section-title s7-parallax--title">Ringkasan pesanan</h2>
                  <div className="summary-item">
                    <span>Subtotal</span>
                    <span>{moneyPlain(subtotal)}</span>
                  </div>
                  <div className="summary-item">
                    <span>
                      Ongkir {deliverable && deliveryType === 'quick' ? '(Quick)' : ''}
                    </span>
                    <span>{deliverable ? moneyPlain(charged.deliveryFeeIdr) : 'Tidak berlaku'}</span>
                  </div>
                  <div className="summary-item">
                    <span>Biaya layanan</span>
                    <span>{moneyPlain(charged.platformFeeCustomerIdr)}</span>
                  </div>
                  {/* Ft = 1,5% untuk QRIS saja (§16.2); saldo DANA & COD tidak. */}
                  {charged.transactionFeeIdr > 0 ? (
                    <div className="summary-item">
                      <span>Biaya transaksi QRIS (1,5%)</span>
                      <span>{moneyPlain(charged.transactionFeeIdr)}</span>
                    </div>
                  ) : null}
                  {/* Pajak 2 lapis (R-TAX-01, F4) — info-only di MVP: tidak
                      menambah total, karena tarif & kewajiban setornya belum
                      final (OQ-2/3/4, OQ-17/18). */}
                  <div className="summary-item summary-item--info">
                    <span>
                      GST makanan ({GST_FOOD_PERCENT}%)
                      <span className="summary-info-tag">merchant setor</span>
                    </span>
                    <span>{moneyPlain(gstFoodIdr(subtotal))}</span>
                  </div>
                  <div className="summary-item summary-item--info">
                    <span>
                      GST fee platform ({PLATFORM_GST_PERCENT}%)
                      <span className="summary-info-tag">kewajiban platform</span>
                    </span>
                    <span>{moneyPlain(platformGstIdr())}</span>
                  </div>
                  {/* Catatan ditempel langsung di bawah baris pajak yang
                      dijelaskannya, bukan setelah total, supaya pembaca struk
                      tidak menebak baris mana yang info-only. */}
                  <p className="summary-info-note">
                    Dua baris pajak di atas info-only dan belum masuk total. Tarif serta
                    kewajiban setornya belum final (menunggu konsultan pajak, OQ-17/18).
                  </p>
                  {promo ? (
                    <div className="summary-item">
                      <span>Promo {promo.code}</span>
                      <span>−{moneyPlain(promo.discountIdr)}</span>
                    </div>
                  ) : null}
                  {/* Diskon program marketing (§15): yang dipakai lebih dulu,
                      sisanya (belum didukung / kalah stacking) sebagai catatan
                      — supaya angka total selalu bisa dijelaskan barisnya. */}
                  {program.rows.map((row) => (
                    <div className="summary-item" key={row.id}>
                      <span>
                        {row.name}
                        <span className="summary-info-tag">
                          {row.claimed ? 'kupon kamu' : row.owner === 'merchant' ? 'toko' : 'aplikator'}
                        </span>
                      </span>
                      <span>−{moneyPlain(row.discountIdr)}</span>
                    </div>
                  ))}
                  {program.infoRows.map((row) => (
                    <div className="summary-item summary-item--info" key={row.id}>
                      <span>
                        {row.name}
                        <span className="summary-info-tag">belum dihitung</span>
                      </span>
                      {/* Bukan "0,00 JOD": angka nol di kolom nilai terbaca
                          seperti potongan yang gagal. "Tidak berlaku" sudah jadi
                          bahasa repo untuk baris yang tak menghitung apa pun. */}
                      <span>Tidak berlaku</span>
                    </div>
                  ))}
                  {program.note ? <p className="summary-info-note">{program.note}</p> : null}
                  <div className="summary-divider" />
                  <div className="summary-total">
                    <span>Total Bayar</span>
                    <span>{money(total)}</span>
                  </div>
                  <ExchangeRateNote />
                </div>

                {/* Gate di dalam .checkout-content (audit 005 #1): sebagai
                    anak langsung .checkout-screen ia kehilangan padding 20px
                    dan terukur full-bleed x=0 w=390 / w=430 — kartu satu-satunya
                    yang menempel tepi kolom. PlatformNotice tetap di luar; gutter
                    sampingnya dikembalikan lewat
                    `.checkout-screen > .platform-notice` (komponen hanya punya
                    margin blok, lihat _platform-notice.scss). */}
                <WalletTopUpGate />
              </div>

              {maintenanceCopy ? <PlatformNotice message={maintenanceCopy} /> : null}

              <div className="checkout-actions">
                {/* Alasan tombol nonaktif hidup di labelnya, dan jalan keluarnya
                    ada di WalletTopUpGate / pesan maintenance. Cabang toast di
                    dalam onClick dulu memeriksa kondisi yang sama persis dengan
                    `disabled`, jadi tidak pernah bisa tercapai. */}
                <button
                  type="button"
                  className="proceed-btn"
                  disabled={!deliverable || gated || Boolean(maintenanceCopy)}
                  onClick={() => navigate('/payment-selection')}
                >
                  {maintenanceCopy
                    ? 'Platform maintenance'
                    : addresses.length === 0
                      ? 'Tambah alamat dulu'
                      : !deliverable
                        ? 'Di luar area antar'
                        : gated
                          ? 'Top-up dulu · saldo kurang'
                          : `Lanjut Bayar · ${moneyPlain(total)}`}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
