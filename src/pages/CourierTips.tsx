import { Link } from 'react-router-dom'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { useAppSelector } from '../hooks/useAppStore'
import { money } from '../data/merchant'
import { isDoneTask, totalTips } from '../data/courier'

export default function CourierTips() {
  const tasks = useAppSelector((s) => s.courier.tasks)
  const done = tasks.filter(isDoneTask)

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader eyebrow="Penghasilan" title="Tips" />

        <section className="courier-card courier-tips-hero">
          <p className="courier-card-sub">Total tips</p>
          <p className="courier-tips-total">{money(totalTips(tasks))}</p>
        </section>

        <Link className="btn btn-primary courier-wallet-cta" to="/wallet">
          Buka dompet tips
        </Link>

        <section className="courier-card">
          <p className="courier-card-title">Hanya tips yang menjadi milik kurir</p>
          <p className="courier-card-sub">
            Kurir adalah karyawan merchant — gaji dibayar merchant, dan platform tidak menahan dana
            kurir (C-06). Ongkir bukan milik kurir, jadi tidak dihitung di sini.
          </p>
        </section>

        <section className="courier-section">
          <h2 className="courier-section-title">Riwayat selesai</h2>
          {done.length === 0 ? (
            <p className="courier-empty">Belum ada tugas selesai.</p>
          ) : (
            done.map((task) => (
              <div key={task.id} className="courier-history">
                <div>
                  <p className="courier-task-code">{task.code}</p>
                  <p className="courier-task-sub">{task.customerName}</p>
                </div>
                <span className="courier-history-tip">{money(task.tip)}</span>
              </div>
            ))
          )}
        </section>
      </main>
      <CourierBottomNav />
    </div>
  )
}
