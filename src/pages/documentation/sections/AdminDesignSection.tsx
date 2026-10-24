import { DocSection } from '../DocSection'

export function AdminDesignSection() {
  return (
    <DocSection id="admin-design" num="21" title="Panel Ops (backoffice) — Design Decisions">
      <p className="doc-p">
        The canonical backoffice is <code className="doc-inline">/ops</code>, a full-width
        non-PWA website operated by ops. It replaced the CS panel{' '}
        <code className="doc-inline">/admin</code> on 2026-10-24; the old URLs redirect to
        their ops equivalents, and the screens for disputes, merchants, ledger and
        liability moved here rather than being rebuilt. Detail:{' '}
        <code className="doc-inline">decision-ops-canonical.md</code>.
      </p>
      <p className="doc-p">
        <strong>Super Admin is a different role.</strong> The PO decision of 2026-09-23
        split the console PRD C-12 called &quot;CS, doubling as super admin&quot; from a
        separate Super Admin console for the owner/team. Super Admin remains a full-website
        console at <code className="doc-inline">/superadmin</code>; ops audits its actions
        through the same audit trail.
      </p>

      <h3 className="doc-h3">Shell: desktop rail, no phone column</h3>
      <p className="doc-p">
        Ops reuses the <code className="doc-inline">.sa-*</code> shell from Super Admin: a
        248px sidebar rail plus a content area capped at 1180px. It is deliberately not
        the 430px PWA column — backoffice work is tables and queues on a laptop. The
        exception is documented in the Layout Exceptions section. On screens below 901px
        the rail collapses with the same shell rules as SA; it is not an installable app.
      </p>
      <p className="doc-p">
        Each page opens with a title and one-line subtitle, then KPI cards and its panels.
        The migrated CS pages keep their content classes inside{' '}
        <code className="doc-inline">.sa-main</code>: four KPI columns from 901px, the
        dispute queue as a <strong>master-detail</strong> view, and money-path sheets as
        centered dialogs instead of phone bottom sheets.
      </p>

      <h3 className="doc-h3">Money path, evidence, and list tools</h3>
      <p className="doc-p">
        The dispute verdict dialog carries the partial-refund slider and a{' '}
        <strong>required decision note</strong> (minimum 10 characters,{' '}
        <code className="doc-inline">aria-invalid</code> plus a counter) that gates the
        confirm button — the form shape only, since the exact percentages and the 24-hour
        window remain UNRESOLVED (OQ-29). Disputes and tenant onboarding render{' '}
        <strong>real evidence thumbnails</strong> that open a full-preview sheet.
        Destructive actions confirm through <code className="doc-inline">ConfirmSheet</code>;
        the ledger has search, type filter, sort and a bounded list.
      </p>

      <h3 className="doc-h3">Hard rules as displayed state</h3>
      <p className="doc-p">
        Three PRD rules are modelled as state so the screens stay honest:
        <br />
        <strong>Deposit gate.</strong>{' '}
        <code className="doc-inline">approveDeposit</code> refuses to run while{' '}
        <code className="doc-inline">depositStatus</code> is not{' '}
        <code className="doc-inline">unpaid</code>, and only then flips it to{' '}
        <code className="doc-inline">held</code> and the tenant to{' '}
        <code className="doc-inline">approved</code>.
        <br />
        <strong>Blacklist marks two sides.</strong>{' '}
        <code className="doc-inline">blacklistCod</code> sets{' '}
        <code className="doc-inline">merchant.tenantStatus: blacklisted</code> and pushes a
        customer <code className="doc-inline">riskFlag</code> in the same action.
        <br />
        <strong>Dispute resolution writes ledger.</strong> Every money-moving resolution
        appends exactly one ledger entry; <code className="doc-inline">no_action</code>{' '}
        appends none because it does not change a balance.
      </p>

      <h3 className="doc-h3">Liability excludes courier wages</h3>
      <p className="doc-p">
        The <code className="doc-inline">/ops/liability</code> total is customer wallets +
        merchant wallets + courier tips not yet paid out. Courier wages are <em>not</em>{' '}
        part of it: a courier is a merchant employee and the platform never holds courier
        funds (C-06) — only tips pass through. The DANA-vs-liability comparison is a mock
        flag, not reconciliation.
      </p>

      <h3 className="doc-h3">One dispute form, two roles</h3>
      <p className="doc-p">
        The submit form is a single page mounted at{' '}
        <code className="doc-inline">/customer/dispute</code> and{' '}
        <code className="doc-inline">/merchant/dispute</code>, reading the order code and
        filer from query params and writing into the shared{' '}
        <code className="doc-inline">adminSlice</code>. Both submission paths land in the
        same ops queue.
      </p>
    </DocSection>
  )
}
