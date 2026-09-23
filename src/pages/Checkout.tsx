// Halaman checkout. Sebelumnya ini empty state yang di-hardcode: apa pun isi
// keranjang, yang tampil selalu "Your cart is empty", dan tombolnya memanggil
// navigate('/payment-selection') lewat cabang yang tidak pernah tercapai. Jadi
// prototipenya tidak pernah memperlihatkan pesanan yang sebenarnya ada.
//
// Sekarang isinya dibaca dari store: daftar item, alamat antar, dan ringkasan
// biaya dengan ongkir zona yang sama seperti halaman pembayaran.
import { Minus, Plus, ChevronLeft, ShoppingBag } from 'lucide-react'

import { useNavigate, Link } from 'react-router-dom'

import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { WalletTopUpGate } from '../components/ui/WalletTopUpGate'
import {
  GST_FOOD_PERCENT,
  PLATFORM_FEE_CUSTOMER_IDR,
  PLATFORM_GST_PERCENT,
  deliveryFeeFor,
  formatDistance,
  gstFoodIdr,
  isDeliverable,
  mockMerchant,
  money,
  moneyPlain,
  needsTopUpGate,
  platformGstIdr,
  zoneFor,
} from '../data/merchant'
import { mockUser } from '../data/user'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { switchBlockCopy } from '../data/superadmin'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { selectSubtotal, updateQuantity } from '../store/slices/cartSlice'

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const items = useAppSelector((s) => s.cart.items)
  const stored = useAppSelector((s) => s.cart.addresses)
  const addresses = Array.isArray(stored) ? stored : mockUser.addresses
  const addressId = useAppSelector((s) => s.cart.selectedAddressId)
  const walletAvailable = useAppSelector((s) => s.wallet.balance.available)
  /** Gate saldo awal menahan langkah berikutnya, bukan cuma pesan (R-TOPUP-01). */
  const gated = needsTopUpGate(walletAvailable)

  const subtotal = selectSubtotal(items)
  const address = addresses.find((a) => a.id === addressId) ?? addresses[0]
  const zone = address ? zoneFor(address) : null
  const deliverable = address ? isDeliverable(address) : false
  const fee = address ? deliveryFeeFor(address) : 0
  // Fee customer flat 0,22 JOD (R-FEE-01) — selalu ikut, berapa pun metodenya.
  const total = subtotal + fee + PLATFORM_FEE_CUSTOMER_IDR
  // Kill switch platform: maintenance menutup semua order baru, jadi gate-nya
  // dipasang di sini juga, bukan hanya di layar SA.
  const switches = useAppSelector((s) => s.superAdmin.switches)
  const maintenanceCopy = switchBlockCopy('maintenance', switches)

  return (
    <div className="app-shell">
      <main>
        <div className="checkout-screen">
          <div className="checkout-header">
            <button
              type="button"
              className="btn-back"
              aria-label="Kembali"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={24} strokeWidth={1.75} aria-hidden="true" />
            </button>
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
            </div>
          ) : (
            <>
              <div className="checkout-content">
                {/* Toko — memberi konteks bahwa ini satu pesanan dari satu tempat. */}
                <div className="checkout-section">
                  <h2 className="section-title">Pesanan dari</h2>
                  <div className="checkout-store">
                    <span className="checkout-store__name">{mockMerchant.name}</span>
                    <span className="checkout-store__hours">
                      Buka {mockMerchant.openTime}–{mockMerchant.closeTime}
                    </span>
                  </div>
                </div>

                {/* Item — setiap baris bisa diubah jumlahnya atau dibuang. */}
                <div className="checkout-section">
                  {/* Menghitung baris, bukan kuantitas. selectCartCount
                      menjumlahkan satuan — Sate Ayam x2 + 1 + 1 = 4 — sehingga
                      judulnya berbunyi "4 item" di atas daftar tiga baris. */}
                  <h2 className="section-title">{items.length} item</h2>
                  <div className="checkout-items-list">
                    {items.map((item) => (
                      <div
                        className="checkout-item"
                        key={`${item.id}-${item.modifiers ?? ''}`}
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
                          <span className="checkout-item__total">
                            {money(item.price * item.quantity)}
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
                  <div className="order-summary-section">
                    <h2 className="section-title">
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
                        {deliverable
                          ? `Zona ${zone!.label} · ${zone!.area}`
                          : 'Di luar area antar'}
                      </span>
                      <span className="zone-fee">
                        {deliverable
                          ? `${formatDistance(address.distanceMeters)} dari toko`
                          : `${formatDistance(address.distanceMeters)}, di luar area antar`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="order-summary-section">
                    <h2 className="section-title">Antar ke</h2>
                    <div className="summary-item">
                      <span>Belum ada alamat pengantaran</span>
                      <Link className="summary-change-link" to="/address-selection">
                        Tambah
                      </Link>
                    </div>
                  </div>
                )}

                <div className="order-summary-section">
                  <h2 className="section-title">Ringkasan Pesanan</h2>
                  <div className="summary-item">
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Ongkir {deliverable && zone ? `(Zona ${zone.label})` : ''}</span>
                    <span>{deliverable ? money(fee) : 'Tidak berlaku'}</span>
                  </div>
                  <div className="summary-item">
                    <span>Biaya Layanan</span>
                    <span>{money(PLATFORM_FEE_CUSTOMER_IDR)}</span>
                  </div>
                  {/* Pajak 2 lapis (R-TAX-01, F4) — info-only di MVP: tidak
                      menambah total, karena tarif & kewajiban setornya belum
                      final (OQ-2/3/4, OQ-17/18). */}
                  <div className="summary-item summary-item--info">
                    <span>
                      GST makanan ({GST_FOOD_PERCENT}%)
                      <span className="summary-info-tag">merchant setor</span>
                    </span>
                    <span>{money(gstFoodIdr(subtotal))}</span>
                  </div>
                  <div className="summary-item summary-item--info">
                    <span>
                      GST fee platform ({PLATFORM_GST_PERCENT}%)
                      <span className="summary-info-tag">kewajiban platform</span>
                    </span>
                    <span>{money(platformGstIdr())}</span>
                  </div>
                  {/* Catatan ditempel langsung di bawah baris pajak yang
                      dijelaskannya, bukan setelah total, supaya pembaca struk
                      tidak menebak baris mana yang info-only. */}
                  <p className="summary-info-note">
                    Dua baris pajak di atas info-only dan belum masuk total. Tarif serta
                    kewajiban setornya belum final (menunggu konsultan pajak, OQ-17/18).
                  </p>
                  <div className="summary-divider" />
                  <div className="summary-total">
                    <span>Total Bayar</span>
                    <span>{money(total)}</span>
                  </div>
                  <ExchangeRateNote />
                </div>
              </div>

              <WalletTopUpGate />

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
                          : `Lanjut Bayar · ${money(total)}`}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
