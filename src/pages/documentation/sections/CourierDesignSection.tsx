import { DocSection } from '../DocSection'

export function CourierDesignSection() {
  return (
    <DocSection id="courier-design" num="20" title="Courier Console — Design Decisions">
      <p className="doc-p">
        The courier console (<code className="doc-inline">/courier</code>) is the third
        role built here. Its source of truth is flow{' '}
        <code className="doc-inline">F13</code>{' '}
        (<code className="doc-inline">docs/design/flows/f13-courier-view/</code>) and
        milestones M4/M5 of the active PRD{' '}
        <code className="doc-inline">irbid-mvp-v2-2026-09-21</code>. The brief is
        "minimalis satu tangan": one column, one primary action per screen, no tables.
      </p>
      <h3 className="doc-h3">Two axes, one order</h3>
      <p className="doc-p">
        A courier and a customer look at the same order from different sides. The
        detail screen therefore shows both axes side by side: the shared{' '}
        <code className="doc-inline">JourneyLine</code> renders the order status
        (<code className="doc-inline">diterima → dimasak → diantar → tiba</code>, the
        customer/merchant axis), while a courier-specific stepper renders the delivery
        checkpoints (<code className="doc-inline">ambil → berangkat → tiba → OTP → selesai</code>).
        Neither is redrawn — the journey rail is the existing component, and the
        checkpoint stepper lives in the new{' '}
        <code className="doc-inline">_courier.scss</code> partial.
      </p>
      <h3 className="doc-h3">Checkpoints follow F13, including its shape</h3>
      <p className="doc-p">
        Stored checkpoints are{' '}
        <code className="doc-inline">masuk, ambil, berangkat, tiba, selesai</code>, plus
        the customer-fault branch <code className="doc-inline">batal</code>. The flow's{' '}
        <code className="doc-inline">otp</code> node is not a stored state — it is the
        step inside <code className="doc-inline">tiba</code> (arrived, waiting for the
        customer's code). <code className="doc-inline">courierStepIndex()</code> maps a
        checkpoint to its position in the five-step stepper so the two views never
        drift.
      </p>
      <h3 className="doc-h3">Hard rules rendered as state, not logic</h3>
      <p className="doc-p">
        This repo is front-end only, so the PRD's hard rules appear as displayed
        state. Without a correct OTP the task cannot settle — the screen validates the
        4-digit code before dispatching{' '}
        <code className="doc-inline">completeTask</code>, because OTP is the only
        settle trigger (C-09). The customer-fault guard shows the{' '}
        <code className="doc-inline">Hubungi customer</code> action at +5 minutes and
        enables <code className="doc-inline">Batal</code> at +10 minutes, mirroring the
        flow. SLA countdowns use a small{' '}
        <code className="doc-inline">useTick</code> hook and{' '}
        <code className="doc-inline">slaRemainingMs()</code>.
      </p>
      <h3 className="doc-h3">UNRESOLVED items stay visible, never guessed</h3>
      <p className="doc-p">
        Two flow items are unresolved and are surfaced as text instead of invented
        values: the customer-fault penalty (OQ-14 — 30% / 50% / full delivery fee) and
        the temporary SLA of 15/30/10 minutes (OQ-13, PO 2026-09-22). The courier login
        screen is absent on purpose: the active PRD has no courier auth requirement
        (a courier is a merchant employee under C-06, managed by the merchant), so it
        is marked UNRESOLVED-by-absence rather than built on a guess.
      </p>
      <h3 className="doc-h3">Money: tips only, never the delivery fee</h3>
      <p className="doc-p">
        <code className="doc-inline">/courier/tips</code> totals only the{' '}
        <code className="doc-inline">tip</code> field of finished tasks. The delivery
        fee is not courier income, and the platform never holds courier funds (C-06) —
        the screen states this directly. State lives in{' '}
        <code className="doc-inline">src/store/slices/courierSlice.ts</code> and is not
        persisted.
      </p>
      <p className="doc-p">
        The customer side of the same rule lives on the post-order rating screen
        (<code className="doc-inline">/rating-driver</code>, reached from{' '}
        <code className="doc-inline">/order-arrived</code>): optional tip chips, and the
        chosen amount is deducted from the customer wallet by{' '}
        <code className="doc-inline">tipCourier</code> in{' '}
        <code className="doc-inline">walletSlice</code> — 100% to the courier, no platform
        commission (PRD §Tips). Only the customer half is modelled: the courier wallet is a
        mock number on the CS panel, so no credit is invented here. Tip amounts are display
        state, not a decided business rule.
      </p>
    </DocSection>
  )
}
