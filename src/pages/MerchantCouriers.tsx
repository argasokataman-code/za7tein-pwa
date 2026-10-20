import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRight, Pencil, Phone, Plus, Power, Trash2 } from 'lucide-react'
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
import { addCourier, removeCourier, setCourierDuty, updateCourier } from '../store/slices/merchantSlice'
import type { Courier } from '../types'

const EMPTY_FORM: MerchantCourierFormData = { name: '', phone: '' }

/**
 * Kelola kurir inhouse (MER-16). Kurir adalah karyawan merchant — platform tidak
 * menugaskan order Regular (C-06) — jadi seluruh aksi di sini milik merchant:
 * daftar, jam tugas, hapus. Penugasan kerja bukan di sini: satu kurir di-assign
 * ke **satu batch** di `/merchant/orders` (BR-B07, flow `f25-batch-lifecycle`),
 * jadi tak ada lagi assign per order.
 *
 * Bentuknya satu permukaan berisi baris berambut, bukan kartu per kurir: tiap
 * baris membuka sheet aksi (Ubah / Nonaktifkan / Hapus). Aksi inline di setiap
 * kartu dulu membuat daftar terasa seperti toolbar berulang.
 */
export default function MerchantCouriers() {
  const dispatch = useAppDispatch()
  const couriers = useAppSelector((state) => state.merchant.couriers)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Courier | null>(null)
  const [actionTarget, setActionTarget] = useState<Courier | null>(null)
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
    setEditing(null)
    reset(EMPTY_FORM)
  }

  const openAdd = () => {
    setEditing(null)
    reset(EMPTY_FORM)
    setSheetOpen(true)
  }

  const openEdit = (courier: Courier) => {
    setEditing(courier)
    reset({ name: courier.name, phone: courier.phone })
    setSheetOpen(true)
  }

  const onSubmit = (data: MerchantCourierFormData) => {
    if (editing) {
      dispatch(updateCourier({ id: editing.id, ...data }))
      toast.success(`Data ${data.name} diperbarui`)
    } else {
      dispatch(addCourier(data))
      toast.success(`${data.name} terdaftar sebagai kurir`)
    }
    closeSheet()
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    dispatch(removeCourier({ id: deleteTarget.id }))
    toast.success(`${deleteTarget.name} dihapus dari daftar kurir`)
    setDeleteTarget(null)
  }

  const closeActions = () => setActionTarget(null)

  const editAction = () => {
    if (!actionTarget) return
    openEdit(actionTarget)
    closeActions()
  }

  const toggleAction = () => {
    if (!actionTarget) return
    const onDuty = actionTarget.status === 'offline'
    dispatch(setCourierDuty({ id: actionTarget.id, onDuty }))
    toast.success(`${actionTarget.name} ${onDuty ? 'aktif menerima batch' : 'dinonaktifkan'}`)
    closeActions()
  }

  const deleteAction = () => {
    if (!actionTarget) return
    setDeleteTarget(actionTarget)
    closeActions()
  }

  const closeAllSheets = () => {
    closeSheet()
    closeActions()
    setDeleteTarget(null)
  }

  const sheetTitle = sheetOpen
    ? editing
      ? 'Ubah kurir'
      : 'Tambah kurir'
    : deleteTarget
      ? 'Hapus kurir?'
      : (actionTarget?.name ?? 'Kurir')

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader
          eyebrow={`${couriers.length} kurir terdaftar`}
          title="Kurir"
        />

        {quotaFull ? (
          <p className="merchant-hint-inline">
            Kuota penuh. Hapus satu kurir untuk mendaftarkan yang baru.
          </p>
        ) : null}

        {couriers.length === 0 ? (
          <p className="merchant-empty">Belum ada kurir terdaftar untuk toko ini.</p>
        ) : (
          <ul className="merchant-courier-list">
            {couriers.map((courier) => (
              <li key={courier.id}>
                <button
                  type="button"
                  className="merchant-courier-row list-row"
                  onClick={() => setActionTarget(courier)}
                  aria-label={`Kelola ${courier.name}`}
                >
                  <span className="merchant-courier-copy">
                    <span className="merchant-courier-name">{courier.name}</span>
                    <span className="merchant-courier-meta">
                      {courier.phone}
                      {courier.activeOrderCount > 0
                        ? ` · ${courier.activeOrderCount} order aktif`
                        : ''}
                    </span>
                  </span>
                  <span className="merchant-courier-rail">
                    <span className={`merchant-courier-status is-${courier.status}`}>
                      {COURIER_STATUS_LABEL[courier.status]}
                    </span>
                    <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="merchant-hint-inline">
          Kurir di sini adalah kurir <strong>inhouse</strong> (karyawan toko), dan toko bisa
          mendaftarkan sampai {MAX_COURIERS_PER_MERCHANT} orang. Kamu menugaskan satu kurir ke satu
          batch di{' '}
          <Link className="merchant-link" to="/orders">
            halaman Order
          </Link>
          .
        </p>

        {/* Satu sheet untuk tiga keadaan (aksi / form / konfirmasi hapus).
            Beberapa `BottomSheet` yang saling bergantian di tick yang sama
            bertabrakan pada entri history-nya: sheet lama memanggil
            `history.back()` sementara sheet baru mendorong entri, sehingga
            keduanya bisa tertutup atau halaman ikut berpindah. */}
        <BottomSheet
          open={sheetOpen || actionTarget !== null || deleteTarget !== null}
          title={sheetTitle}
          onClose={closeAllSheets}
        >
          {sheetOpen ? (
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
          ) : deleteTarget ? (
            <>
              <p className="sheet-copy">
                {deleteTarget.name} hilang dari daftar kurir toko, dan order yang sedang
                ditugaskan kepadanya kehilangan kurirnya.
              </p>
              <div className="sheet-actions">
                <button
                  type="button"
                  className="btn sheet-cancel"
                  onClick={() => setDeleteTarget(null)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn merchant-btn-ghost is-danger"
                  onClick={confirmDelete}
                >
                  Hapus kurir
                </button>
              </div>
            </>
          ) : actionTarget ? (
            <>
              <a className="merchant-courier-contact" href={`tel:${actionTarget.phone}`}>
                <Phone size={16} strokeWidth={1.75} aria-hidden="true" />
                {actionTarget.phone}
              </a>
              <p className="merchant-courier-sheet-meta">
                <span className={`merchant-courier-status is-${actionTarget.status}`}>
                  {COURIER_STATUS_LABEL[actionTarget.status]}
                </span>
                {actionTarget.activeOrderCount > 0
                  ? ` · ${actionTarget.activeOrderCount} order aktif`
                  : null}
                {!actionTarget.phoneVerified ? ' · nomor belum diverifikasi' : null}
              </p>

              {actionTarget.status === 'delivering' ? (
                <p className="merchant-courier-note">
                  Sedang mengantar. Status mengikuti checkpoint kurir, jadi data dan jam tugasnya
                  tidak bisa diubah dari sini.
                </p>
              ) : (
                <div className="merchant-courier-sheet-actions">
                  <button type="button" className="btn btn-primary" onClick={editAction}>
                    <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />
                    Ubah data
                  </button>
                  <button type="button" className="merchant-btn-ghost" onClick={toggleAction}>
                    <Power size={16} strokeWidth={1.75} aria-hidden="true" />
                    {actionTarget.status === 'offline' ? 'Aktifkan' : 'Nonaktifkan'}
                  </button>
                  <button
                    type="button"
                    className="merchant-btn-ghost is-danger"
                    onClick={deleteAction}
                  >
                    <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                    Hapus kurir
                  </button>
                </div>
              )}
            </>
          ) : null}
        </BottomSheet>

        {/* Ruang ekstra di ujung daftar supaya baris terakhir tidak tertutup FAB. */}
        <div className="page-fab-spacer" aria-hidden="true" />
      </main>

      {/* "Tambah" ke zona jempol; mati saat kuota kurir penuh (senior-fe mobile G-02/G-03). */}
      <button
        type="button"
        className="page-fab"
        aria-label="Tambah kurir"
        onClick={openAdd}
        disabled={quotaFull}
      >
        <Plus size={22} strokeWidth={1.75} aria-hidden="true" />
      </button>

      <MerchantBottomNav />
    </div>
  )
}
