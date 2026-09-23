import { AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { SuperAdminShell } from '../components/layout/SuperAdminShell'
import { BottomSheet } from '../components/ui/BottomSheet'
import { switchIsDown, switchMeta, switchStatusLabel } from '../data/superadmin'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { toggleSwitch } from '../store/slices/superAdminSlice'
import type { PlatformSwitches } from '../types'

/**
 * Kill switch. Tiap perubahan jalur wajib konfirmasi dulu, dan konfirmasinya
 * menyebut akibatnya (bukan "Yakin?") karena yang dimatikan bukan sekadar
 * preferensi, COD mati berarti customer tidak bisa bayar di tempat.
 *
 * Konfirmasi memakai `BottomSheet` yang sudah ada di repo: ia sudah menangani
 * Escape, klik overlay, dan atribut dialog, jadi tidak perlu modal baru.
 */
export default function SaSwitches() {
  const dispatch = useAppDispatch()
  const switches = useAppSelector((s) => s.superAdmin.switches)
  const [pending, setPending] = useState<keyof PlatformSwitches | null>(null)

  const pendingMeta = switchMeta.find((meta) => meta.key === pending)
  const turningOff = pending ? switches[pending] : false

  return (
    <SuperAdminShell>
      <section className="sa-card">
        <p className="sa-card-label">Kill switch platform</p>
        <p className="sa-card-sub">
          Tiga jalur yang bisa dihentikan tanpa deploy ulang. Setiap perubahan langsung tercatat di
          audit trail, dan tidak ada jalur yang berhenti sendiri.
        </p>
      </section>

      <section className="sa-switch-grid">
        {switchMeta.map((meta) => {
          const on = switches[meta.key]
          return (
            <article key={meta.key} className="sa-card">
              <div className="sa-card-head">
                <div>
                  <p className="sa-card-title">{meta.label}</p>
                  <p className="sa-card-sub">{meta.detail}</p>
                </div>
                <span className={`sa-chip${switchIsDown(meta.key, switches) ? ' is-off' : ' is-ok'}`}>
                  {switchStatusLabel(meta.key, switches)}
                </span>
              </div>
              <div className="sa-actions">
                <button
                  type="button"
                  className={on ? 'sa-btn' : 'sa-btn sa-btn--primary'}
                  onClick={() => setPending(meta.key)}
                >
                  {on ? (
                    <ToggleRight size={16} strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <ToggleLeft size={16} strokeWidth={1.75} aria-hidden="true" />
                  )}
                  {on ? 'Hentikan jalur' : 'Nyalakan jalur'}
                </button>
              </div>
            </article>
          )
        })}
      </section>

      <section className="sa-card">
        <p className="sa-card-label">
          <AlertTriangle size={14} strokeWidth={1.75} aria-hidden="true" /> Yang tetap berjalan
        </p>
        <p className="sa-card-sub">
          Mematikan COD tidak membatalkan order yang sudah berjalan; mematikan payout tidak
          menghapus saldo siapa pun. Order yang sudah masuk tetap bisa diselesaikan sampai selesai.
        </p>
      </section>

      <BottomSheet
        open={pending !== null}
        title={pendingMeta ? (turningOff ? `Hentikan ${pendingMeta.label}?` : `Nyalakan ${pendingMeta.label}?`) : undefined}
        onClose={() => setPending(null)}
      >
        <p className="sa-card-sub">
          {pendingMeta
            ? turningOff
              ? pendingMeta.detail
              : `Jalur ${pendingMeta.label} kembali normal.`
            : ''}
        </p>
        <div className="sa-actions">
          <button
            type="button"
            className={turningOff ? 'sa-btn sa-btn--danger' : 'sa-btn sa-btn--primary'}
            onClick={() => {
              if (!pending || !pendingMeta) return
              dispatch(toggleSwitch({ key: pending }))
              toast.success(
                turningOff
                  ? `${pendingMeta.label} dihentikan, tercatat di audit trail`
                  : `${pendingMeta.label} kembali normal, tercatat di audit trail`,
              )
              setPending(null)
            }}
          >
            {turningOff ? 'Ya, hentikan' : 'Ya, nyalakan'}
          </button>
          <button type="button" className="sa-btn" onClick={() => setPending(null)}>
            Batal
          </button>
        </div>
      </BottomSheet>
    </SuperAdminShell>
  )
}
