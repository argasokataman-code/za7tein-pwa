import { Ban, Check, ChevronRight, Store, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { AdminKpi } from '../../components/admin/AdminKpi'
import { OpsShell } from '../../components/layout/OpsShell'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { ConfirmSheet } from '../../components/ui/ConfirmSheet'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { useMoney } from '../../hooks/useMoney'
import { tenantStatusLabel } from '../../data/admin'
import { customers } from '../../data/people'
import { flagCustomerRisk } from '../../api/admin'
import { blacklistCod, suspendMerchant } from '../../store/slices/adminSlice'

export default function OpsMerchants() {
  const { moneyFromJod } = useMoney()
  const dispatch = useAppDispatch()
  const merchants = useAppSelector((s) => s.admin.merchants)
  const riskFlags = useAppSelector((s) => s.admin.customerRiskFlags)
  const beCustomers = useAppSelector((s) => s.admin.beCustomers)
  const csActorId = useAppSelector((s) => s.superAdmin.csActorId)
  const approved = merchants.filter((m) => m.tenantStatus === 'approved').length
  const suspended = merchants.filter((m) => m.tenantStatus === 'suspended').length
  const blacklisted = merchants.filter((m) => m.tenantStatus === 'blacklisted').length
  const [codCustomer, setCodCustomer] = useState<Record<string, string>>({})
  // Sheet pemilih customer: id merchant yang membukanya, null = tertutup.
  // Baris picker + bottom sheet, bukan `<select>` peramban (audit 015 #5).
  const [customerSheet, setCustomerSheet] = useState<string | null>(null)
  // Blacklist menandai dua sisi (merchant + customer), jadi konfirmasi dulu
  // lewat sheet (audit 006 #4).
  const [confirmBlacklist, setConfirmBlacklist] = useState<string | null>(null)
  // Suspend membekukan merchant dari berjualan, jadi konfirmasi dulu (audit 017 F-05).
  const [pendingSuspend, setPendingSuspend] = useState<string | null>(null)

  const sheetMerchant = customerSheet
    ? merchants.find((m) => m.id === customerSheet)
    : undefined

  // Direktori picker: customer BE bila termuat, fallback registri mock. Bentuk sama.
  const directory = beCustomers.length
    ? beCustomers.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))
    : customers.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))
  const nameOf = (id: string) => directory.find((c) => c.id === id)?.name

  return (
    <OpsShell>
      <div className="admin-page">
        <div className="admin-kpi">
          <AdminKpi label="Total merchant" value={merchants.length} sub="Terdaftar" />
          <AdminKpi label="Aktif" value={approved} sub="Boleh berjualan" />
          <AdminKpi label="Suspended" value={suspended} sub="Dibekukan" tone={suspended > 0 ? 'warning' : undefined} />
          <AdminKpi
            label="Blacklist COD"
            value={blacklisted}
            sub={riskFlags.length > 0 ? `${riskFlags.length} risk flag` : 'Tanpa risk flag'}
            tone={blacklisted > 0 ? 'danger' : undefined}
          />
        </div>

        <section className="admin-card admin-card--wide">
          <p className="admin-card-title">Blacklist COD menandai dua sisi</p>
          <p className="admin-card-sub">
            Merchant jadi <strong>blacklisted</strong> dan customer dapat{' '}
            <strong>riskFlag</strong>. Keduanya dibutuhkan supaya checkout COD benar-benar
            terblokir.
          </p>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Daftar merchant ({merchants.length})</h2>
          {merchants.length === 0 ? (
            <p className="admin-empty">Belum ada merchant terdaftar.</p>
          ) : (
          merchants.map((merchant) => {
            const selectedId = codCustomer[merchant.id] ?? ''
            return (
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
                    <button
                      id={`cod-${merchant.id}`}
                      type="button"
                      className={selectedId ? 'dispute-picker' : 'dispute-picker is-empty'}
                      onClick={() => setCustomerSheet(merchant.id)}
                    >
                      {nameOf(selectedId) ?? 'Pilih customer'}
                      <ChevronRight
                        size={18}
                        strokeWidth={1.75}
                        className="dispute-picker-chevron"
                        aria-hidden="true"
                      />
                    </button>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-btn-ghost"
                        onClick={() => setPendingSuspend(merchant.id)}
                      >
                        Suspend
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          if (!selectedId) {
                            toast.error('Pilih customer dulu')
                            return
                          }
                          setConfirmBlacklist(merchant.id)
                        }}
                      >
                        <Ban size={16} strokeWidth={1.75} aria-hidden="true" />
                        Blacklist COD
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="admin-note">Merchant tidak aktif: tidak ada COD untuk diblokir.</p>
                )}
              </article>
            )
          }))}
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
                      {nameOf(flag.customerId) ?? flag.customerId}
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

        <div className="admin-footnote">
          <p className="admin-note">
            Suspend dan blacklist di sini hanya mengubah tampilan, bukan data sungguhan.
          </p>
        </div>

        {confirmBlacklist ? (
          <ConfirmSheet
            open
            title="Blacklist COD?"
            body={`Merchant ${
              merchants.find((m) => m.id === confirmBlacklist)?.name ?? ''
            } masuk blacklist dan customer terkait dapat riskFlag. Keduanya dipakai supaya checkout COD benar-benar terblokir.`}
            confirmLabel="Blacklist COD"
            confirmClass="admin-btn-ghost"
            onConfirm={() => {
              const customerId = codCustomer[confirmBlacklist] ?? ''
              const merchant = merchants.find((m) => m.id === confirmBlacklist)
              const reason = 'COD bermasalah bersama merchant ini'
              dispatch(blacklistCod({ id: confirmBlacklist, customerId, byOperatorId: csActorId }))
              // Tulis nyata ke BE (best-effort): riwayat customer_risk_flags + cermin risk_flag.
              flagCustomerRisk({ customerRef: customerId, reason }).catch(() => {})
              setCodCustomer((prev) => ({ ...prev, [confirmBlacklist]: '' }))
              setConfirmBlacklist(null)
              toast.success(
                `Blacklist COD: ${merchant?.name ?? ''} + ${
                  nameOf(customerId) ?? customerId
                } (riskFlag)`,
              )
            }}
            onClose={() => setConfirmBlacklist(null)}
          />
        ) : null}

        {pendingSuspend ? (
          <ConfirmSheet
            open
            title="Suspend merchant?"
            body={`${
              merchants.find((m) => m.id === pendingSuspend)?.name ?? ''
            } dibekukan dari berjualan. COD-nya juga berhenti sampai diaktifkan lagi.`}
            confirmLabel="Suspend"
            confirmClass="admin-btn-ghost"
            onConfirm={() => {
              const name = merchants.find((m) => m.id === pendingSuspend)?.name ?? ''
              dispatch(suspendMerchant({ id: pendingSuspend }))
              setPendingSuspend(null)
              toast.error(`Merchant di-suspend: ${name}`)
            }}
            onClose={() => setPendingSuspend(null)}
          />
        ) : null}

        <BottomSheet
          open={customerSheet !== null}
          title={sheetMerchant ? `Customer · ${sheetMerchant.name}` : 'Pilih customer'}
          onClose={() => setCustomerSheet(null)}
        >
          <div className="sheet-menu">
            {directory.map((customer) => {
              const selected = customerSheet
                ? codCustomer[customerSheet] === customer.id
                : false
              return (
                <button
                  key={customer.id}
                  type="button"
                  className={`sheet-menu__item${selected ? ' is-selected' : ''}`}
                  aria-current={selected}
                  onClick={() => {
                    if (!customerSheet) return
                    setCodCustomer((prev) => ({ ...prev, [customerSheet]: customer.id }))
                    setCustomerSheet(null)
                  }}
                >
                  <span>
                    {customer.name} · {customer.phone}
                  </span>
                  {selected ? <Check size={18} strokeWidth={1.75} aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
        </BottomSheet>
      </div>
    </OpsShell>
  )
}
