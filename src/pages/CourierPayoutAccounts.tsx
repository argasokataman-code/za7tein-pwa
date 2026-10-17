import { zodResolver } from '@hookform/resolvers/zod'
import { Landmark, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'


import {
  createPayoutAccount,
  deletePayoutAccount,
  fetchPayoutAccounts,
  PAYOUT_COURIER_USER_ID,
  setPrimaryPayoutAccount,
  updatePayoutAccount,
} from '../api/payout'
import { apiEnabled } from '../api/supabase'
import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { SelectField } from '../components/ui/SelectField'
import { BANK_OPTIONS } from '../data/payout'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { payoutAccountSchema, type PayoutAccountFormData } from '../lib/schemas'
import {
  addPayoutAccount,
  removePayoutAccount,
  replacePayoutAccounts,
  setPrimaryPayoutAccount as setPrimaryPayoutAccountLocal,
  updatePayoutAccount as updatePayoutAccountLocal,
} from '../store/slices/courierSlice'
import type { PayoutAccount } from '../types'

const EMPTY_FORM: PayoutAccountFormData = { bankName: '', accountNumber: '', holderName: '' }

/**
 * CRUD rekening pencairan tips kurir (R-WALLET-01, f6). Kurir sebelumnya tidak
 * punya tempat menyimpan rekening sama sekali; tips hanya bisa dilihat.
 */
export default function CourierPayoutAccounts() {
  const dispatch = useAppDispatch()
  const accounts = useAppSelector((s) => s.courier.payoutAccounts)

  const [sheetMode, setSheetMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<PayoutAccount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PayoutAccount | null>(null)

  // Baca live; mock tetap kalau kurir belum punya rekening di BE.
  useEffect(() => {
    if (!apiEnabled) return
    fetchPayoutAccounts(PAYOUT_COURIER_USER_ID)
      .then((list) => {
        if (list.length) dispatch(replacePayoutAccounts(list))
      })
      .catch(() => {})
  }, [dispatch])

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PayoutAccountFormData>({
    resolver: zodResolver(payoutAccountSchema),
    defaultValues: EMPTY_FORM,
  })

  const openAdd = () => {
    reset(EMPTY_FORM)
    setEditing(null)
    setSheetMode('add')
  }

  const openEdit = (account: PayoutAccount) => {
    reset({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      holderName: account.holderName,
    })
    setEditing(account)
    setSheetMode('edit')
  }

  const closeSheet = () => {
    setSheetMode(null)
    setEditing(null)
  }

  const onSubmit = (data: PayoutAccountFormData) => {
    if (sheetMode === 'edit' && editing) {
      dispatch(updatePayoutAccountLocal({ id: editing.id, ...data }))
      void updatePayoutAccount(editing.id, data).catch(() => {})
      toast.success('Rekening diperbarui')
    } else {
      dispatch(addPayoutAccount(data))
      void createPayoutAccount(PAYOUT_COURIER_USER_ID, data).catch(() => {})
      toast.success('Rekening ditambahkan')
    }
    closeSheet()
  }

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader
          eyebrow="Penghasilan"
          title="Rekening pencairan"
          back="/wallet"
        />

        <button type="button" className="courier-add-btn" onClick={openAdd}>
          <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
          Tambah rekening
        </button>

        {accounts.length === 0 ? (
          <p className="courier-empty">Belum ada rekening. Tambahkan satu untuk bisa mencairkan tips.</p>
        ) : (
          <ul className="courier-account-list">
            {accounts.map((account) => (
              <li key={account.id} className="courier-account-card">
                <div className="courier-account-card-head">
                  <Landmark size={20} strokeWidth={1.75} aria-hidden="true" />
                  <div className="courier-account-card-body">
                    <p className="courier-card-title">
                      {account.bankName} · {account.accountNumber}
                    </p>
                    <p className="courier-card-sub">a.n. {account.holderName}</p>
                  </div>
                  {account.isPrimary ? (
                    <span className="courier-account-primary">
                      <Star size={13} strokeWidth={2} aria-hidden="true" /> Utama
                    </span>
                  ) : null}
                </div>
                <div className="courier-account-actions">
                  {!account.isPrimary ? (
                    <button
                      type="button"
                      className="courier-secondary-link"
                      onClick={() => {
                        dispatch(setPrimaryPayoutAccountLocal({ id: account.id }))
                        void setPrimaryPayoutAccount(PAYOUT_COURIER_USER_ID, account.id).catch(() => {})
                        toast.success('Rekening utama diperbarui')
                      }}
                    >
                      Jadikan utama
                    </button>
                  ) : null}
                  <button type="button" className="courier-secondary-link" onClick={() => openEdit(account)}>
                    <Pencil size={15} strokeWidth={1.75} /> Ubah
                  </button>
                  <button
                    type="button"
                    className="courier-secondary-link is-danger"
                    onClick={() => setDeleteTarget(account)}
                  >
                    <Trash2 size={15} strokeWidth={1.75} /> Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

      </main>
      <CourierBottomNav />

      <BottomSheet
        open={sheetMode !== null}
        title={sheetMode === 'edit' ? 'Ubah rekening' : 'Tambah rekening'}
        onClose={closeSheet}
      >
        <form className="merchant-form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <span className="form-label">Bank</span>
            <Controller
              name="bankName"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Bank"
                  options={BANK_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pilih bank"
                  invalid={Boolean(errors.bankName)}
                  describedBy={errors.bankName ? 'courier-payout-bank-error' : undefined}
                />
              )}
            />
            {errors.bankName && (
              <span id="courier-payout-bank-error" className="error-message">
                {errors.bankName.message}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="courier-payout-number" className="form-label">Nomor rekening</label>
            <input
              id="courier-payout-number"
              inputMode="numeric"
              className={`form-control${errors.accountNumber ? ' error' : ''}`}
              {...register('accountNumber')}
            />
            {errors.accountNumber && (
              <span className="error-message">{errors.accountNumber.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="courier-payout-holder" className="form-label">Nama pemilik</label>
            <input
              id="courier-payout-holder"
              className={`form-control${errors.holderName ? ' error' : ''}`}
              {...register('holderName')}
            />
            {errors.holderName && <span className="error-message">{errors.holderName.message}</span>}
          </div>
          <div className="merchant-actions">
            <button type="submit" className="btn btn-primary">Simpan</button>
            <button type="button" className="merchant-btn-ghost" onClick={closeSheet}>Batal</button>
          </div>
        </form>
      </BottomSheet>

      <ConfirmSheet
        open={deleteTarget !== null}
        title="Hapus rekening?"
        body={`${deleteTarget?.bankName ?? ''} · ${deleteTarget?.accountNumber ?? ''} akan dihapus dari daftar tujuan pencairan.`}
        confirmLabel="Hapus rekening"
        onConfirm={() => {
          if (deleteTarget) {
            dispatch(removePayoutAccount({ id: deleteTarget.id }))
            void deletePayoutAccount(deleteTarget.id).catch(() => {})
          }
          setDeleteTarget(null)
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
