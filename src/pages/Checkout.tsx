// Halaman checkout. Sebelumnya ini empty state yang di-hardcode: apa pun isi
// keranjang, yang tampil selalu "Your cart is empty", dan tombolnya memanggil
// navigate('/payment-selection') lewat cabang yang tidak pernah tercapai. Jadi
// prototipenya tidak pernah memperlihatkan pesanan yang sebenarnya ada.
//
// Sekarang isinya dibaca dari store: daftar item, alamat antar, dan ringkasan
// biaya dengan ongkir zona yang sama seperti halaman pembayaran.
import { Minus, Plus } from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { formatDistance, isDeliverable, mockMerchant, rupiah, zoneFor } from '../data/merchant'
import { mockUser } from '../data/user'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { selectSubtotal, updateQuantity } from '../store/slices/cartSlice'

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const items = useAppSelector((s) => s.cart.items)
  const stored = useAppSelector((s) => s.cart.addresses)
  const addresses = stored?.length ? stored : mockUser.addresses
  const addressId = useAppSelector((s) => s.cart.selectedAddressId)

  const subtotal = selectSubtotal(items)
  const address = addresses.find((a) => a.id === addressId) ?? addresses[0]
  const zone = address ? zoneFor(address.distanceMeters) : null
  const deliverable = address ? isDeliverable(address.distanceMeters) : false
  const fee = deliverable ? (zone?.fee ?? 0) : 0
  const total = subtotal + fee

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
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="checkout-page-title">Checkout</h1>
            <div className="header-spacer" />
          </div>

          {items.length === 0 ? (
            <div className="checkout-empty-state">
              <div className="empty-cart-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={52}
                  height={52}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M16 10a4 4 0 0 1-8 0" />
                  <path d="M3.103 6.034h17.794" />
                  <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
                </svg>
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
                          <span className="checkout-item__unit">{rupiah(item.price)}</span>
                        </div>

                        <div className="checkout-item__side">
                          <span className="checkout-item__total">
                            {rupiah(item.price * item.quantity)}
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
                              <Minus size={16} strokeWidth={2} aria-hidden="true" />
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
                              <Plus size={16} strokeWidth={2} aria-hidden="true" />
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
                    <h2 className="section-title">Antar ke</h2>
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
                          ? `Zona ${zone!.id} · ${zone!.range}`
                          : 'Di luar jangkauan'}
                      </span>
                      <span className="zone-fee">
                        {deliverable
                          ? `${formatDistance(address.distanceMeters)} dari toko`
                          : `${formatDistance(address.distanceMeters)} — maksimal 2 km`}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="order-summary-section">
                  <h2 className="section-title">Ringkasan Pesanan</h2>
                  <div className="summary-item">
                    <span>Subtotal</span>
                    <span>{rupiah(subtotal)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Ongkir {deliverable && zone ? `(Zona ${zone.id})` : ''}</span>
                    <span>{deliverable ? rupiah(fee) : '—'}</span>
                  </div>
                  <div className="summary-item">
                    <span>Diskon</span>
                    <span>{rupiah(0)}</span>
                  </div>
                  <div className="summary-divider" />
                  <div className="summary-total">
                    <span>Total Bayar</span>
                    <span>{rupiah(total)}</span>
                  </div>
                </div>
              </div>

              <div className="checkout-actions">
                <button
                  type="button"
                  className="proceed-btn"
                  disabled={!deliverable}
                  onClick={() => {
                    if (!deliverable) {
                      toast.error('Alamat di luar jangkauan 2 km')
                      return
                    }
                    navigate('/payment-selection')
                  }}
                >
                  {deliverable ? `Lanjut Bayar · ${rupiah(total)}` : 'Di luar jangkauan'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
