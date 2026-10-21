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
      <h3 className="doc-h3">Sign in with the WhatsApp number, grounded not guessed</h3>
      <p className="doc-p">
        The courier signs in with a phone number, not an email. That is the account-auth
        decision, not an invention: flow <code className="doc-inline">F21</code> requires
        a WhatsApp number for the customer <em>and</em> the courier/merchant, stored
        normalised to E.164 (<code className="doc-inline">source.md:760</code>,{' '}
        <code className="doc-inline">:727</code>), and <code className="doc-inline">F16</code>{' '}
        places the courier as a merchant employee recruited once the shop is active
        (C-06). The screen reuses the existing{' '}
        <code className="doc-inline">AuthLayout</code> and the shared{' '}
        <code className="doc-inline">signInSchema</code> (phone + password), so no new
        auth CSS or a fourth layout was added. No route guard is attached: this repo has
        no real session (AGENTS.md §1), matching{' '}
        <code className="doc-inline">/merchant/signin</code>, which also does not guard its
        dashboard.
      </p>
      <p className="doc-p">
        Courier onboarding asks for name, WhatsApp number, and consent only. There is no
        vehicle choice: the active PRD has every inhouse courier on foot (§9), so
        &ldquo;Motor/Mobil&rdquo; was a leftover from the old PO note. The schema, the
        courier slice, and the profile card no longer carry a vehicle field; the ledger
        and fee engine keep using walking distance.
      </p>
      <h3 className="doc-h3">The dashboard reads the slice it already has</h3>
      <p className="doc-p">
        The tasks screen opens with a statline (active, waiting for OTP, finished, tips).
        Every number is derived from the same <code className="doc-inline">courierSlice</code>{' '}
        the list below uses — no new mock. The active task stays the focal point; the
        statline is a glance before scrolling. It borrows the inline, no-box rhythm of{' '}
        <code className="doc-inline">merchant-statline</code> rather than repeating the
        boxed stat cards that were already removed elsewhere.
      </p>
      <h3 className="doc-h3">Beranda: identity, status, shortcuts in one screen</h3>
      <p className="doc-p">
        The courier home (<code className="doc-inline">/courier</code>) is a dashboard, not a bare
        task list. It opens with identity plus one primary control (the ready/paused toggle, with a
        status pill so the answer to "can I reach this courier" is readable before the button),
        then today's summary, then quick shortcuts to the two things the bottom nav does not hold:
        the tips wallet and the payout account. The bottom nav labels this tab{' '}
        <code className="doc-inline">Beranda</code>. Nothing here is a new number: active, waiting
        for OTP, finished, tips, and the withdrawable balance all derive from{' '}
        <code className="doc-inline">courierSlice</code> and{' '}
        <code className="doc-inline">courierTipsAvailable</code>, the same source the task cards
        below use. It also carries a seven-day performance card (tips only — the
        courier's income now also includes the delivery fee, but the weekly series
        tracks tips alone) and a two-column menu that shortcuts every courier
        action, including the two tabs already in the bottom nav. The active PRD has no courier
        dashboard or performance-report requirement (UNRESOLVED-by-absence), so this screen only
        composes state that already exists; the weekly series is an explicitly marked mock
        (<code className="doc-inline">mockCourierWeeklyTips</code>), not a decided rule.
      </p>
      <h3 className="doc-h3">OTP handover: the customer shows it, the courier types it</h3>
      <p className="doc-p">
        OTP is the only settle trigger (C-09) and belongs to the handover, so the two
        sides show it differently. The courier types the 4-digit code (
        <code className="doc-inline">DeliveryActionCard</code> input form). The customer
        sees it as a display card (<code className="doc-inline">otpDisplayCode</code>) to
        read out at the door. Previously the customer screen asked the customer to type
        the code the courier was meant to enter — an inverted role; now only the courier
        form validates, and the customer card is read-only. The code is the real{' '}
        <code className="doc-inline">orders.otp</code>, read by the customer through the{' '}
        <code className="doc-inline">my_order_otp</code> RPC; the courier's entry is
        checked server-side by <code className="doc-inline">verify_order_otp</code>, not
        by a local string comparison.
      </p>
      <h3 className="doc-h3">Finishing an order gets the same celebration as the customer</h3>
      <p className="doc-p">
        When the courier enters the correct OTP and the task settles, the screen shows the
        full-screen celebration the customer gets at "Tiba" (check circle + confetti). Both
        roles render the same shared <code className="doc-inline">OrderCelebration</code>{' '}
        component, extracted from{' '}
        <code className="doc-inline">/order-arrived</code> so the markup lives in one place.
        The customer uses it as a page; the courier uses it as an overlay (
        <code className="doc-inline">.order-celebration-overlay</code>, portalled to{' '}
        <code className="doc-inline">body</code>) on top of the task detail, so the courier
        stays in context and returns to the task list from the button. The overlay only
        appears on the transition into{' '}
        <code className="doc-inline">selesai</code>, not when revisiting an already finished
        task.
      </p>
      <h3 className="doc-h3">The customer notification is wired, still a mock</h3>
      <p className="doc-p">
        Flow <code className="doc-inline">F13</code> promises a customer notification at
        "Tiba". Web Push is not implemented in this repo (AGENTS.md §1,{' '}
        <code className="doc-inline">R-PUSH-01</code> is UNRESOLVED), so when the courier
        taps "Tiba" the screen dispatches one entry into the customer inbox (
        <code className="doc-inline">pushNotification</code> in{' '}
        <code className="doc-inline">notificationsSlice</code>) — "Kurir sudah sampai".
        The on-screen "receipt" banner that proved it is dev-only (
        <code className="doc-inline">import.meta.env.DEV</code>), so a production build
        never shows an internal mock to the courier. That is one store read across roles,
        the same pattern as disputes living in{' '}
        <code className="doc-inline">adminSlice</code>. The customer's OTP card then
        appears on the order screen without pressing the demo buttons, because it also
        reads the courier checkpoint (<code className="doc-inline">otpStep</code>). It is
        still labelled a mock, not a real push (HG-12).
      </p>
      <h3 className="doc-h3">Hard rules rendered as state, not logic</h3>
      <p className="doc-p">
        This repo is front-end only, so the PRD's hard rules appear as displayed
        state. Without a correct OTP the courier task cannot settle — the courier screen
        validates the 4-digit code before dispatching{' '}
        <code className="doc-inline">completeTask</code>, because OTP is the only
        settle trigger (C-09). The customer-fault guard shows the{' '}
        <code className="doc-inline">Hubungi customer</code> action at +5 minutes and
        enables <code className="doc-inline">Batal</code> at +10 minutes, mirroring the
        flow. SLA countdowns use a small{' '}
        <code className="doc-inline">useTick</code> hook and{' '}
        <code className="doc-inline">slaRemainingMs()</code>.
      </p>
      <h3 className="doc-h3">UNRESOLVED items live in the PRD, not on the courier screen</h3>
      <p className="doc-p">
        Two flow items are unresolved: the customer-fault penalty (OQ-14 — 30% / 50% /
        full delivery fee) and the temporary SLA of 15/30/10 minutes (OQ-13, PO
        2026-09-22). They are tracked in the PRD and flow docs, not repeated as
        meta-paragraphs on the courier screens — the mobile screen carries only what the
        courier needs to act. The credential mechanism itself (PIN or session/token) has
        no PRD basis either (<code className="doc-inline">F21</code> marks it UNRESOLVED),
        so the sign-in screen is a mock that verifies nothing.
      </p>
      <h3 className="doc-h3">Money: tips on `/tips`, delivery fee in the wallet</h3>
      <p className="doc-p">
        <code className="doc-inline">/courier/tips</code> is the tips history view and
        totals only the <code className="doc-inline">tip</code> field of finished tasks.
        The delivery fee is now courier income: the active PRD moved the recipient from
        the merchant to the courier (R-DELIV-FEE), so a completed Regular online order
        credits the wallet — the legacy C-06 rule ("the delivery fee is not courier
        income") is superseded. State lives in{' '}
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
        commission (PRD §Tips). Only the customer half is modelled there, so no credit is
        invented on the customer side; the courier wallet now models its own half (below).
      </p>
      <h3 className="doc-h3">Courier wallet: tips are withdrawn, the delivery fee is paid to DANA</h3>
      <p className="doc-p">
        The wallet (<code className="doc-inline">/courier/wallet</code>) holds <em>tips</em> only,
        and its balance is not a second state: it is derived as{' '}
        <code className="doc-inline">courierTipsBreakdown</code> ={' '}
        <code className="doc-inline">tips − payouts</code> (
        <code className="doc-inline">courierTipsAvailable</code> in{' '}
        <code className="doc-inline">src/data/courierWallet.ts</code>), where <em>tips</em> is the
        seeded history (<code className="doc-inline">mockCourierTips</code>) plus the tips of
        completed tasks (<code className="doc-inline">totalTips</code>). Completing a task raises it
        live and the <code className="doc-inline">/tips</code> page still reads the same source.
        Every screen that shows a withdrawable balance (wallet, courier home, profile, payout) calls
        that one function, so they can never disagree. Payouts and payout accounts live in{' '}
        <code className="doc-inline">courierSlice</code> (not persisted, matching the slice).
        Withdraw reuses flow <code className="doc-inline">f6-cashout-payout</code>; the payout fee of
        Rp2.500 per transfer is <em>borne by the courier</em> (PO 2026-09-22,{' '}
        <code className="doc-inline">source.md:84</code>) and is deducted from the amount, so{' '}
        <code className="doc-inline">/courier/payout</code> shows the net "diterima" before the
        courier confirms.
      </p>
      <p className="doc-p">
        The <em>delivery fee</em> of a completed Regular online order (R-DELIV-FEE moved the
        recipient from the merchant to the courier) is <strong>not</strong> part of that balance. PO
        decision 2026-10-16 resolved the open question the other way, following PRD §16.4: the
        platform pays the fee straight to the courier's DANA when the order settles, so it is never
        withdrawn through this flow. The wallet therefore shows it as a separate read-only income
        section (<code className="doc-inline">courierFeeEntries</code> /{' '}
        <code className="doc-inline">courierFeesPaid</code>, ledger rows of kind{' '}
        <code className="doc-inline">settlement</code>) instead of adding it to the withdrawable pot.
        The monthly salary is still paid by the merchant outside the app, and COD never enters (paid
        by the merchant off-app, R-COU-INHOUSE).
      </p>
      <p className="doc-p">
        The accumulation threshold is not a guessed rule: PRD
        gives an example (≥Rp50.000,{' '}
        <code className="doc-inline">source.md:83</code>) but{' '}
        <code className="doc-inline">f6-cashout-payout/README.md</code> marks it
        UNRESOLVED. It lives in one constant,{' '}
        <code className="doc-inline">COURIER_MIN_WITHDRAW_IDR</code>; the wallet
        shows the threshold figure and tracks the unresolved status in the flow doc, not
        as an on-screen note. Change the constant when the PO decides. Below the threshold
        the withdraw action is disabled with a meter showing how far away it is, rather
        than silently allowing an uneconomical withdrawal. The two new payout screens reuse
        the merchant payout flow (account picker, amount,{' '}
        <code className="doc-inline">BottomSheet</code> account form,{' '}
        <code className="doc-inline">ConfirmSheet</code> delete) rather than inventing a
        second pattern.
      </p>
      <h3 className="doc-h3">Courier partner: an assignment answered, not just shown</h3>
      <p className="doc-p">
        The partner screen (<code className="doc-inline">/courier/partner</code>) is the receiving end of
        flow <code className="doc-inline">f26-quick-dispatch</code>: a partner works one order at a time
        and answers an assignment with <strong>Terima</strong> or <strong>Tolak</strong>. Refusing is not
        a dead-end button: it opens a <code className="doc-inline">ConfirmSheet</code> whose confirm stays
        disabled until the reason is typed (COU-18), and the recorded reason is shown back in the history
        list. Status (offline / available / reserved / busy) is a chip borrowing the existing status
        tokens, not new colours, and the screen reads <code className="doc-inline">partnerSlice</code> so
        the same state the merchant dispatch notice points at. Real dispatch (OPEN-11) and the SP penalty
        are ops-side and not built, so a <code className="doc-inline">PlatformNotice</code> says the
        assignments on screen are demo data instead of pretending a dispatcher sent them.
      </p>
    </DocSection>
  )
}
