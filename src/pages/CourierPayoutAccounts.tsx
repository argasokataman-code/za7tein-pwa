import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Landmark, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { BANK_OPTIONS } from '../data/payout'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { payoutAccountSchema, type PayoutAccountFormData } from '../lib/schemas'
import {
  addPayoutAccount,
  removePayoutAccount,
  setPrimaryPayoutAccount,
  updatePayoutAccount,
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

  const {
    register,
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
      dispatch(updatePayoutAccount({ id: editing.id, ...data }))
      toast.success('Rekening diperbarui')
    } else {
      dispatch(addPayoutAccount(data))
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
          action={(
            <button type="button" className="courier-add-btn" onClick={openAdd}>
              <Plus size={16} strokeWidth={1.75} /> Tambah
            </button>
          )}
        />

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
                        dispatch(setPrimaryPayoutAccount({ id: account.id }))
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

        <Link className="courier-back-link" to="/wallet">
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          Kembali ke dompet
        </Link>
      </main>
      <CourierBottomNav />

      <BottomSheet
        open={sheetMode !== null}
        title={sheetMode === 'edit' ? 'Ubah rekening' : 'Tambah rekening'}
        onClose={closeSheet}
      >
        <form className="merchant-form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="courier-payout-bank" className="form-label">Bank</label>
            <select
              id="courier-payout-bank"
              className={`form-control${errors.bankName ? ' error' : ''}`}
              {...register('bankName')}
            >
              <option value="">Pilih bank</option>
              {BANK_OPTIONS.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
            {errors.bankName && <span className="error-message">{errors.bankName.message}</span>}
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
          if (deleteTarget) dispatch(removePayoutAccount({ id: deleteTarget.id }))
          setDeleteTarget(null)
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
