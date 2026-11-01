import { ShieldCheck } from 'lucide-react'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import {
  DISPUTE_RULES,
  INCIDENT_CATEGORIES,
  compensationForRule,
  formatEffectiveFrom,
  punishmentForRule,
} from '../data/rules'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { toggleRule } from '../store/slices/rulesSlice'

const PARTY_LABEL: Record<string, string> = {
  customer: 'Pelanggan',
  merchant: 'Toko',
  courier: 'Kurir',
}

function categoryLabel(categoryId: string): string {
  return INCIDENT_CATEGORIES.find((category) => category.id === categoryId)?.label ?? categoryId
}

/**
 * Pilihan rule sengketa milik merchant (§18).
 *
 * Dulu blok ini menumpuk di dalam `/merchant/settings`: tujuh chip, lalu kartu
 * kode + mitigasi + kompensasi + punishment untuk tiap rule terpilih. Halaman
 * setelan jadi panjang dan hierarkinya kacau, padahal isinya bukan setelan toko
 * melainkan kebijakan yang mengikat order. Sekarang ia halaman sendiri dan tiap
 * rule satu baris: ketuk barisnya untuk mengikuti atau melepasnya.
 *
 * Isi rule milik tim ops (§18 memisahkan model dari isi); di repo ini katalognya
 * seed demo, jadi layar ini hanya memilih, tidak menyunting.
 */
export default function MerchantRules() {
  const dispatch = useAppDispatch()
  const selection = useAppSelector((state) => state.rules.selection)
  const followed = selection.ruleIds.length

  return (
    <div className="app-shell">
      <MerchantPageHeader eyebrow="Operasional" title="Rule sengketa" back="/settings" />

      <main className="merchant-page">
        <p className="merchant-rules-note">
          <strong className="merchant-rules-count">
            {followed} dari {DISPUTE_RULES.length}
          </strong>{' '}
          rule diikuti. Pilihan ini juga mengikat pelanggan dan kurir pada order tokomu. Isi rule
          ditetapkan tim ops; katalog di demo ini contoh bentuknya.
        </p>

        <h2 className="merchant-rules-head">Rule yang bisa diikuti</h2>
        <ul className="merchant-rules">
          {DISPUTE_RULES.map((rule) => {
            const active = selection.ruleIds.includes(rule.id)
            return (
              <li className="merchant-rule" key={rule.id}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={active}
                  aria-label={`Ikuti ${rule.name}`}
                  className="merchant-rule-toggle list-row"
                  onClick={() => dispatch(toggleRule(rule.id))}
                >
                  <span className="merchant-rule-main">
                    <span className="merchant-rule-name">{rule.name}</span>
                    <span className="merchant-rule-code">{rule.code}</span>
                  </span>
                  <span
                    className={`merchant-toggle-switch${active ? ' is-on' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}
        </ul>

        {/* Uraian rule yang diikuti dipisah ke bawah, bukan menempel di barisnya.
            Alasannya teknis sekaligus visual: baris pilihan harus sama tinggi
            (MD-11, kolom-1 baris daftar satu nilai), sedangkan uraian hanya ada
            pada rule yang diikuti. */}
        <section className="merchant-rules-applied" aria-labelledby="rules-applied-title">
          <h2 className="merchant-rules-head" id="rules-applied-title">
            Berlaku pada order tokomu
          </h2>
          {followed === 0 ? (
            <p className="merchant-rules-empty">
              Belum ada rule yang berlaku. Insiden pada order tokomu belum punya rule rujukan.
            </p>
          ) : (
            <ul className="merchant-rule-details">
              {DISPUTE_RULES.filter((rule) => selection.ruleIds.includes(rule.id)).map((rule) => {
                const compensation = compensationForRule(rule.id)
                const punishment = punishmentForRule(rule.id)
                return (
                  <li className="merchant-rule-detail" key={rule.id}>
                    <p className="merchant-rule-detail-title">{rule.name}</p>
                    <p className="merchant-rule-code">
                      {rule.code} · {categoryLabel(rule.categoryId)} ·{' '}
                      {(PARTY_LABEL[rule.responsibleParty] ?? rule.responsibleParty).toLowerCase()}
                    </p>
                    {/* Label dan nilainya dipisah kolom, bukan kalimat
                        "Mitigasi: ..." berturut-turut. Tiga baris berlabel
                        colon itu terbaca sebagai catatan kaki, padahal isinya
                        data yang dibandingkan antar rule. */}
                    <dl className="merchant-rule-facts">
                      <dt>Mitigasi</dt>
                      <dd>{rule.mitigation}</dd>
                      <dt>Kompensasi</dt>
                      <dd>
                        {compensation
                          ? `${compensation.form} (${compensation.formula}) ke ${(
                              PARTY_LABEL[compensation.recipient] ?? compensation.recipient
                            ).toLowerCase()}`
                          : 'Belum diatur ops'}
                      </dd>
                      <dt>Punishment</dt>
                      <dd>
                        {punishment
                          ? `${punishment.form} (${punishment.level}) ke ${(
                              PARTY_LABEL[punishment.subject] ?? punishment.subject
                            ).toLowerCase()}`
                          : 'Tidak ada'}
                      </dd>
                    </dl>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <p className="merchant-rules-foot">
          <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
          Rule yang diikuti berlaku sejak {formatEffectiveFrom(selection.effectiveFrom)}. Rule dicatat
          ulang pada tiap order, jadi mengubah pilihan tidak mengubah order yang sudah jalan.
        </p>
      </main>

      <MerchantBottomNav />
    </div>
  )
}
