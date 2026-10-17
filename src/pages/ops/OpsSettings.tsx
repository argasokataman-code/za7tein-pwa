import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { fetchPlatformConfig, savePlatformConfig } from '../../api/ops'
import { OpsShell } from '../../components/layout/OpsShell'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { hydrateConfig, setConfig } from '../../store/slices/opsSlice'
import type { OpsPlatformConfig } from '../../types'

/**
 * Aturan platform (M10, R-OPS). Tiga knob yang di PRD dimiliki ops: multiplier
 * Quick, ambang notifikasi "kurir hampir sampai", dan flat fee platform
 * (Pc/Pm). Nilainya dibaca dari `platform_params` dan disimpan lewat RPC
 * `ops_set_platform_params` (tiga knob) + PATCH `almost_arrived_minutes`.
 * Tabel kosong → nilai seed dipertahankan (pola API lain).
 */
export default function OpsSettings() {
  const dispatch = useAppDispatch()
  const config = useAppSelector((s) => s.ops.config)
  const [draft, setDraft] = useState<OpsPlatformConfig>(config)

  useEffect(() => {
    setDraft(config)
  }, [config])

  // Hydrate dari BE: `platform_params` (satu baris). Kosong → seed dipertahankan.
  useEffect(() => {
    void fetchPlatformConfig()
      .then((partial) => dispatch(hydrateConfig(partial)))
      .catch(() => {})
  }, [dispatch])

  const set = (key: keyof OpsPlatformConfig, raw: string) => {
    const value = Number(raw)
    setDraft({ ...draft, [key]: Number.isFinite(value) ? value : 0 })
  }

  const save = () => {
    dispatch(setConfig(draft))
    // Tulis juga ke BE (best-effort); RPC + RLS ops memverifikasi peran.
    void savePlatformConfig(draft).catch(() => {})
    toast.success('Aturan platform disimpan')
  }

  const fields: { key: keyof OpsPlatformConfig; label: string; hint: string; step: string }[] = [
    {
      key: 'quickMultiplier',
      label: 'Multiplier Quick',
      hint: 'Tarif delivery Quick = multiplier × fee merchant (§13).',
      step: '0.05',
    },
    {
      key: 'almostArrivedMinutes',
      label: 'Ambang "hampir sampai"',
      hint: 'Menit sebelum tiba saat notifikasi kurir dikirim (R-TRACK).',
      step: '1',
    },
    {
      key: 'platformFeeCustomerJod',
      label: 'Pc — platform fee customer',
      hint: 'Flat per order, termasuk COD (§16.3).',
      step: '0.01',
    },
    {
      key: 'platformFeeMerchantJod',
      label: 'Pm — platform fee merchant',
      hint: 'Ditagih hanya saat online tanpa kuota (§16.3).',
      step: '0.01',
    },
  ]

  return (
    <OpsShell>
      <section className="sa-card">
        <p className="sa-card-label">Aturan yang dimiliki ops</p>
        <p className="sa-card-sub">
          Nilai ini dipakai lintas peran. Menyimpan di sini menulis ke BE
          (`platform_params`); kolom yang belum ada di RPC ditulis langsung.
        </p>
      </section>

      <section className="sa-card">
        <div className="sa-form-grid">
          {fields.map((field) => (
            <label key={field.key} className="sa-field">
              <span>{field.label}</span>
              <input
                type="number"
                step={field.step}
                value={draft[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
              />
              <span className="sa-note">{field.hint}</span>
            </label>
          ))}
        </div>
        <div className="sa-actions">
          <button type="button" className="sa-btn sa-btn--primary" onClick={save}>
            Simpan aturan
          </button>
        </div>
      </section>
    </OpsShell>
  )
}
