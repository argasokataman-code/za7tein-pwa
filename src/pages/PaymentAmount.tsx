// Ringkasan checkout: subtotal + ongkir zona, metode bayar (saldo / COD / DANA
// VA / QRIS), dan unggah bukti transfer untuk pesanan transfer legacy.
import { Check } from 'lucide-react'

import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { createOrder, nextOrderCode } from '../api/orders'
import { insertNotification } from '../api/notifications'
import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { WalletTopUpGate } from '../components/ui/WalletTopUpGate'
import {
  PLATFORM_FEE_CUSTOMER_IDR,
  deliveryFeeFor,
  formatDistance,
  isDeliverable,
  needsTopUpGate,
  zoneFor,
} from '../data/merchant'
import { mockMerchant } from '../data/merchant'
import { mockUser } from '../data/user'
import { useApiPaymentMethods } from '../hooks/useApiPaymentMethods'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useMoney } from '../hooks/useMoney'
import {
  selectSubtotal,
  setTransferProof,
  setPromo,
  createOrderHold,
  setActiveOrder,
  setOrderStage,
} from '../store/slices/cartSlice'
import { applyHoldEvent } from '../store/slices/walletSlice'
import { BackButton } from '../components/ui/BackButton'

export default function PaymentAmount() {
  const { money } = useMoney()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const fileRef = useRef<HTMLInputElement>(null)

  const items = useAppSelector((s) => s.cart.items)
  const stored = useAppSelector((s) => s.cart.addresses)
  const addresses = Array.isArray(stored) ? stored : mockUser.addresses
  const addressId = useAppSelector((s) => s.cart.selectedAddressId)
  const paymentId = useAppSelector((s) => s.cart.selectedPaymentId)
  const proof = useAppSelector((s) => s.cart.transferProof)
  // Daftar + urutan metode dari BE (mock dulu, API menimpa).
  const methods = useApiPaymentMethods()

  const subtotal = selectSubtotal(items)
  const address = addresses.find((a) => a.id === addressId) ?? addresses[0]
  const zone = address ? zoneFor(address) : null
  const deliverable = address ? isDeliverable(address) : false
  const fee = address ? deliveryFeeFor(address) : 0
  // Promo terpasang di Checkout memotong total di sini juga — sumber yang sama
  // (`cart.promo`), jadi ringkasan Checkout dan layar bayar tak bisa berbeda.
  const promo = useAppSelector((s) => s.cart.promo)
  const promoDiscountIdr = promo?.discountIdr ?? 0
  const total = Math.max(0, subtotal + fee + PLATFORM_FEE_CUSTOMER_IDR - promoDiscountIdr)
  const method = methods.find((m) => m.id === paymentId) ?? methods[0]
  const needsProof = method.id === 'transfer'
  /** VA/QRIS (DANA): order dibuat di sini, pembayaran diselesaikan di layar berikutnya. */
  const isDana = method.id === 'dana_va' || method.id === 'dana_qris'
  const walletAvailable = useAppSelector((s) => s.wallet.balance.available)
  const gated = needsTopUpGate(walletAvailable)
  /**
   * COD memakai hold dari saldo wallet (R-COD-01), jadi nominal order harus
   * benar-benar tersedia. Gate 3,5 JOD cuma ambang akun baru — bukan jaminan
   * saldo cukup untuk order ini.
   */
  const holdShort = method.id === 'cod' && walletAvailable < total
  const canPay =
    deliverable && items.length > 0 && (!needsProof || proof !== null) && !gated && !holdShort

  const pickProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    dispatch(setTransferProof(file.name))
    toast.success('Bukti transfer diunggah')
  }

  const pay = () => {
    if (!deliverable) {
      toast.error('Alamat di luar area antar')
      return
    }
    if (items.length === 0) {
      toast.error('Keranjang masih kosong')
      return
    }
    if (needsProof && !proof) {
      toast.error('Unggah bukti transfer dulu')
      return
    }
    if (gated) {
      toast.error('Saldo di bawah 3,5 JOD — top-up dulu')
      return
    }
    if (holdShort) {
      toast.error('Saldo tidak cukup untuk hold COD')
      return
    }
    if (method.id === 'cod') {
      // Order COD dibuat → saldo ditahan. Satu transisi = satu entry hold.
      dispatch(createOrderHold({ amountIdr: total }))
      dispatch(applyHoldEvent({ event: 'hold_created', amountIdr: total }))
    }
    // Tulis order ke backend (best-effort): UI tetap jalan sebagai mock kalau
    // jaringan/RLS menolak, jadi kegagalan tidak menghalangi navigasi.
    // Sukses → simpan id/code order ke store supaya pelacakan customer membaca
    // status live (`orders.status`) + realtime, bukan `mockOrder`.
    // Satu kode untuk dua jalur (flow f1: `POST /orders` → `GET /orders/{id}`).
    // BE menerima → kode itu dilacak live; BE menolak (RLS/jaringan) → order tetap
    // dicatat lokal dengan kode yang sama supaya pelacakan menampilkan pesanan
    // ini, bukan `mockOrder` yang tak nyambung dengan yang barusan dibuat.
    const code = nextOrderCode()
    void createOrder({
      code,
      subTotalIdr: subtotal,
      deliveryFeeIdr: fee,
      platformFeeIdr: PLATFORM_FEE_CUSTOMER_IDR,
      totalIdr: total,
      paymentMethod: method.id,
      zoneCode: zone?.id,
      promoId: promo?.id ?? null,
      promoDiscountIdr,
    })
      .then((created) => {
        dispatch(setActiveOrder(created))
        dispatch(setOrderStage('baru'))
        // Promo sudah dipakai order ini — lepas supaya tak terpasang lagi di
        // pesanan berikutnya (kuota `max_uses` dihitung server saat insert).
        dispatch(setPromo(null))
      })
      .catch(() => {
        // Best-effort (AGENTS.md §1): UI tetap jalan mock. `id` kosong → id
        // non-numerik, jadi `useApiRealtime` tak memanggil `fetchCustomerOrder`
        // (tak ada permintaan sia-sia); status live menyusul begitu BE pulih.
        dispatch(setActiveOrder({ id: '', code }))
        dispatch(setOrderStage('baru'))
        toast.error('Order belum tersinkron ke server — pelacakan live menyusul.')
      })
    // Emit notifikasi (best-effort): merchant dapat order baru; customer dapat
    // konfirmasi pembayaran untuk metode non-COD.
    void insertNotification({
      audience: 'merchant',
      kind: 'order',
      title: 'Order baru masuk',
      body: 'Ada pesanan baru menunggu konfirmasi toko.',
    }).catch(() => {})
    // VA/QRIS DANA: order sudah dibuat, pembayaran belum lunas. Layar VA/QR yang
    // menunggu konfirmasi; notifikasi "Pembayaran diterima" menyusul saat webhook
    // DANA menandai `paid` (kontrak: docs/integration/dana/be-contract.md §4).
    if (isDana) {
      void insertNotification({
        audience: 'customer',
        kind: 'payment',
        title: 'Menunggu pembayaran',
        body: `Selesaikan pembayaran ${method.label} sebelum kode kedaluwarsa.`,
      }).catch(() => {})
      navigate('/payment-dana')
      return
    }
    if (method.id !== 'cod') {
      void insertNotification({
        audience: 'customer',
        kind: 'payment',
        title: 'Pembayaran diterima',
        body: 'Pembayaran pesananmu sudah kami terima.',
      }).catch(() => {})
    }
    navigate('/order-placed')
  }

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="payment-amount-screen">
            <header className="payment-amount-header">
              <BackButton className="btn-back" />
              <h1 className="payment-amount-title">
                Checkout
              </h1>
            </header>
            <div className="payment-amount-content">
              {address ? (
                <div className="order-summary-section">
                  <h2 className="section-title">Antar ke</h2>
                  <div className="summary-item">
                    <span>{address.building}</span>
                    <span className="zone-fee">{address.floor} · {address.unit}</span>
                  </div>
                  <div className="summary-item">
                    <span className={deliverable ? 'zone-badge' : 'zone-badge zone-badge--blocked'}>
                      {deliverable ? `Zona ${zone!.label} · ${zone!.area}` : 'Di luar area antar'}
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
                    <span className="zone-fee">Kembali untuk menambah</span>
                  </div>
                </div>
              )}

              <div className="order-summary-section">
                <h2 className="section-title">
                  Order Summary
                </h2>
                <div className="summary-item">
                  <span>
                    Order Amount
                  </span>
                  <span>
                    {money(subtotal)}
                  </span>
                </div>
                <div className="summary-item">
                  <span>
                    Ongkir {deliverable && zone ? `(Zona ${zone.label})` : ''}
                  </span>
                  <span>
                    {deliverable ? money(fee) : '—'}
                  </span>
                </div>
                <div className="summary-item">
                  <span>
                    Biaya Layanan
                  </span>
                  <span>
                    {money(PLATFORM_FEE_CUSTOMER_IDR)}
                  </span>
                </div>
                <div className="summary-item">
                  <span>
                    Diskon
                  </span>
                  <span>
                    {money(0)}
                  </span>
                </div>
                <div className="summary-divider" />
                <div className="summary-total">
                  <span>
                    Total Bayar
                  </span>
                  <span>
                    {money(total)}
                  </span>
                </div>
                <ExchangeRateNote />
              </div>

              <div className="payment-method-display">
                <h2 className="section-title">
                  Metode Pembayaran
                </h2>
                <div className="payment-method-card">
                  <div className="payment-method-row">
                    <span className="payment-method-label">{method.label}</span>
                    <button type="button" className="payment-change-btn" onClick={() => navigate('/payment-selection')}>
                      Ganti
                    </button>
                  </div>
                  <p className="payment-method-note">
                    {method.id === 'transfer'
                      ? `Transfer ke ${mockMerchant.bank.name} ${mockMerchant.bank.account} a/n ${mockMerchant.bank.holder}`
                      : method.description}
                  </p>

                  {needsProof ? (
                    <>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="proof-input"
                        onChange={pickProof}
                      />
                      <button
                        type="button"
                        className={proof ? 'proof-upload proof-upload--done' : 'proof-upload'}
                        onClick={() => fileRef.current?.click()}
                      >
                        {proof ? (
                          <>
                            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                            {proof}
                          </>
                        ) : (
                          'Unggah Bukti Transfer'
                        )}
                      </button>
                      <p className="payment-method-note">
                        {proof
                          ? 'Bukti terunggah. Pesanan diteruskan ke toko untuk diverifikasi.'
                          : 'Pesanan tidak bisa dikirim sebelum bukti transfer diunggah.'}
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            <WalletTopUpGate />
            {holdShort ? (
              <p className="wallet-warning" role="status">
                Saldo tersedia {money(walletAvailable)} — kurang dari {money(total)} yang perlu
                di-hold untuk COD.
              </p>
            ) : null}
            <div className="payment-amount-footer">
              <button className="btn btn-primary pay-btn" disabled={!canPay} onClick={pay}>
                {gated
                  ? 'Top-up dulu · saldo kurang'
                  : holdShort
                    ? 'Saldo kurang untuk hold COD'
                    : method.id === 'cod'
                      ? `Pesan — ${money(total)}`
                      : isDana
                        ? `Lanjut bayar · ${money(total)}`
                        : `Bayar — ${money(total)}`}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
