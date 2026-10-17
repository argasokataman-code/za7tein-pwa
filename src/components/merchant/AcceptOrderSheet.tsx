import { useState } from 'react'
import { Check, Circle } from 'lucide-react'

import { countdownLabel, joinableBatches } from '../../data/batch'
import { DELIVERY_TYPE_LABEL, orderDeliveryType } from '../../data/merchantOrders'
import { BottomSheet } from '../ui/BottomSheet'
import type { Batch, MerchantOrder } from '../../types'

/** Estimasi prepare/masak sebagai pilihan tetap (pola segmented yang sama dengan konsol). */
const ESTIMATE_OPTIONS = [15, 25, 35] as const
const DEFAULT_ESTIMATE = 25

interface AcceptChoice {
  /** `null` = batch baru (hanya untuk order Regular). */
  batchId: string | null
  estimateMinutes: number
}

interface AcceptOrderSheetProps {
  order: MerchantOrder
  batches: Batch[]
  onConfirm: (choice: AcceptChoice) => void
  onClose: () => void
}

/**
 * Gerbang accept merchant (PRD §7.2/§7.3, MER-11/MER-12) — satu komponen untuk
 * kedua cabang supaya perbedaannya terbaca, bukan tersebar:
 *
 * - **Regular** masuk **batch** kurir inhouse; merchant wajib memilih batch baru
 *   atau batch berjalan yang hitung mundurnya masih berjalan (BR-B01/B02).
 * - **Quick** diantar kurir partner aplikator; tidak ada batch, merchant hanya
 *   mengisi estimasi waktu prepare (MER-12).
 */
export function AcceptOrderSheet({
  order,
  batches,
  onConfirm,
  onClose,
}: AcceptOrderSheetProps) {
  const isQuick = orderDeliveryType(order) === 'quick'
  const options = joinableBatches(batches)
  const [batchId, setBatchId] = useState<string | null>(options.length ? options[0].id : null)
  const [estimate, setEstimate] = useState<number>(DEFAULT_ESTIMATE)

  const confirmLabel = isQuick ? 'Terima Quick' : 'Terima & masukkan batch'

  return (
    <BottomSheet open title={`Terima order ${order.code}`} onClose={onClose}>
      <p className="merchant-card-sub">
        {DELIVERY_TYPE_LABEL[isQuick ? 'quick' : 'regular']} —{' '}
        {isQuick
          ? 'diantar kurir partner aplikator, satu order per kurir.'
          : 'diantar satu kurir inhouse bersama order lain di batch yang sama.'}
      </p>

      {!isQuick ? (
        <div className="merchant-option-list" role="radiogroup" aria-label="Pilih batch">
          <button
            type="button"
            role="radio"
            aria-checked={batchId === null}
            className={`merchant-option${batchId === null ? ' is-selected' : ''}`}
            onClick={() => setBatchId(null)}
          >
            <span className="merchant-option-body">
              <span className="merchant-option-title">Batch baru</span>
              <span className="merchant-option-sub">
                Hitung mundur mulai berjalan; order berikutnya bisa menyusul.
              </span>
            </span>
            <span className="merchant-option-check" aria-hidden="true">
              {batchId === null ? (
                <Check size={18} strokeWidth={1.75} />
              ) : (
                <Circle size={18} strokeWidth={1.75} />
              )}
            </span>
          </button>

          {options.map((batch, index) => {
            const selected = batchId === batch.id
            return (
              <button
                key={batch.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`merchant-option${selected ? ' is-selected' : ''}`}
                onClick={() => setBatchId(batch.id)}
              >
                <span className="merchant-option-body">
                  <span className="merchant-option-title">Batch #{index + 1}</span>
                  <span className="merchant-option-sub">
                    {batch.orderIds.length} order · sisa {countdownLabel(batch.countdownSeconds)}
                  </span>
                </span>
                <span className="merchant-option-check" aria-hidden="true">
                  {selected ? (
                    <Check size={18} strokeWidth={1.75} />
                  ) : (
                    <Circle size={18} strokeWidth={1.75} />
                  )}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}

      {isQuick || batchId === null ? (
        <div className="merchant-cook">
          <div className="merchant-cook-head">
            <span>{isQuick ? 'Estimasi prepare' : 'Estimasi masak batch'}</span>
            <strong>{estimate} menit</strong>
          </div>
          <div
            className="merchant-cook-segments"
            role="group"
            aria-label={`Estimasi ${order.code}`}
          >
            {ESTIMATE_OPTIONS.map((minutes) => {
              const active = estimate === minutes
              return (
                <button
                  key={minutes}
                  type="button"
                  className={active ? 'is-active' : ''}
                  aria-pressed={active}
                  onClick={() => setEstimate(minutes)}
                >
                  {minutes}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="merchant-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onConfirm({ batchId: isQuick ? null : batchId, estimateMinutes: estimate })}
        >
          {confirmLabel}
        </button>
        <button type="button" className="merchant-btn-ghost" onClick={onClose}>
          Nanti saja
        </button>
      </div>
    </BottomSheet>
  )
}

export type { AcceptChoice }
