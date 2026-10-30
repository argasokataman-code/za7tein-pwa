// Layar pembayaran DANA (VA / QRIS) — lampiran setelah ringkasan checkout.
//
// Mode sandbox: nomor VA, pola QR, dan tombol "Simulasi" adalah mock; tidak ada
// dana berpindah dan tidak ada kredensial DANA di sini (AGENTS §1). Kontrak
// FE↔BE yang menggantikan mock ini: docs/integration/dana/be-contract.md.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Copy, Download, RefreshCw } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { insertNotification } from '../api/notifications'
import { markOrderPaid, updateOrderStatus } from '../api/orders'
import { BackButton } from '../components/ui/BackButton'
import { OrderCelebration } from '../components/ui/OrderCelebration'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { formatCountdown } from '../data/courier'
import { mockUser } from '../data/user'
import { clearCart } from '../store/slices/cartSlice'
import { useApiPaymentMethods } from '../hooks/useApiPaymentMethods'
import { useOrderQuota } from '../hooks/useOrderQuota'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useBackClose } from '../hooks/useBackClose'
import { useChargedBreakdown } from '../hooks/useChargedBreakdown'
import { useMoney } from '../hooks/useMoney'
import { useTick } from '../hooks/useTick'

/**
 * Masa berlaku kode pembayaran online: **30 menit** (§16.2 — dana ditahan di
 * akun enterprise sampai selesai/batal/tolak). Sandbox DANA memakai `validUpTo`
 * dari createOrder.
 */
const DANA_TTL_MS = 30 * 60 * 1000

/** Nomor VA contoh. Sandbox asli menerima `paymentCode` dari DANA, bukan nilai ini. */
const MOCK_VA = '8808 1234 5678 9012'

/** QR mock: 15x15 sel. Finders + separators ala QR asli supaya bentuknya
 *  langsung terbaca "kode QR"; sisanya pola deterministik (bukan kode asli). */
const QR_SIDE = 15

function qrMatrix(): boolean[] {
  const cells = Array.from({ length: QR_SIDE * QR_SIDE }, (_, i) => {
    const n = Math.sin(i * 12.9898) * 43758.5453
    return n - Math.floor(n) > 0.52
  })
  const at = (x: number, y: number) => y * QR_SIDE + x
  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4
        cells[at(ox + x, oy + y)] = edge || core
      }
    }
  }
  finder(0, 0)
  finder(QR_SIDE - 7, 0)
  finder(0, QR_SIDE - 7)
  for (let i = 0; i < QR_SIDE; i++) {
    cells[at(i, 7)] = false
    cells[at(7, i)] = false
  }
  return cells
}

const QR_CELLS = qrMatrix()

type DanaStatus = 'menunggu' | 'dibayar' | 'kedaluwarsa'


