import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { fetchPlatformConfig, runOpsMaintenance, savePlatformConfig } from '../../api/ops'
import { OpsShell } from '../../components/layout/OpsShell'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { hydrateConfig, setConfig } from '../../store/slices/opsSlice'
import type { OpsPlatformConfig } from '../../types'

/**
 * Aturan platform (M10, R-OPS). Knob yang di PRD dimiliki ops: multiplier
 * Quick, ambang notifikasi "kurir hampir sampai", flat fee platform
 * (Pc/Pm), dan tarif biaya transaksi QRIS (Ft). Nilainya dibaca dari
 * `platform_params` dan disimpan lewat RPC `ops_set_platform_params` (tiga
 * knob) + PATCH `almost_arrived_minutes`/`transaction_fee_rate`.
 * Tabel kosong → nilai seed dipertahankan (pola API lain).
 */
export default function OpsSettings() {
  const dispatch = useAppDispatch()
  const config = useAppSelector((s) => s.ops.config)
  const [draft, setDraft] = useState<OpsPlatformConfig>(config)
  const [runningMaintenance, setRunningMaintenance] = useState(false)

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

  /**
   * Pemeliharaan manual: `run_cron_jobs()` BE menjalankan expire order belum
   * bayar, penutupan chat basi, peringatan kuota, dan pembersihan idempotency.
   * Hasilnya ditampilkan supaya ops tahu apa yang benar-benar berubah.
   */
  const runMaintenance = () => {
    setRunningMaintenance(true)
    void runOpsMaintenance()
      .then((result) => {
        if (!result) {
          toast.error('Pemeliharaan tidak bisa dijalankan sekarang')
          return
        }
        toast.success(
          `${result.expired_orders} order kedaluwarsa · ${result.stale_chats} chat ditutup · ${result.quota_alerts} peringatan kuota`,
        )
      })
      .finally(() => setRunningMaintenance(false))
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
    {
      key: 'transactionFeeRate',
      label: 'Ft — biaya transaksi QRIS',
      hint: 'Tarif pecahan, mis. 0.015 = 1,5% dari total bersih (§16.2).',
      step: '0.001',
    },
  ]

  return (
    <OpsShell>
      <section className="sa-card">
        <p className="sa-card-label">Aturan yang dimiliki ops</p>
        <p className="sa-card-sub">Nilai ini dipakai lintas peran.</p>
        {/* Catatan developer (dulu tampil di UI): menyimpan di sini menulis ke tabel
            `platform_params`; kolom yang belum ada di RPC ditulis langsung. Dipindah ke
            komentar 2026-10-31. */}
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

      <section className="sa-card">
        <p className="sa-card-label">Pemeliharaan</p>
        <p className="sa-card-sub">
          Menutup order yang belum dibayar, chat basi, dan mengirim peringatan kuota.
        </p>
        <div className="sa-actions">
          <button
            type="button"
            className="sa-btn"
            onClick={runMaintenance}
            disabled={runningMaintenance}
          >
            {runningMaintenance ? 'Menjalankan...' : 'Jalankan pemeliharaan'}
          </button>
        </div>
      </section>
    </OpsShell>
  )
}
