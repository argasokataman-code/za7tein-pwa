import { zodResolver } from '@hookform/resolvers/zod'
import { Bike, Phone, Plus, Power, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { BottomSheet } from '../components/ui/BottomSheet'
import { COURIER_STATUS_LABEL } from '../data/courier'
import { MAX_COURIERS_PER_MERCHANT } from '../data/merchant'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { merchantCourierSchema, type MerchantCourierFormData } from '../lib/schemas'
import { addCourier, removeCourier, setCourierDuty } from '../store/slices/merchantSlice'
import type { Courier } from '../types'

const EMPTY_FORM: MerchantCourierFormData = { name: '', phone: '' }

/**
 * Kelola kurir toko (M5). Kurir adalah karyawan merchant — platform tidak
 * pernah menugaskan (C-06) — jadi seluruh aksi di sini milik merchant:
 * daftar, jam tugas, hapus, dan memilih kurir untuk sebuah order (di halaman
 * Order, F12 `:assign` → `hold_cut`).
 */
export default function MerchantCouriers() {
  const dispatch = useAppDispatch()
  const couriers = useAppSelector((state) => state.merchant.couriers)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Courier | null>(null)

  const quotaFull = couriers.length >= MAX_COURIERS_PER_MERCHANT

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MerchantCourierFormData>({
    resolver: zodResolver(merchantCourierSchema),
    defaultValues: EMPTY_FORM,
  })

  const closeSheet = () => {
    setSheetOpen(false)
    reset(EMPTY_FORM)
  }

  const onSubmit = (data: MerchantCourierFormData) => {
    dispatch(addCourier(data))
    toast.success(`${data.name} terdaftar sebagai kurir`)
    closeSheet()
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    dispatch(removeCourier({ id: deleteTarget.id }))
    toast.success(`${deleteTarget.name} dihapus dari daftar kurir`)
    setDeleteTarget(null)
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader
          eyebrow={`${couriers.length} / ${MAX_COURIERS_PER_MERCHANT} kurir terdaftar`}
          title="Kurir"
        />

        {quotaFull ? (
          <p className="merchant-hint-inline">
            Kuota kurir penuh. Hapus satu kurir dulu untuk mendaftarkan yang baru.
          </p>
        ) : (
          <button type="button" className="merchant-add-btn" onClick={() => setSheetOpen(true)}>
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            Tambah kurir
          </button>
        )}

        {couriers.length === 0 ? (
          <p className="merchant-empty">Belum ada kurir terdaftar untuk toko ini.</p>
        ) : (
          couriers.map((courier) => (
            <section key={courier.id} className="merchant-courier">
              <span className="merchant-courier-icon">
                <Bike size={22} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div className="merchant-courier-body">
                <p className="merchant-card-title">{courier.name}</p>
                <p className="merchant-card-sub">
                  {COURIER_STATUS_LABEL[courier.status] ?? courier.status} ·{' '}
                  {courier.activeOrderCount} order aktif
                  {courier.phoneVerified ? null : ' · nomor belum diverifikasi'}
                </p>
                <a className="merchant-courier-phone" href={`tel:${courier.phone}`}>
                  <Phone size={14} strokeWidth={1.75} aria-hidden="true" /> {courier.phone}
                </a>

                {courier.status === 'delivering' ? (
                  <p className="merchant-hint-inline">
                    Sedang mengantar — status ini datang dari checkpoint kurir, bukan dari toko.
                  </p>
                ) : (
                  <div className="merchant-actions">
                    <button
                      type="button"
                      className="merchant-btn-ghost"
                      onClick={() =>
                        dispatch(
                          setCourierDuty({ id: courier.id, onDuty: courier.status === 'offline' }),
                        )
                      }
                    >
                      <Power size={16} strokeWidth={1.75} aria-hidden="true" />
                      {courier.status === 'offline' ? 'Aktifkan' : 'Nonaktifkan'}
                    </button>
                    <button
                      type="button"
                      className="merchant-btn-ghost"
                      onClick={() => setDeleteTarget(courier)}
                    >
                      <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                      Hapus
                    </button>
                  </div>
                )}
              </div>
              <span className={`merchant-badge merchant-badge-${courier.status}`}>
                {COURIER_STATUS_LABEL[courier.status] ?? courier.status}
              </span>
            </section>
          ))
        )}

        <p className="merchant-hint-inline">
          Platform tidak menugaskan kurir (C-06) — toko memilih sendiri kurir tiap order di{' '}
          <Link className="merchant-link" to="/orders">
            halaman Order
          </Link>
          .
        </p>

        <BottomSheet open={sheetOpen} title="Tambah kurir" onClose={closeSheet}>
          <form className="merchant-form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="merchant-courier-name" className="form-label">
                Nama kurir
              </label>
              <input
                id="merchant-courier-name"
                className={`form-control${errors.name ? ' error' : ''}`}
                {...register('name')}
              />
              {errors.name && <span className="error-message">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="merchant-courier-phone" className="form-label">
                Nomor WA
              </label>
              <input
                id="merchant-courier-phone"
                type="tel"
                inputMode="tel"
                className={`form-control${errors.phone ? ' error' : ''}`}
                {...register('phone')}
              />
              {errors.phone && <span className="error-message">{errors.phone.message}</span>}
            </div>
            <div className="merchant-actions">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                Simpan
              </button>
              <button type="button" className="merchant-btn-ghost" onClick={closeSheet}>
                Batal
              </button>
            </div>
          </form>
        </BottomSheet>

        <BottomSheet
          open={deleteTarget !== null}
          title="Hapus kurir?"
          onClose={() => setDeleteTarget(null)}
        >
          <p className="merchant-delete-message">
            {deleteTarget?.name} hilang dari daftar kurir toko, dan order yang sedang ditugaskan
            kepadanya kehilangan kurirnya.
          </p>
          <div className="merchant-actions">
            <button
              type="button"
              className="merchant-btn-ghost"
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </button>
            <button type="button" className="merchant-delete-confirm" onClick={confirmDelete}>
              Hapus kurir
            </button>
          </div>
        </BottomSheet>
      </main>
      <MerchantBottomNav />
    </div>
  )
}
