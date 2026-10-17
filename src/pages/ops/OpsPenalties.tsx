import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { OpsShell } from '../../components/layout/OpsShell'
import { OPS_PENALTY_STATUS_LABEL, OPS_SUBJECT_LABEL } from '../../data/ops'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { issuePenalty, revokePenalty } from '../../store/slices/opsSlice'
import type { OpsPenalty } from '../../types'

const EMPTY = {
  subject: 'courier' as OpsPenalty['subject'],
  subjectName: '',
  form: 'Surat peringatan',
  level: 'SP-1',
  reason: '',
}

/**
 * Surat peringatan (M10, §18). SP adalah salah satu bentuk punishment. Ops
 * menerbitkannya ke satu pihak dengan alasan yang tercatat; mencabut SP tidak
 * menghapus barisnya (riwayat tetap, seperti ledger append-only).
 */
export default function OpsPenalties() {
  const dispatch = useAppDispatch()
  const penalties = useAppSelector((s) => s.ops.penalties)
  const [draft, setDraft] = useState(EMPTY)

  const submit = () => {
    if (!draft.subjectName.trim() || !draft.reason.trim()) {
      toast.error('Nama pihak dan alasan wajib diisi')
      return
    }
    dispatch(issuePenalty({ ...draft, subjectName: draft.subjectName.trim() }))
    toast.success(`SP diterbitkan ke ${draft.subjectName}`)
    setDraft(EMPTY)
  }

  return (
    <OpsShell>
      <section className="sa-card">
        <p className="sa-card-label">Terbitkan SP</p>
        <p className="sa-card-sub">
          SP tercatat sebagai punishment pada pihak yang bersangkutan. Bentuk & tingkatnya bebas
          seperti katalog rule; ubah bila bentuknya berbeda.
        </p>
        <div className="sa-form-grid">
          <label className="sa-field">
            <span>Pihak</span>
            <select
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value as OpsPenalty['subject'] })}
            >
              {Object.entries(OPS_SUBJECT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="sa-field">
            <span>Nama</span>
            <input
              value={draft.subjectName}
              placeholder="mis. Budi Santoso"
              onChange={(e) => setDraft({ ...draft, subjectName: e.target.value })}
            />
          </label>
          <label className="sa-field">
            <span>Bentuk</span>
            <input value={draft.form} onChange={(e) => setDraft({ ...draft, form: e.target.value })} />
          </label>
          <label className="sa-field">
            <span>Tingkat</span>
            <input value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })} />
          </label>
          <label className="sa-field">
            <span>Alasan</span>
            <input
              value={draft.reason}
              placeholder="mis. Tolak order berulang"
              onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
            />
          </label>
        </div>
        <div className="sa-actions">
          <button type="button" className="sa-btn sa-btn--primary" onClick={submit}>
            <AlertTriangle size={15} strokeWidth={1.75} aria-hidden="true" /> Terbitkan SP
          </button>
        </div>
      </section>

      <section className="sa-card">
        <p className="sa-card-label">Riwayat SP</p>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Pihak</th>
                <th>Bentuk</th>
                <th>Tingkat</th>
                <th>Alasan</th>
                <th>Status</th>
                <th aria-label="Aksi" />
              </tr>
            </thead>
            <tbody>
              {penalties.map((penalty) => (
                <tr key={penalty.id}>
                  <td>
                    <strong>{penalty.subjectName}</strong>
                    <span className="sa-table-sub">
                      {OPS_SUBJECT_LABEL[penalty.subject]} · {penalty.issuedAt}
                    </span>
                  </td>
                  <td>{penalty.form}</td>
                  <td>{penalty.level}</td>
                  <td>{penalty.reason}</td>
                  <td>
                    <span className={`sa-chip${penalty.status === 'issued' ? ' is-off' : ' is-ok'}`}>
                      {OPS_PENALTY_STATUS_LABEL[penalty.status]}
                    </span>
                  </td>
                  <td>
                    {penalty.status === 'issued' ? (
                      <button
                        type="button"
                        className="sa-btn sa-btn--small"
                        onClick={() => {
                          dispatch(revokePenalty({ id: penalty.id }))
                          toast.success('SP dicabut')
                        }}
                      >
                        Cabut
                      </button>
                    ) : (
                      <span className="sa-table-sub">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </OpsShell>
  )
}
