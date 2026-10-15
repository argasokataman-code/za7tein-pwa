// Layar pembayaran DANA (VA / QRIS) — lampiran setelah ringkasan checkout.
//
// Mode sandbox: nomor VA, pola QR, dan tombol "Simulasi" adalah mock; tidak ada
// dana berpindah dan tidak ada kredensial DANA di sini (AGENTS §1). Kontrak
// FE↔BE yang menggantikan mock ini: docs/integration/dana/be-contract.md.
import { useState } from 'react'
import { CheckCircle2, Copy, Download, RefreshCw } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { insertNotification } from '../api/notifications'
import { markOrderPaid } from '../api/orders'
import { BackButton } from '../components/ui/BackButton'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { formatCountdown } from '../data/courier'
import { mockUser } from '../data/user'
import { useApiPaymentMethods } from '../hooks/useApiPaymentMethods'
import { useAppSelector } from '../hooks/useAppStore'
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
  // (termasuk `Ft` QRIS + pembulatan tagihan).
  const charged = useChargedBreakdown()
  const total = charged.totalIdr

  const [deadline, setDeadline] = useState(() => Date.now() + DANA_TTL_MS)
  const [status, setStatus] = useState<'menunggu' | 'dibayar'>('menunggu')
  const { now } = useTick(1000)
  const remaining = Math.max(0, deadline - now)
  // Kedaluwarsa DITURUNKAN dari sisa waktu, bukan disimpan lewat effect: satu
  // sumber (`deadline`) berarti tidak ada render kedua saat hitungan habis.
  const phase: DanaStatus = status === 'menunggu' && remaining === 0 ? 'kedaluwarsa' : status

  const qrCells = QR_CELLS

  // Layar ini hanya untuk VA/QRIS. Metode lain (atau belum dipilih) kembali ke pemilihan.
  if (!isVa && !isQris) return <Navigate to="/payment-selection" replace />

  const copyVa = () => {
    void navigator.clipboard
      .writeText(MOCK_VA.replace(/\s/g, ''))
      .then(() => toast.success('Nomor VA disalin'))
      .catch(() => toast.error('Gagal menyalin nomor'))
  }

  const simulatePaid = () => {
    setStatus('dibayar')
    // Sinkronkan order sampai pembayaran berhasil (f18): merchant baru boleh
    // konfirmasi setelah `payment_status = paid`.
    if (activeOrderId) void markOrderPaid(activeOrderId, 'customer').catch(() => {})
    toast.success('Pembayaran diterima (simulasi)')
    void insertNotification({
      audience: 'customer',
      kind: 'payment',
      title: 'Pembayaran diterima',
      body: 'Pembayaran pesananmu sudah kami terima.',
    }).catch(() => {})
  }

  const restart = () => {
    setDeadline(Date.now() + DANA_TTL_MS)
    setStatus('menunggu')
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
            <BackButton className="btn-back" />
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
                    Kode berlaku 30 menit dan waktunya sudah habis. Buat kode baru atau ganti metode
                    pembayaran.
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
                onClick={() => navigate('/order-placed')}
              >
                Lihat pesanan
              </button>
            ) : null}

            {phase === 'kedaluwarsa' ? (
              <>
                <button type="button" className="btn btn-primary dana-cta" onClick={restart}>
                  Buat kode baru
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
    </div>
  )
}
