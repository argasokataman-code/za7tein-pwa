import { ImagePlus, Images, Trash2 } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { SelectField } from '../components/ui/SelectField'
import { isOrderable } from '../data/catalog'
import { mockMerchant } from '../data/merchant'
import { DEFAULT_PROMO_BANNER, MAX_PROMO_SLIDES } from '../data/promoSlides'
import { useCatalog } from '../hooks/useCatalog'
import { useMoney } from '../hooks/useMoney'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { imageFileError, imageToDataUrl } from '../lib/image'
import { addPromoSlide, updatePromoSlide } from '../store/slices/marketingSlice'
import type { PromoSlide } from '../types'

/**
 * Penyunting satu slide carousel. Halaman penuh, bukan sheet: banner 16:9 +
 * tiga field tidak muat di panel 60% tanpa memotong input di balik bar aksi.
 */
export default function MerchantPromoSlideForm() {
  const { slideId } = useParams<{ slideId: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items } = useCatalog()
  const { money } = useMoney()
  const allSlides = useAppSelector((s) => s.marketing.slides)
  const slides = allSlides.filter((slide) => slide.merchantId === mockMerchant.id)
  const existing = slides.find((slide) => slide.id === slideId)
  const isNew = !slideId || slideId === 'new'

  const merchantMenu = items.filter((item) => item.merchantId === mockMerchant.id)
  const menuOptions = merchantMenu.map((item) => ({
    value: item.id,
    label: isOrderable(item) ? item.name : `${item.name} (stok habis)`,
  }))

  const [title, setTitle] = useState(existing?.title ?? '')
  const [menuItemId, setMenuItemId] = useState(existing?.menuItemId ?? '')
  const [image, setImage] = useState<string | null>(existing?.image ?? null)
  const [active, setActive] = useState(existing?.active ?? true)
  const [savingBanner, setSavingBanner] = useState(false)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const linkedFood = merchantMenu.find((item) => item.id === menuItemId)

  const pickBanner = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const error = imageFileError(file)
    if (error) {
      toast.error(error)
      return
    }
    setSavingBanner(true)
    try {
      setImage(await imageToDataUrl(file))
    } catch {
      toast.error('Gambar tidak bisa dibaca')
    } finally {
      setSavingBanner(false)
    }
  }

  const save = () => {
    const food = merchantMenu.find((item) => item.id === menuItemId)
    if (!food) {
      toast.error('Pilih menu yang mau ditampilkan')
      return
    }
    if (!existing && slides.length >= MAX_PROMO_SLIDES) {
      toast.error(`Maksimal ${MAX_PROMO_SLIDES} slide`)
      return
    }
    const next: PromoSlide = {
      id: existing?.id ?? crypto.randomUUID(),
      merchantId: mockMerchant.id,
      menuItemId: food.id,
      title: title.trim() || food.name,
      image,
      active,
    }
    if (existing) {
      dispatch(updatePromoSlide(next))
      toast.success('Slide diperbarui')
    } else {
      dispatch(addPromoSlide(next))
      toast.success('Slide ditambahkan')
    }
    navigate('/promos/carousel')
  }

  if (!isNew && !existing) {
    return (
      <div className="app-shell">
        <main className="merchant-page">
          <MerchantPageHeader
            eyebrow="Promosi beranda"
            title="Slide tidak ditemukan"
            back="/promos/carousel"
          />
          <div className="merchant-card promo-slide-empty">
            <Images size={28} strokeWidth={1.75} aria-hidden="true" />
            <p className="merchant-card-title">Slide sudah tidak ada</p>
            <p className="merchant-card-sub">Kembali ke daftar untuk memilih slide lain.</p>
          </div>
        </main>
        <MerchantBottomNav />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader
          eyebrow="Promosi beranda"
          title={isNew ? 'Tambah slide' : 'Ubah slide'}
          back="/promos/carousel"
        />

        <form
          className="merchant-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
        >
          <div className="form-group">
            <span className="form-label">Banner</span>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={(event) => void pickBanner(event)}
            />
            <button
              type="button"
              className="promo-banner-button"
              aria-label={image ? 'Ganti banner' : 'Pilih banner'}
              disabled={savingBanner}
              onClick={() => bannerInputRef.current?.click()}
            >
              <img src={image ?? DEFAULT_PROMO_BANNER} alt="" width={640} height={360} />
              <span className="promo-banner-overlay">
                <ImagePlus size={16} strokeWidth={1.75} aria-hidden="true" />
                {savingBanner ? 'Menyiapkan…' : image ? 'Ganti banner' : 'Pilih banner'}
              </span>
            </button>
            {image ? (
              <div className="promo-banner-actions">
                <button
                  type="button"
                  className="merchant-btn-ghost is-danger"
                  onClick={() => setImage(null)}
                >
                  <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" /> Hapus banner
                </button>
              </div>
            ) : null}
            <p className="merchant-card-sub">
              Opsional. Tanpa banner, kartu memakai latar promo bawaan.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="promo-slide-title" className="form-label">
              Judul slide
            </label>
            <input
              id="promo-slide-title"
              className="form-control"
              value={title}
              maxLength={48}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={linkedFood ? linkedFood.name : 'Kosongkan untuk memakai nama menu'}
            />
          </div>

          <div className="form-group">
            <span className="form-label">Menu yang ditautkan</span>
            <SelectField
              options={menuOptions}
              value={menuItemId}
              onChange={setMenuItemId}
              label="Menu yang ditautkan"
              placeholder="Pilih menu"
            />
          </div>

          <label className="merchant-row">
            <span>Tampil di carousel</span>
            <span className="toggle-wrap">
              <input
                className="toggle-input"
                type="checkbox"
                checked={active}
                aria-label="Tampilkan slide di carousel"
                onChange={(event) => setActive(event.target.checked)}
              />
              <span className="toggle-slider" />
            </span>
          </label>

          {linkedFood ? (
            <p className="promo-slide-preview">
              Kartu customer: <strong>{title.trim() || linkedFood.name}</strong>
              {linkedFood.discountPercent != null
                ? `, diskon ${linkedFood.discountPercent}% dari ${money(linkedFood.price)}`
                : `, ${money(linkedFood.price)}`}
            </p>
          ) : null}

          <div className="merchant-actions">
            <button type="submit" className="btn btn-primary">
              Simpan slide
            </button>
            <button
              type="button"
              className="merchant-btn-ghost"
              onClick={() => navigate('/promos/carousel')}
            >
              Batal
            </button>
          </div>
        </form>
      </main>

      <MerchantBottomNav />
    </div>
  )
}
