import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import {
  createPlatformProgram,
  fetchPlatformPrograms,
  type MarketingBundle,
} from '../../api/programs'
import { apiEnabled } from '../../api/supabase'
import { OpsShell } from '../../components/layout/OpsShell'
import { jod } from '../../data/currency'
import { mockMarketingPrograms, mockProgramRewards, mockProgramRules } from '../../data/marketing'
import type { DiscountMode, MarketingProgram } from '../../types'

const FALLBACK: MarketingBundle = {
  programs: mockMarketingPrograms.filter((p) => p.owner === 'platform'),
  rewards: mockProgramRewards,
  rules: mockProgramRules,
}

const EMPTY = {
  name: '',
  isStackable: false,
  dateFrom: '',
  dateTo: '',
  mode: 'per_order' as DiscountMode,
  value: 0,
  minimumAmountJod: 0,
}

/**
 * Program aplikator (M10, §15). Ops membuat/mengelola program tingkat platform
 * (`owner = applicator`), yang berlaku lintas merchant. Dibaca **live** dari
 * `marketing_programs` (via `programs.ts`), mock sebagai fallback bila kosong.
 */
export default function OpsPrograms() {
  const [bundle, setBundle] = useState<MarketingBundle>(FALLBACK)
  const [draft, setDraft] = useState(EMPTY)

  useEffect(() => {
    if (!apiEnabled) return
    fetchPlatformPrograms()
      .then((data) => {
        if (data.programs.length) setBundle(data)
      })
      .catch(() => {})
  }, [])

  const rewardFor = (program: MarketingProgram) =>
    bundle.rewards.find((reward) => reward.programId === program.id)

  const submit = () => {
    if (!draft.name.trim() || draft.value <= 0) {
      toast.error('Nama dan nilai diskon wajib diisi')
      return
    }
    void createPlatformProgram({
      ...draft,
      name: draft.name.trim(),
      dateTo: draft.dateTo || null,
    })
      .then((created) => {
        if (created) setBundle((prev) => ({ ...prev, programs: [created, ...prev.programs] }))
      })
      .catch(() => {})
    toast.success('Program aplikator dibuat')
    setDraft(EMPTY)
  }

  return (
    <OpsShell>
      <section className="sa-card">
        <p className="sa-card-label">Program aplikator</p>
        <p className="sa-card-sub">
          Diskon yang ditanggung platform, berlaku lintas merchant. Berbeda dengan program merchant
          yang dibiayai toko. Bila BE kosong, daftar menampilkan seed mock.
        </p>
      </section>

      <section className="sa-card">
        <p className="sa-card-label">Buat program</p>
        <div className="sa-form-grid">
          <label className="sa-field">
            <span>Nama</span>
            <input
              value={draft.name}
              placeholder="mis. Diskon Aplikator 0,3 JOD"
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="sa-field">
            <span>Bentuk diskon</span>
            <select
              value={draft.mode}
              onChange={(e) => setDraft({ ...draft, mode: e.target.value as DiscountMode })}
            >
              <option value="per_order">Nominal tetap (JOD)</option>
              <option value="percent">Persen (%)</option>
            </select>
          </label>
          <label className="sa-field">
            <span>{draft.mode === 'percent' ? 'Persen' : 'Nominal (JOD)'}</span>
            <input
              type="number"
              step="0.05"
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })}
            />
          </label>
          <label className="sa-field">
            <span>Min. belanja (JOD)</span>
            <input
              type="number"
              step="0.05"
              value={draft.minimumAmountJod}
              onChange={(e) => setDraft({ ...draft, minimumAmountJod: Number(e.target.value) })}
            />
          </label>
          <label className="sa-field">
            <span>Mulai</span>
            <input
              type="date"
              value={draft.dateFrom}
              onChange={(e) => setDraft({ ...draft, dateFrom: e.target.value })}
            />
          </label>
          <label className="sa-field">
            <span>Berakhir (opsional)</span>
            <input
              type="date"
              value={draft.dateTo}
              onChange={(e) => setDraft({ ...draft, dateTo: e.target.value })}
            />
          </label>
        </div>
        <label className="sa-field sa-field--inline">
          <input
            type="checkbox"
            checked={draft.isStackable}
            onChange={(e) => setDraft({ ...draft, isStackable: e.target.checked })}
          />
          <span>Bisa digabung dengan program merchant</span>
        </label>
        <div className="sa-actions">
          <button type="button" className="sa-btn sa-btn--primary" onClick={submit}>
            <Plus size={15} strokeWidth={1.75} aria-hidden="true" /> Buat program
          </button>
        </div>
      </section>

      <section className="sa-card">
        <p className="sa-card-label">Program berlaku</p>
        {bundle.programs.length === 0 ? (
          <p className="sa-empty">Belum ada program aplikator.</p>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Diskon</th>
                  <th>Periode</th>
                  <th>Stackable</th>
                </tr>
              </thead>
              <tbody>
                {bundle.programs.map((program) => {
                  const reward = rewardFor(program)
                  return (
                    <tr key={program.id}>
                      <td>
                        <strong>{program.name}</strong>
                      </td>
                      <td>
                        {reward
                          ? reward.discountMode === 'percent'
                            ? `${reward.discountPercent ?? 0}%`
                            : jod(reward.discountPercent ?? 0)
                          : '—'}
                      </td>
                      <td>
                        {program.dateFrom}
                        {program.dateTo ? ` → ${program.dateTo}` : ' →'}
                      </td>
                      <td>{program.isStackable ? 'Ya' : 'Tidak'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </OpsShell>
  )
}
