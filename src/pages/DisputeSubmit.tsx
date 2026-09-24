import { Check, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { BottomSheet } from '../components/ui/BottomSheet'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockMerchant, mockOrder, money } from '../data/merchant'
import { DISPUTE_CATEGORIES, DEMO_DISPUTE_ORDER_IDR } from '../data/admin'
import { idrToJod } from '../data/currency'
import { mockUser } from '../data/user'
import { fileDispute } from '../store/slices/adminSlice'

const MAX_PHOTOS = 3

/* Kategori "Lainnya" satu-satunya yang wajib disertai penjelasan tertulis:
   kategori lain sudah menjelaskan sendiri isi sengketanya. */
const OTHER_CATEGORY = 'Lainnya'

interface DisputeErrors {
  party?: string
  category?: string
  reason?: string
}

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

  const orderCode = params.get('order') ?? mockOrder.code
  const filedBy = params.get('by') === 'merchant' ? 'merchant' : 'customer'

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const orderIdr = cartTotal > 0 ? cartTotal : DEMO_DISPUTE_ORDER_IDR

  // 1× per order (F8): dicek langsung dari queue yang sama dengan yang dipakai
  // panel CS, jadi tidak ada form kedua untuk order yang sudah disengketakan.
  const alreadyFiled = useAppSelector((s) =>
    s.admin.disputes.some((d) => d.orderCode === orderCode),
  )

  const [party, setParty] = useState(() =>
    filedBy === 'merchant' ? mockMerchant.name : mockUser.name,
  )
  const [category, setCategory] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [errors, setErrors] = useState<DisputeErrors>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const requiresReason = category === OTHER_CATEGORY

  /* URL objek tiap pratinjau harus dilepas, kalau tidak blob-nya menahan memori
     selama halaman hidup. Ref dipakai agar pembersihan hanya berjalan saat
     komponen dilepas, bukan tiap kali daftar foto berubah. */
  const photoUrls = useRef<string[]>([])
  useEffect(() => {
    photoUrls.current = photos
  }, [photos])
  useEffect(
    () => () => {
      photoUrls.current.forEach((url) => URL.revokeObjectURL(url))
    },
    [],
  )

  function addPhotos(files: FileList | null) {
    const picked = Array.from(files ?? [])
    if (picked.length === 0) return
    const room = MAX_PHOTOS - photos.length
    if (picked.length > room) toast.error(`Maksimal ${MAX_PHOTOS} foto`)
    const added = picked.slice(0, room).map((file) => URL.createObjectURL(file))
    if (added.length > 0) setPhotos((prev) => [...prev, ...added])
    // Isian file dikosongkan supaya memilih berkas yang sama dua kali tetap terpicu.
    if (fileRef.current) fileRef.current.value = ''
  }

  function removePhoto(url: string) {
    URL.revokeObjectURL(url)
    setPhotos((prev) => prev.filter((item) => item !== url))
  }

  /* Validasi inline, bukan hanya toast: setelah toast hilang, pengguna tidak
     tahu field mana yang salah. `aria-invalid` + pesan di bawah field sudah
     punya gayanya di system/_badges.scss. */
  function validate(): boolean {
    const next: DisputeErrors = {}
    if (!category) next.category = 'Pilih kategori sengketa'
    // Alasan hanya wajib saat kategori "Lainnya"; kategori lain sudah
    // menjelaskan sendiri isi sengketanya.
    if (requiresReason && reason.trim().length < 10) {
      next.reason = 'Pilihan Lainnya wajib dijelaskan, minimal 10 karakter'
    }
    if (!party.trim()) next.party = 'Isi nama pengaju'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (alreadyFiled) {
      toast.error('Order ini sudah pernah disengketakan (1× per order)')
      return
    }
    if (!validate()) return

    dispatch(
      fileDispute({
        orderCode,
        filedBy,
        // Pengaju dan pemilik order adalah dua hal berbeda: saat merchant yang
        // mengajukan, `customerId` tetap customer pemilik order itu.
        partyId: filedBy === 'merchant' ? mockMerchant.id : mockUser.id,
        party: party.trim(),
        customerId: mockUser.id,
        merchantId: mockMerchant.id,
        merchant: mockMerchant.name,
        category,
        reason: reason.trim(),
        photoCount: photos.length,
        amount: idrToJod(orderIdr),
      }),
    )
    toast.success('Sengketa diajukan. Hold dibekukan sampai ada putusan')
    navigate(-1)
  }

  return (
    <div className="app-shell">
      <main className="admin-page">
        {/* Back di sisi kiri, bukan kanan: di ponsel tombol kembali hidup di
            tepi kiri (tempat jempol sudah terbiasa), dan itu yang diharapkan
            pengguna sebelum membaca apa pun. */}
        <header className="admin-header">
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
          <div className="admin-header-copy">
            <h1 className="admin-title">Ajukan Sengketa</h1>
          </div>
        </header>

        <section className="admin-card">
          <p className="admin-card-title">Order {orderCode}</p>
          <p className="admin-card-sub">
            {mockMerchant.name} · nilai order {money(orderIdr)}
          </p>
        </section>

        <form className="admin-form" onSubmit={submit} noValidate>
          {/* Kategori = baris yang membuka bottom sheet berisi daftar, bukan
              `<select>` peramban dan bukan lima baris radio. Satu baris menjaga
              form tetap pendek, sementara daftarnya memakai pola `.sheet-menu`
              yang sama dengan pemilihan kurir di layar order merchant. */}
          <label className="admin-field" htmlFor="dispute-category">
            Kategori sengketa
          </label>
          <button
            id="dispute-category"
            type="button"
            className={category ? 'dispute-picker' : 'dispute-picker is-empty'}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? 'dispute-category-error' : undefined}
            onClick={() => setCategoryOpen(true)}
          >
            {category || 'Pilih kategori'}
            <ChevronRight
              size={18}
              strokeWidth={1.75}
              className="dispute-picker-chevron"
              aria-hidden="true"
            />
          </button>
          {errors.category ? (
            <p className="dispute-error" id="dispute-category-error" role="alert">
              {errors.category}
            </p>
          ) : null}

          <label className="admin-field" htmlFor="dispute-reason">
            Alasan
          </label>
          <textarea
            id="dispute-reason"
            className="form-control"
            rows={4}
            value={reason}
            aria-invalid={Boolean(errors.reason)}
            aria-describedby={errors.reason ? 'dispute-reason-error' : undefined}
            placeholder={
              requiresReason ? 'Jelaskan sengketa kamu' : 'Tambahkan detail kalau perlu'
            }
            onChange={(event) => {
              setReason(event.target.value)
              setErrors((prev) => ({ ...prev, reason: undefined }))
            }}
          />
          {errors.reason ? (
            <p className="dispute-error" id="dispute-reason-error" role="alert">
              {errors.reason}
            </p>
          ) : null}
          <p className="admin-detail-inline">
            {requiresReason
              ? 'Wajib diisi untuk kategori Lainnya, minimal 10 karakter.'
              : category
                ? 'Opsional untuk kategori ini.'
                : 'Wajib kalau kategorinya Lainnya.'}
          </p>

          {/* Foto = petak pratinjau + tombol hapus, bukan `<input type="file">`
              peramban yang menampilkan tombol "Choose Files". Input aslinya
              disembunyikan (`.proof-input` yang sudah ada) dan dipicu petak
              "+ Tambah foto". */}
          <fieldset className="dispute-field">
            <legend className="admin-field">Foto bukti</legend>
            <input
              ref={fileRef}
              className="proof-input"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => addPhotos(event.target.files)}
            />
            <div className="dispute-photos">
              {photos.map((url, index) => (
                <div key={url} className="dispute-photo">
                  <img src={url} alt={`Foto bukti ${index + 1}`} width={96} height={96} />
                  <button
                    type="button"
                    className="dispute-photo-remove"
                    aria-label={`Hapus foto ${index + 1}`}
                    onClick={() => removePhoto(url)}
                  >
                    <X size={16} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS ? (
                <button
                  type="button"
                  className="dispute-photo-add"
                  onClick={() => fileRef.current?.click()}
                >
                  <Plus size={22} strokeWidth={1.75} aria-hidden="true" />
                  <span>Tambah foto</span>
                </button>
              ) : null}
            </div>
            <p className="admin-detail-inline">
              {photos.length > 0
                ? `Opsional. ${photos.length} dari ${MAX_PHOTOS} foto dipilih.`
                : `Opsional, maksimal ${MAX_PHOTOS} foto.`}
            </p>
          </fieldset>

          <label className="admin-field" htmlFor="dispute-party">
            Nama pengaju ({filedBy === 'merchant' ? 'merchant' : 'customer'})
          </label>
          <input
            id="dispute-party"
            className="form-control"
            value={party}
            aria-invalid={Boolean(errors.party)}
            aria-describedby={errors.party ? 'dispute-party-error' : undefined}
            placeholder={filedBy === 'merchant' ? 'Nama perwakilan toko' : 'Nama kamu'}
            onChange={(event) => {
              setParty(event.target.value)
              setErrors((prev) => ({ ...prev, party: undefined }))
            }}
          />
          {errors.party ? (
            <p className="dispute-error" id="dispute-party-error" role="alert">
              {errors.party}
            </p>
          ) : null}

          <button className="btn btn-primary" type="submit" disabled={alreadyFiled}>
            {alreadyFiled ? 'Sudah pernah diajukan' : 'Kirim sengketa'}
          </button>
          {alreadyFiled ? (
            <p className="admin-note" role="status">
              Order {orderCode} sudah ada di antrean panel CS. Batasnya 1× per order.
            </p>
          ) : null}
          <p className="admin-note">
            1× per order, window 24 jam setelah order selesai. Kategori dan window masih sementara
            (OQ-29): form ini state tampilan, bukan aturan yang dikunci.
          </p>
        </form>

        <BottomSheet
          open={categoryOpen}
          title="Kategori sengketa"
          onClose={() => setCategoryOpen(false)}
        >
          <div className="sheet-menu">
            {DISPUTE_CATEGORIES.map((item) => {
              const selected = category === item
              return (
                <button
                  key={item}
                  type="button"
                  className={`sheet-menu__item${selected ? ' is-selected' : ''}`}
                  aria-current={selected}
                  onClick={() => {
                    setCategory(item)
                    // Pindah dari "Lainnya" ke kategori lain membatalkan
                    // kewajiban alasan, jadi pesan wajibnya ikut dibuang.
                    setErrors((prev) => ({
                      ...prev,
                      category: undefined,
                      reason: item === OTHER_CATEGORY ? prev.reason : undefined,
                    }))
                    setCategoryOpen(false)
                  }}
                >
                  <span>{item}</span>
                  {selected ? <Check size={18} strokeWidth={1.75} aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
        </BottomSheet>
      </main>
    </div>
  )
}
