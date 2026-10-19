import toast from 'react-hot-toast'

import { OpsShell } from '../../components/layout/OpsShell'
import { INCIDENT_CATEGORIES } from '../../data/rules'
import { compensationsForRule } from '../../data/ops'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { toggleRuleActive } from '../../store/slices/opsSlice'

/**
 * Rule sengketa (M10, §18). PRD memisahkan model dari isi: ops **membuat dan
 * mengelola** rule; merchant memilih (multi-select) rule yang diikuti. Layar ini
 * sisi ops-nya — katalog mitigasi/kompensasi/punishment dengan sakelar aktif.
 *
 * Katalognya dibaca dari `data/rules.ts` (satu sumber dengan mesin
 * `ruleForOrder()`); mengubah di sini mengedit salinan slice ops, belum
 * menyentuh dokumen/layanan (panel ops mock).
 */
export default function OpsRules() {
  const dispatch = useAppDispatch()
  const rules = useAppSelector((s) => s.ops.rules)
  const rulePunishments = useAppSelector((s) => s.ops.rulePunishments)

  const categoryLabel = (categoryId: string) =>
    INCIDENT_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId

  return (
    <OpsShell>
      <section className="sa-card">
        <p className="sa-card-label">Katalog rule dispute</p>
        <p className="sa-card-sub">
          Rule aktif yang dipilih merchant (dan diikuti customer serta kurir pada order merchant
          itu) dievaluasi mesin `ruleForOrder()`. Menonaktifkan rule menyembunyikannya dari pilihan
          merchant.
        </p>
      </section>

      <section className="sa-card">
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Rule</th>
                <th>Kategori</th>
                <th>Penanggung jawab</th>
                <th>Kompensasi / Punishment</th>
                <th>Status</th>
                <th aria-label="Aksi" />
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const comp = compensationsForRule(rule.id)
                const pun = rulePunishments.filter((p) => p.ruleId === rule.id)
                return (
                  <tr key={rule.id}>
                    <td>
                      <code className="sa-code">{rule.code}</code>
                    </td>
                    <td>
                      <strong>{rule.name}</strong>
                      <span className="sa-table-sub">{rule.mitigation}</span>
                    </td>
                    <td>{categoryLabel(rule.categoryId)}</td>
                    <td>{rule.responsibleParty}</td>
                    <td>
                      {comp.length} kompensasi · {pun.length} punishment
                    </td>
                    <td>
                      <span className={`sa-chip${rule.active ? ' is-ok' : ' is-off'}`}>
                        {rule.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sa-btn sa-btn--small"
                        onClick={() => {
                          dispatch(toggleRuleActive({ id: rule.id }))
                          toast.success(
                            rule.active ? `${rule.code} dinonaktifkan` : `${rule.code} diaktifkan`,
                          )
                        }}
                      >
                        {rule.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sa-card">
        <p className="sa-card-label">Kategori insiden</p>
        <p className="sa-card-sub">
          {INCIDENT_CATEGORIES.map((category) => category.label).join(' · ')}
        </p>
      </section>
    </OpsShell>
  )
}
