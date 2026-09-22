import { Camera, ChevronLeft } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockMerchant, money } from '../data/merchant'
import { DISPUTE_CATEGORIES, DEMO_DISPUTE_ORDER_IDR } from '../data/admin'
import { idrToJod } from '../data/currency'
import { fileDispute } from '../store/slices/adminSlice'

const MAX_PHOTOS = 3

/**
 * Form "Ajukan Sengketa" — dipakai sisi customer dan merchant (M6, F8).
 *
 * Satu komponen untuk dua peran: keduanya mengirim ke antrean panel admin (CS) yang
 * sama, jadi tidak ada dua form yang harus dijaga sinkron. Pihak pengaju dan
 * kode order dibaca dari query (`?order=&by=`), sisanya dari store.
 */
export default function DisputeSubmit() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [params] = useSearchParams()
  const cartItems = useAppSelector((s) => s.cart.items)

  const orderCode = params.get('order') ?? 'S7-772292'
  const filedBy = params.get('by') === 'merchant' ? 'merchant' : 'customer'

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const orderIdr = cartTotal > 0 ? cartTotal : DEMO_DISPUTE_ORDER_IDR

  // 1× per order (F8): dicek langsung dari queue yang sama dengan yang dipakai
  // panel CS, jadi tidak ada form kedua untuk order yang sudah disengketakan.
  const alreadyFiled = useAppSelector((s) =>
    s.admin.disputes.some((d) => d.orderCode === orderCode),
  )

  const [party, setParty] = useState('')
  const [category, setCategory] = useState('')
  const [reason, setReason] = useState('')
  const [photoCount, setPhotoCount] = useState(0)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (alreadyFiled) {
      toast.error('Order ini sudah pernah disengketakan (1× per order)')
      return
    }
    if (!category) {
      toast.error('Pilih kategori sengketa dulu')
      return
    }
    if (reason.trim().length < 10) {
      toast.error('Alasan minimal 10 karakter')
      return
    }
    if (!party.trim()) {
      toast.error('Isi nama pengaju')
      return
    }

    dispatch(
      fileDispute({
        orderCode,
        filedBy,
        party: party.trim(),
        merchant: mockMerchant.name,
        category,
        reason: reason.trim(),
        photoCount,
        amount: idrToJod(orderIdr),
      }),
    )
    toast.success('Sengketa diajukan — hold dibekukan sampai ada putusan')
    navigate(-1)
  }

  return (
    <div className="app-shell">
      <main className="admin-page">
        <header className="admin-header">
          <div className="admin-header-copy">
            <p className="admin-eyebrow">Sengketa</p>
            <h1 className="admin-title">Ajukan Sengketa</h1>
          </div>
          <div className="admin-header-action">
            <button
              className="admin-back"
              type="button"
              aria-label="Kembali"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={22} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </header>

        <section className="admin-card">
          <p className="admin-card-title">Order {orderCode}</p>
          <p className="admin-card-sub">
            {mockMerchant.name} · nilai order {money(orderIdr)}
          </p>
        </section>

        <form className="admin-form" onSubmit={submit}>
          <label className="admin-field" htmlFor="dispute-party">
            Nama pengaju ({filedBy === 'merchant' ? 'merchant' : 'customer'})
          </label>
          <input
            id="dispute-party"
            className="form-control"
            value={party}
            placeholder={filedBy === 'merchant' ? 'Nama perwakilan toko' : 'Nama kamu'}
            onChange={(event) => setParty(event.target.value)}
          />

          <label className="admin-field" htmlFor="dispute-category">
            Kategori
          </label>
          <select
            id="dispute-category"
            className="form-control"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Pilih kategori</option>
            {DISPUTE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="admin-field" htmlFor="dispute-reason">
            Alasan
          </label>
          <textarea
            id="dispute-reason"
            className="form-control"
            rows={4}
            value={reason}
            placeholder="Ceritakan apa yang tidak sesuai dengan pesanan"
            onChange={(event) => setReason(event.target.value)}
          />

          <label className="admin-field" htmlFor="dispute-photos">
            Foto bukti (opsional, maks {MAX_PHOTOS})
          </label>
          <input
            id="dispute-photos"
            className="form-control"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? [])
              if (files.length > MAX_PHOTOS) {
                toast.error(`Maksimal ${MAX_PHOTOS} foto`)
                event.target.value = ''
                setPhotoCount(0)
                return
              }
              setPhotoCount(files.length)
            }}
          />
          <p className="admin-detail-inline">
            <Camera size={16} strokeWidth={1.75} aria-hidden="true" />
            {photoCount > 0 ? `${photoCount} foto dipilih` : 'Belum ada foto dipilih'}
          </p>

          <button className="btn btn-primary" type="submit" disabled={alreadyFiled}>
            {alreadyFiled ? 'Sudah pernah diajukan' : 'Kirim sengketa'}
          </button>
          {alreadyFiled ? (
            <p className="admin-note" role="status">
              Order {orderCode} sudah ada di antrean panel CS — 1× per order.
            </p>
          ) : null}
          <p className="admin-note">
            1× per order, window 24 jam setelah order selesai. Kategori dan window masih sementara
            (OQ-29) — form ini state tampilan, bukan aturan yang dikunci.
          </p>
        </form>
      </main>
    </div>
  )
}
