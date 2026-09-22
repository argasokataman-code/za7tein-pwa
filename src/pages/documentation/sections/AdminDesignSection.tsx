import { DocSection } from '../DocSection'

export function AdminDesignSection() {
  return (
    <DocSection id="admin-design" num="21" title="Admin Panel (CS) — Design Decisions">
      <p className="doc-p">
        The console at <code className="doc-inline">/admin</code> is the{' '}
        <strong>platform admin panel, operated by CS</strong> — the fourth role shell in
        this PWA. Its sources are flow <code className="doc-inline">F15</code> (onboarding,
        liability, escalation, guard actions) and flow <code className="doc-inline">F8</code>{' '}
        (dispute queue), plus milestones M6/M9 of the active PRD.
      </p>
      <p className="doc-p">
        <strong>Super Admin is a different role</strong>, deliberately not built here.
        The PO decision of 2026-09-23 split them: the console that PRD C-12 called
        &quot;CS, doubling as super admin&quot; is the CS admin panel above, while Super
        Admin becomes a <strong>separate full-website console (non-PWA)</strong> for the
        owner/team with full platform control. Its detailed scope and prefix are
        UNRESOLVED — nothing is stubbed for it yet. See{' '}
        <code className="doc-inline">docs/product/prd/decision-irbid-mvp.md</code>.
      </p>
      <h3 className="doc-h3">Shell: 430px panel, and why Super Admin is different</h3>
      <p className="doc-p">
        A wide table dashboard was the obvious guess for this console, and AGENTS §9
        asked for a <em>documented</em> exception before any width change. Because this
        shell is the CS panel and CS works on the go, it{' '}
        <strong>keeps the 430px column</strong> like every other role, with lists rendered
        as stacked cards. The width exception is therefore <em>not</em> applied here; it
        belongs to the future Super Admin website, and must be documented here the same
        way the landing page exception is (see Layout Exceptions) when that is built.
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
        <code className="doc-inline">approved</code> — a merchant is never activated
        while the deposit is unpaid.
        <br />
        <strong>Blacklist marks two sides.</strong>{' '}
        <code className="doc-inline">blacklistCod</code> sets{' '}
        <code className="doc-inline">merchant.tenantStatus: blacklisted</code> and pushes a
        customer <code className="doc-inline">riskFlag</code> in the same action, because
        blocking COD checkout needs both.
        <br />
        <strong>Dispute resolution writes ledger.</strong> Every money-moving resolution
        (refund full/partial, release) appends exactly one ledger entry;{' '}
        <code className="doc-inline">no_action</code> appends none because it does not
        change a balance. This mirrors F8&apos;s &quot;one entry per resolution&quot; and
        M9&apos;s append-only ledger.
      </p>
      <h3 className="doc-h3">Liability excludes courier wages</h3>
      <p className="doc-p">
        The dashboard total is customer wallets + merchant wallets + courier tips not
        yet paid out. Courier wages are <em>not</em> part of it: a courier is a merchant
        employee and the platform never holds courier funds (C-06) — only tips pass
        through. The screen states this, and the Xendit-vs-liability comparison is a
        mock flag, not reconciliation.
      </p>
      <h3 className="doc-h3">One dispute form, two roles</h3>
      <p className="doc-p">
        The submit form is a single page mounted at{' '}
        <code className="doc-inline">/customer/dispute</code> and{' '}
        <code className="doc-inline">/merchant/dispute</code>, reading the order code and
        filer from query params and writing into the shared{' '}
        <code className="doc-inline">adminSlice</code>. One component means the two
        submission paths can never drift apart, and both land in the same SA queue.
        The order amount is shown in JOD using the M1 example rate (Rp23.000), labelled
        as a temporary rate because M1 is not implemented.
      </p>
      <h3 className="doc-h3">What is deliberately not built</h3>
      <p className="doc-p">
        Tier-quota configuration has no schema field, so it is not built
        (UNRESOLVED). Dispute categories and the 24-hour window are placeholders
        pending OQ-29 and are labelled as such on screen. There is no admin auth or
        audit trail — the active PRD has no requirement for either, so they stay
        UNRESOLVED-by-absence rather than invented.
      </p>
    </DocSection>
  )
}