export default function PaymentDana() {
  const { money } = useMoney()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const stored = useAppSelector((s) => s.cart.addresses)
  const addresses = Array.isArray(stored) ? stored : mockUser.addresses
  const addressId = useAppSelector((s) => s.cart.selectedAddressId)
  const paymentId = useAppSelector((s) => s.cart.selectedPaymentId)
  const activeOrderId = useAppSelector((s) => s.cart.activeOrder?.id)

  const methods = useApiPaymentMethods()
  const method = methods.find((m) => m.id === paymentId)
  const isVa = method?.id === 'dana_va'
  const isQris = method?.id === 'dana_qris'

  const address = addresses.find((a) => a.id === addressId) ?? addresses[0]
  // Total yang ditagih dari sumber yang sama dengan Checkout/PaymentAmount
  // (termasuk `Ft` QRIS + pembulatan tagihan). Keranjang sudah dikosongkan saat
  // order dibuat, jadi struk terakhir jadi cadangan nominal — layar ini tidak
  // boleh jatuh ke 0 setelah keranjang kosong.
  const charged = useChargedBreakdown()
  const receipt = useAppSelector((s) => s.cart.lastReceipt)
  const total = charged.totalIdr || receipt?.totalIdr || 0

  const [deadline] = useState(() => Date.now() + DANA_TTL_MS)
  const [status, setStatus] = useState<'menunggu' | 'dibayar'>('menunggu')
  /** Splash perayaan sekali jalan saat pembayaran berhasil (sebelum ke pelacakan). */
  const [celebrate, setCelebrate] = useState(false)
  const { now } = useTick(1000)
  const remaining = Math.max(0, deadline - now)
  // Kedaluwarsa DITURUNKAN dari sisa waktu, bukan disimpan lewat effect: satu
  // sumber (`deadline`) berarti tidak ada render kedua saat hitungan habis.
  const phase: DanaStatus = status === 'menunggu' && remaining === 0 ? 'kedaluwarsa' : status

  const qrCells = QR_CELLS
  const { release: releaseQuota } = useOrderQuota()
  const expiredHandled = useRef(false)
  /** Pembayaran hanya boleh "diterima" sekali, termasuk saat tap ganda. */
  const paidHandled = useRef(false)
  // Splash perayaan = overlay modal: back menutupnya, bukan memindah halaman
  // (MD-13 NB-02).
  useBackClose(celebrate, () => setCelebrate(false))

  /**
   * Kedaluwarsa = order otomatis batal + kuota dilepas (§7.5, §R-CUS-PAY).
   * Dijalankan sekali; `Buat kode baru` diganti `Pesan ulang` karena ordernya
   * sudah tidak ada lagi di BE (bukan memperpanjang kode yang sama).
   */
  useEffect(() => {
    if (phase !== 'kedaluwarsa' || expiredHandled.current) return
    expiredHandled.current = true
    releaseQuota()
    if (activeOrderId) void updateOrderStatus(activeOrderId, 'batal', 'customer').catch(() => {})
    void insertNotification({
      audience: 'customer',
      kind: 'payment',
      title: 'Pembayaran kedaluwarsa',
      body: 'Batas 30 menit habis, pesanan dibatalkan. Kuota yang ter-reserve sudah dilepas.',
    }).catch(() => {})
  }, [phase, releaseQuota, activeOrderId])

  // Layar ini hanya untuk VA/QRIS. Metode lain (atau belum dipilih) kembali ke pemilihan.
  if (!isVa && !isQris) return <Navigate to="/payment-selection" replace />

  const copyVa = () => {
    void navigator.clipboard
      .writeText(MOCK_VA.replace(/\s/g, ''))
      .then(() => toast.success('Nomor VA disalin'))
      .catch(() => toast.error('Gagal menyalin nomor'))
  }

  const simulatePaid = () => {
    if (paidHandled.current) return
    paidHandled.current = true
    setStatus('dibayar')
    setCelebrate(true)
    // Sinkronkan order sampai pembayaran berhasil (f18): merchant baru boleh
    // konfirmasi setelah `payment_status = paid`.
    if (activeOrderId) void markOrderPaid(activeOrderId, 'customer').catch(() => {})
    // Lunas = isi keranjang sudah menjadi order. Dikosongkan supaya tombol
    // kembali sistem tidak bisa membuka lagi layar bayar yang masih penuh.
    dispatch(clearCart())
    toast.success('Pembayaran diterima (simulasi)')
    void insertNotification({
      audience: 'customer',
      kind: 'payment',
      title: 'Pembayaran diterima',
      body: 'Pembayaran pesananmu sudah kami terima.',
    }).catch(() => {})
  }

  /**
   * Simpan QR sebagai PNG (CUS-32). QR-nya digambar dari matriks yang sama
   * dengan yang tampil, jadi yang diunduh bukan tangkapan layar: skala 12px per
   * sel + margin 4 sel supaya tetap terbaca saat dibuka di galeri.
   */
  const saveQr = () => {
    const scale = 12
    const pad = 4
    const size = (QR_SIDE + pad * 2) * scale
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Warna dari token desain (bukan heks mentah): QR = teks di atas permukaan.
    const styles = getComputedStyle(document.documentElement)
    const foreground = styles.getPropertyValue('--text-primary').trim() || 'black'
    const surface = styles.getPropertyValue('--surface').trim() || 'white'
    ctx.fillStyle = surface
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = foreground
    QR_CELLS.forEach((on, i) => {
      if (!on) return
      ctx.fillRect(
        ((i % QR_SIDE) + pad) * scale,
        (Math.floor(i / QR_SIDE) + pad) * scale,
        scale,
        scale,
      )
    })
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'qris-sa7tein.png'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Gambar QR disimpan')
    }, 'image/png')
  }

  return (
    <div className="app-shell">
      <main>
        <div className="payment-dana-screen">
          <header className="payment-dana-header">
            {/* Setelah dibayar, alur bayar sudah selesai: kembali ke beranda,
                bukan mengulang layar ini dari riwayat. */}
            <BackButton className="btn-back" to={phase === 'dibayar' ? '/home' : undefined} />
            <h1 className="payment-dana-title">
              {phase === 'dibayar' ? 'Pembayaran Berhasil' : 'Pembayaran'}
            </h1>
          </header>

          <div className="payment-dana-content">
            <PlatformNotice message="Mode sandbox: kode, QR, dan tombol di layar ini simulasi. Tidak ada dana berpindah dan tidak ada kredensial DANA yang disimpan di aplikasi." />

            <section className="dana-sheet">
              <div className="dana-sheet__amount">
                <span className="dana-sheet__label">{method?.label}</span>
                <span className="dana-sheet__total">{money(total)}</span>
                <span className="dana-sheet__meta">
                  {address ? `Antar ke ${address.building} · ${address.unit}` : 'Antar ke alamat tersimpan'}
                </span>
              </div>

              {phase === 'menunggu' ? (
                <div className="dana-sheet__code">
                  {isVa ? (
                    <>
                      <h2 className="dana-sheet__title">Nomor Virtual Account</h2>
                      <p className="dana-va">{MOCK_VA}</p>
                      <button type="button" className="dana-copy" onClick={copyVa}>
                        <Copy size={18} strokeWidth={1.75} aria-hidden="true" />
                        Salin nomor
                      </button>
                      <p className="dana-sheet__note">
                        Bayar dari m-banking atau e-wallet apa pun. Kode contoh ini tidak terhubung ke
                        DANA.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="dana-sheet__title">Kode QRIS</h2>
                      <div
                        className="dana-qr"
                        role="img"
                        aria-label="Contoh pola QRIS sandbox, bukan kode yang bisa dipindai"
                      >
                        {qrCells.map((on, i) => (
                          <span
                            key={i}
                            aria-hidden="true"
                            className={on ? 'dana-qr__cell dana-qr__cell--on' : 'dana-qr__cell'}
                          />
                        ))}
                      </div>
                      <p className="dana-sheet__note">
                        Contoh pola, bukan kode yang bisa dipindai. QR asli dibuat DANA (paymentCode).
                      </p>
                      <button type="button" className="dana-copy" onClick={saveQr}>
                        <Download size={18} strokeWidth={1.75} aria-hidden="true" />
                        Simpan QR
                      </button>
                    </>
                  )}
                  <div className="dana-timer" role="status">
                    <RefreshCw size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span>Bayar dalam {formatCountdown(remaining)}</span>
                  </div>
                </div>
              ) : null}

              {phase === 'dibayar' ? (
                <div className="dana-sheet__state dana-sheet__state--done">
                  <CheckCircle2 size={40} strokeWidth={1.75} aria-hidden="true" />
                  <h2 className="dana-sheet__title">Pembayaran diterima</h2>
                  <p className="dana-sheet__note">
                    Pesanan diteruskan ke toko. Simulasi ini menggantikan webhook finish-notify DANA.
                  </p>
                </div>
              ) : null}

              {phase === 'kedaluwarsa' ? (
                <div className="dana-sheet__state">
                  <h2 className="dana-sheet__title">Kode kedaluwarsa</h2>
                  <p className="dana-sheet__note">
                    Kode berlaku 30 menit dan waktunya sudah habis, jadi pesanan dibatalkan dan
                    kuota yang ter-reserve dilepas. Pesan ulang untuk membuat kode baru.
                  </p>
                </div>
              ) : null}
            </section>
          </div>

          <div className="payment-dana-footer">
            {phase === 'menunggu' ? (
              <>
                <button type="button" className="btn btn-primary dana-cta" onClick={simulatePaid}>
                  {isVa ? 'Simulasi bayar via VA' : 'Simulasi bayar via QRIS'}
                </button>
                <button
                  type="button"
                  className="dana-cta-secondary"
                  onClick={() => navigate('/payment-selection')}
                >
                  Ganti metode
                </button>
              </>
            ) : null}

            {phase === 'dibayar' ? (
              <button
                type="button"
                className="btn btn-primary dana-cta"
                onClick={() => navigate('/order-placed', { replace: true })}
              >
                Lihat pesanan
              </button>
            ) : null}

            {phase === 'kedaluwarsa' ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary dana-cta"
                  onClick={() => navigate('/checkout')}
                >
                  Pesan ulang
                </button>
                <button
                  type="button"
                  className="dana-cta-secondary"
                  onClick={() => navigate('/payment-selection')}
                >
                  Ganti metode
                </button>
              </>
            ) : null}
          </div>
        </div>
      </main>

      {/* Splash perayaan pembayaran berhasil: blok `.order-arrived-*` yang sama
          dengan `/order-arrived` + kurir (centang + konfeti, gerakan di
          `_post-order.scss`), jadi tak ada CSS baru. Di-portal ke body supaya
          `position: fixed` tak terjebak containing block transisi halaman. */}
      {celebrate
        ? createPortal(
            <div
              className="order-celebration-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Pembayaran berhasil"
            >
              <OrderCelebration
                title="Pembayaran berhasil"
                message={`${method?.label ?? 'Pembayaran'} diterima. Pesananmu sedang diteruskan ke toko.`}
              >
                <button
                  type="button"
                  className="order-arrived-rate-btn"
                  onClick={() => {
                    setCelebrate(false)
                    navigate('/order-placed', { replace: true })
                  }}
                >
                  Lihat pesanan
                </button>
                <button
                  type="button"
                  className="order-arrived-secondary-btn"
                  onClick={() => {
                    setCelebrate(false)
                    navigate('/home', { replace: true })
                  }}
                >
                  Ke beranda
                </button>
              </OrderCelebration>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
