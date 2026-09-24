import type { ReactNode } from 'react'

import {
  AUTO_SETTLE_MINUTES,
  COURIER_CHECKPOINT_LABEL,
  COURIER_STEPS,
  courierStepIndex,
  elapsedMinutes,
  formatCountdown,
  slaRemainingMs,
} from '../data/courier'
import type { CourierCheckpoint } from '../types'

/** Bentuk minimal untuk helper SLA — sama untuk task kurir maupun checkpoint order. */
const timerOf = (checkpoint: CourierCheckpoint, startedAt: string | null) => ({
  checkpoint,
  checkpointStartedAt: startedAt ?? undefined,
})

/**
 * Stepper checkpoint pengiriman (flow F5). Dipakai dua sisi dari order yang sama:
 * layar kurir (`F13`) dan detail order customer (`M5`). Sebelumnya blok ini hanya
 * ada di layar kurir; menyalinnya ke layar customer berarti dua tempat yang harus
 * diperbaiki bersamaan tiap kali urutan langkah berubah.
 *
 * Kelasnya tetap memakai prefiks `courier-` supaya tampilannya identik di kedua
 * sisi tanpa CSS baru.
 */
export function DeliveryStepper({ checkpoint }: { checkpoint: CourierCheckpoint }) {
  const stepIndex = courierStepIndex(checkpoint)
  return (
    <>
      <ol className="courier-steps">
        {COURIER_STEPS.map((step, index) => {
          const state = index < stepIndex ? 'done' : index === stepIndex ? 'active' : 'todo'
          return (
            <li key={step.id} className={`courier-step courier-step--${state}`}>
              <span className="courier-step-dot" aria-hidden="true" />
              <span className="courier-step-label">{step.label}</span>
            </li>
          )
        })}
      </ol>
      <p className="courier-step-state">{COURIER_CHECKPOINT_LABEL[checkpoint]}</p>
    </>
  )
}

interface DeliveryActionCardProps {
  checkpoint: CourierCheckpoint
  /** Waktu checkpoint sekarang dimulai; SLA dihitung dari sini. */
  startedAt: string | null
  /** Jam bersama dari `useTick` — satu timer per halaman, bukan per komponen. */
  now: number
  /** Sisi kurir: nilai input OTP yang sedang diketik. */
  otp?: string
  onOtpChange?: (value: string) => void
  onOtpSubmit?: () => void
  otpHint?: string
  /**
   * Sisi customer: kode ditampilkan sebagai kartu serah-terima, bukan input.
   * Kalau diisi, form input tidak dirender — customer menunjukkan kode ini ke
   * kurir (C-09: yang memasukkan OTP adalah kurir, bukan customer).
   */
  otpDisplayCode?: string
  /** Aksi milik pemakai layar (kurir: tombol lanjut + guard; customer: tombol demo). */
  actions?: ReactNode
  /** Bukti saat Tiba (customer: GPS + foto). Kurir tidak mengirim apa pun. */
  evidence?: ReactNode
  /**
   * Order sedang disputed → auto-settle dijeda sampai ada putusan (M6/F8).
   * Ditampilkan sebagai catatan ganti, bukan timer yang jalan diam-diam.
   */
  autoSettlePaused?: boolean
}

/**
 * Kartu aksi pengiriman: timer SLA, bukti checkpoint, aksi pemakai, serah-terima
 * OTP saat Tiba, dan catatan auto-settle. Angka SLA dan copy OTP dibaca dari
 * `data/courier.ts` supaya kedua peran tidak pernah memakai angka berbeda.
 *
 * Dua mode OTP: kurir mengetik kode (`otp`/`onOtpChange`/`onOtpSubmit`), customer
 * menunjukkan kode (`otpDisplayCode`). Dulu layar customer juga menyuruh customer
 * mengetik kode yang seharusnya diisi kurir — peran terbalik; sekarang customer
 * menampilkan kode, kurir yang memasukkannya (C-09).
 */
export function DeliveryActionCard({
  checkpoint,
  startedAt,
  now,
  otp,
  onOtpChange,
  onOtpSubmit,
  otpHint,
  otpDisplayCode,
  actions,
  evidence,
  autoSettlePaused = false,
}: DeliveryActionCardProps) {
  const timer = timerOf(checkpoint, startedAt)
  const sla = slaRemainingMs(timer, now)
  const overdue = sla != null && sla < 0
  const isOtpStep = checkpoint === 'tiba'
  const autoSettle = isOtpStep && elapsedMinutes(timer, now) >= AUTO_SETTLE_MINUTES

  return (
    <section className="courier-action">
      {sla != null ? (
        <p className={`courier-timer ${overdue ? 'is-overdue' : ''}`}>
          {overdue
            ? 'Lewat SLA — tim CS ditandai otomatis'
            : `Sisa waktu ${formatCountdown(sla)}`}
        </p>
      ) : null}

      {evidence}
      {actions}

      {isOtpStep && otpDisplayCode ? (
        <div className="courier-otp-display">
          <p className="courier-otp-label">Tunjukkan kode ini ke kurir</p>
          <p
            className="courier-otp-code"
            aria-label={`Kode OTP ${otpDisplayCode.split('').join(' ')}`}
          >
            {otpDisplayCode.split('').join(' ')}
          </p>
          <p className="courier-otp-hint">
            Kurir memasukkan kode ini untuk menyelesaikan pengiriman. Jangan berikan sebelum
            pesanan kamu periksa.
          </p>
        </div>
      ) : isOtpStep && otp !== undefined && onOtpChange && onOtpSubmit ? (
        <form
          className="courier-otp"
          onSubmit={(event) => {
            event.preventDefault()
            onOtpSubmit()
          }}
        >
          <label htmlFor="courier-otp">Kode OTP dari customer (4 digit)</label>
          <input
            id="courier-otp"
            className="form-control"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            value={otp}
            onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
          />
          {otpHint ? <p className="courier-otp-hint">{otpHint}</p> : null}
          <button className="btn btn-primary" type="submit" disabled={otp.length !== 4}>
            Selesaikan
          </button>
        </form>
      ) : null}

      {/* F5: order tidak boleh menggantung pending selamanya — OTP lewat tetap
          auto-settle, bukan stuck. Kecuali order disputed: hold dibekukan sampai
          ada putusan (F8), jadi auto-settle dijeda. */}
      {autoSettle && autoSettlePaused ? (
        <p className="courier-sla-note">
          Auto-settle dijeda — order sedang disputed sampai panel CS memutuskan (F8).
        </p>
      ) : autoSettle ? (
        <p className="courier-sla-note">
          Customer lalai: window OTP {AUTO_SETTLE_MINUTES} menit lewat — order tetap auto-settle,
          tidak menggantung pending.
        </p>
      ) : null}

      <p className="courier-sla-note">
        SLA 15/30/10 menit masih sementara (PO 2026-09-22) — final menunggu data rute Irbid
        (OQ-13).
      </p>
    </section>
  )
}
