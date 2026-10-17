import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { DEMO_MERCHANT_ID } from '../../api/reference'
import { createMerchantProgram } from '../../api/programs'
import { apiEnabled } from '../../api/supabase'
import { PROGRAM_TYPE_LABEL } from '../../data/marketing'
import { BottomSheet } from '../ui/BottomSheet'
import { useAppDispatch } from '../../hooks/useAppStore'
import { addProgram, addReward, addRule } from '../../store/slices/marketingSlice'
import type { DiscountMode, MarketingProgramType } from '../../types'

/**
 * Form buat program marketing (§15, mock). Satu program = satu rule + satu
 * reward; hidup di slice `marketing` sampai BE punya tabel program. Dipisah dari
 * `MerchantPromos` supaya halaman itu tetap di bawah batas 700 baris.
 */

/** Jenis program marketing yang bisa dibuat merchant (§15.1). */
const PROGRAM_TYPE_OPTIONS: MarketingProgramType[] = [
  'promotion',
  'coupons',
  'buy_x_get_y',
  'next_order_coupons',
  'loyalty',
]

const DISCOUNT_MODES: DiscountMode[] = ['percent', 'per_order']

function todayPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

interface ProgramFormSheetProps {
  open: boolean
  onClose: () => void
  /** Dipanggil setelah program tersimpan live, supaya daftar induk bisa memuat ulang. */
  onCreated?: () => void
}

export function ProgramFormSheet({ open, onClose, onCreated }: ProgramFormSheetProps) {
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const [type, setType] = useState<MarketingProgramType>('promotion')
  const [stackable, setStackable] = useState(true)
  const [from, setFrom] = useState(todayPlus(0))
  const [to, setTo] = useState(todayPlus(30))
  const [mode, setMode] = useState<DiscountMode>('percent')
  const [value, setValue] = useState('10')
  const [minAmount, setMinAmount] = useState('0')

  const reset = () => {
    setName('')
    setType('promotion')
    setStackable(true)
    setFrom(todayPlus(0))
    setTo(todayPlus(30))
    setMode('percent')
    setValue('10')
    setMinAmount('0')
  }

  const close = () => {
    onClose()
    reset()
  }

  const submit = async () => {
    const cleanName = name.trim()
    const rewardValue = Number(value)
    if (!cleanName) {
      toast.error('Isi nama program dulu')
      return
    }
    if (!Number.isFinite(rewardValue) || rewardValue <= 0) {
      toast.error('Nilai hadiah harus lebih dari 0')
      return
    }
    // Live dulu; kalau BE menolak, tetap simpan lokal supaya demo jalan.
    if (apiEnabled) {
      try {
        const saved = await createMerchantProgram({
          merchantId: String(DEMO_MERCHANT_ID),
          name: cleanName,
          isStackable: stackable,
          dateFrom: from,
          dateTo: to || null,
          mode,
          value: rewardValue,
          minimumAmountJod: Number(minAmount) || 0,
        })
        if (saved) {
          toast.success(`Program ${cleanName} dibuat`)
          onCreated?.()
          close()
          return
        }
      } catch {
        // jatuh ke jalur lokal di bawah
      }
    }
    const programId = `prog-${Date.now()}`
    dispatch(
      addProgram({
        id: programId,
        name: cleanName,
        owner: 'merchant',
        merchantId: String(DEMO_MERCHANT_ID),
        type,
        trigger: 'auto',
        appliesOn: 'current',
        dateFrom: from,
        dateTo: to || null,
        limitUsage: null,
        maxUsage: null,
        isStackable: stackable,
      }),
    )
    dispatch(
      addRule({
        id: `rule-${programId}`,
        programId,
        minimumQty: 0,
        minimumAmountJod: Number(minAmount) || 0,
        menuIds: [],
        categoryIds: [],
        tagIds: [],
        rewardPointMode: 'per_order',
        rewardPointAmount: 0,
      }),
    )
    dispatch(
      addReward({
        id: `reward-${programId}`,
        programId,
        rewardType: 'discount',
        discountMode: mode,
        discountPercent: rewardValue,
        discountApplicability: 'order',
      }),
    )
    toast.success(`Program ${cleanName} dibuat`)
    close()
  }

  return (
    <BottomSheet open={open} title="Buat program" onClose={close}>
      <form
        className="merchant-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <div className="form-group">
          <label htmlFor="program-name" className="form-label">
            Nama program
          </label>
          <input
            id="program-name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. Diskon Jumat"
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <span className="form-label">Jenis</span>
          <div className="merchant-chip-row" role="radiogroup" aria-label="Jenis program">
            {PROGRAM_TYPE_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={type === t}
                className={`merchant-chip${type === t ? ' is-active' : ''}`}
                onClick={() => setType(t)}
              >
                {PROGRAM_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <span className="form-label">Bentuk hadiah</span>
          <div className="merchant-chip-row" role="radiogroup" aria-label="Bentuk hadiah">
            {DISCOUNT_MODES.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                className={`merchant-chip${mode === m ? ' is-active' : ''}`}
                onClick={() => setMode(m)}
              >
                {m === 'percent' ? 'Persen' : 'Potongan tetap'}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="program-value" className="form-label">
            {mode === 'percent' ? 'Persen diskon' : 'Nominal (JOD)'}
          </label>
          <input
            id="program-value"
            type="number"
            inputMode="decimal"
            min="0"
            step={mode === 'percent' ? '1' : '0.01'}
            className="form-control"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="program-min" className="form-label">
            Minimum belanja (JOD)
          </label>
          <input
            id="program-min"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            className="form-control"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="program-from" className="form-label">
            Mulai
          </label>
          <input
            id="program-from"
            type="date"
            className="form-control"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="program-to" className="form-label">
            Berakhir (opsional)
          </label>
          <input
            id="program-to"
            type="date"
            className="form-control"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <label className="merchant-row">
          <span>Boleh digabung promo lain</span>
          <span className="toggle-wrap">
            <input
              className="toggle-input"
              type="checkbox"
              checked={stackable}
              aria-label="Boleh digabung promo lain"
              onChange={(e) => setStackable(e.target.checked)}
            />
            <span className="toggle-slider" />
          </span>
        </label>

        <div className="merchant-actions">
          <button type="submit" className="btn btn-primary">
            Simpan program
          </button>
          <button type="button" className="merchant-btn-ghost" onClick={close}>
            Batal
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
