import { RefreshCw } from 'lucide-react'

import { usePullToRefresh } from '../../hooks/usePullToRefresh'

/**
 * Indikator tarik-untuk-menyegarkan, dipasang sekali di `PageTransition` supaya
 * keempat peran mendapatkannya tanpa menambah apa pun di tiap halaman.
 *
 * Lingkupnya gestur + indikator: repo ini tidak punya backend, jadi tidak ada
 * yang bisa diambil ulang. Yang dibangun adalah umpan baliknya — dan itu tetap
 * berguna, karena `overscroll-behavior-y: none` (keputusan 2026-09-24) membuat
 * tarikan di puncak halaman tidak menghasilkan apa pun sama sekali sebelumnya.
 *
 * Tidak ada elemen `<button>` atau `<a>` di sini — indikatornya murni visual dan
 * `aria-hidden`, karena tidak ada aksi yang bisa dijalankan pembaca layar.
 * Menjadikannya tombol akan menambah satu kontrol yang tak melakukan apa pun.
 */
export function PullToRefreshIndicator() {
  const { pull, refreshing } = usePullToRefresh()

  const active = refreshing || pull > 0

  return (
    <div
      className={`ptr${refreshing ? ' ptr--refreshing' : ''}`}
      aria-hidden="true"
      style={{
        // Satu properti: CSS memakainya untuk geser dan opasitas sekaligus.
        // `translate` (bukan `transform`) supaya tidak menjadi containing block
        // untuk `position: fixed` di sekitarnya.
        ['--ptr-pull' as string]: `${pull}px`,
        ['--ptr-progress' as string]: `${Math.min(pull / 64, 1)}`,
        visibility: active ? 'visible' : 'hidden',
      }}
    >
      <span className="ptr__disc">
        <RefreshCw size={20} strokeWidth={1.75} />
      </span>
    </div>
  )
}
