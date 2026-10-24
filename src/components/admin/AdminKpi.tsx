import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AdminKpiProps {
  label: string
  value: ReactNode
  sub?: string
  /** Rute tujuan. Tanpa ini KPI jadi kartu statis (metrik halaman itu sendiri). */
  to?: string
  /** Aksen angka hanya untuk sinyal urgensi (mis. SLA lewat). Default netral. */
  tone?: 'warning' | 'danger'
}

/**
 * Satu kartu KPI baris ringkasan panel ops: label → angka besar → sub. Dengan
 * `to` ia dirender sebagai `<Link>` supaya angkanya membuka halaman yang
 * datanya ia tunjukkan; tanpa `to` ia kartu statis. Dipakai Ringkasan dan tiap
 * halaman admin supaya baris ringkasan seragam — satu komponen, bukan lima
 * salinan (DNA: pola sama dua kali → ekstrak).
 */
export function AdminKpi({ label, value, sub, to, tone }: AdminKpiProps) {
  const body = (
    <>
      <span className="admin-kpi-label">{label}</span>
      <span className={`admin-kpi-value${tone ? ` is-${tone}` : ''}`}>{value}</span>
      {sub ? <span className="admin-kpi-sub">{sub}</span> : null}
    </>
  )

  return to ? (
    <Link className="admin-kpi-item" to={to}>
      {body}
    </Link>
  ) : (
    <div className="admin-kpi-item">{body}</div>
  )
}
