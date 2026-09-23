import { Ban, Store, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { AdminPageHeader } from '../components/admin/AdminPageHeader'
import { AdminBottomNav } from '../components/layout/AdminBottomNav'
import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { moneyFromJod, tenantStatusLabel } from '../data/admin'
import { findCustomer, customers } from '../data/people'
import { blacklistCod, suspendMerchant } from '../store/slices/adminSlice'

export default function AdminMerchants() {
  const dispatch = useAppDispatch()
  const merchants = useAppSelector((s) => s.admin.merchants)
  const riskFlags = useAppSelector((s) => s.admin.customerRiskFlags)
  const csActorId = useAppSelector((s) => s.superAdmin.csActorId)
  const [codCustomer, setCodCustomer] = useState<Record<string, string>>({})

  return (
    <div className="app-shell">
      <main className="admin-page">
        <AdminPageHeader eyebrow="Master tenant" title="Merchant" />

        <section className="admin-card">
          <p className="admin-card-title">Blacklist COD menandai dua sisi</p>
          <p className="admin-card-sub">
            Merchant jadi <strong>blacklisted</strong> dan customer dapat{' '}
            <strong>riskFlag</strong>. Keduanya dibutuhkan supaya checkout COD benar-benar
            terblokir (F15 → f2).
          </p>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Daftar merchant ({merchants.length})</h2>
          {merchants.map((merchant) => (
            <article key={merchant.id} className="admin-card">
              <div className="admin-card-head">
                <div className="admin-row">
                  <Store size={20} strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <p className="admin-card-title">{merchant.name}</p>
                    <p className="admin-card-sub">
                      Deposit {moneyFromJod(merchant.deposit)} · COD bermasalah {merchant.codIssues}×
                    </p>
                  </div>
                </div>
                <span className={`admin-badge admin-badge--${merchant.tenantStatus}`}>
                  {tenantStatusLabel[merchant.tenantStatus]}
                </span>
              </div>

              {merchant.tenantStatus === 'approved' || merchant.tenantStatus === 'suspended' ? (
                <>
                  <label className="admin-field" htmlFor={`cod-${merchant.id}`}>
                    Customer yang terlibat COD bermasalah
                  </label>
                  <select
                    id={`cod-${merchant.id}`}
                    className="form-control"
                    value={codCustomer[merchant.id] ?? ''}
                    onChange={(event) =>
                      setCodCustomer((prev) => ({ ...prev, [merchant.id]: event.target.value }))
                    }
                  >
                    <option value="">Pilih customer…</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} · {customer.phone}
                      </option>
                    ))}
                  </select>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="admin-btn-ghost"
                      onClick={() => {
                        dispatch(suspendMerchant({ id: merchant.id }))
                        toast.error('Merchant di-suspend')
                      }}
                    >
                      Suspend
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const customerId = codCustomer[merchant.id] ?? ''
                        if (!customerId) {
                          toast.error('Pilih customer dulu')
                          return
                        }
                        dispatch(
                          blacklistCod({ id: merchant.id, customerId, byOperatorId: csActorId }),
                        )
                        setCodCustomer((prev) => ({ ...prev, [merchant.id]: '' }))
                        toast.success(
                          `Blacklist COD: ${merchant.name} + ${
                            findCustomer(customerId)?.name ?? customerId
                          } (riskFlag)`,
                        )
                      }}
                    >
                      <Ban size={16} strokeWidth={1.75} aria-hidden="true" />
                      Blacklist COD
                    </button>
                  </div>
                </>
              ) : (
                <p className="admin-note">Merchant tidak aktif — tidak ada COD untuk diblokir.</p>
              )}
            </article>
          ))}
        </section>

        {riskFlags.length > 0 ? (
          <section className="admin-section">
            <h2 className="admin-section-title">Customer riskFlag</h2>
            {riskFlags.map((flag) => (
              <div key={flag.id} className="admin-history">
                <div className="admin-row">
                  <TriangleAlert size={16} strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <p className="admin-card-title">
                      {findCustomer(flag.customerId)?.name ?? flag.customerId}
                    </p>
                    <p className="admin-card-sub">
                      {flag.reason} · {flag.at}
                    </p>
                  </div>
                </div>
                <span className="admin-badge admin-badge--blacklisted">riskFlag</span>
              </div>
            ))}
          </section>
        ) : null}

        <p className="admin-note">
          Suspend dan blacklist di sini hanya mengubah state tampilan (AGENTS.md §1).
        </p>
        <ExchangeRateNote />
      </main>
      <AdminBottomNav />
    </div>
  )
}
