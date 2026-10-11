import { useState } from 'react'
import { CalendarClock, Coins, Globe, RefreshCw } from 'lucide-react'

import { LIVE_RATE_SOURCE, RATE_DISCLAIMER, moneyPlain, rateSyncedLabel } from '../../data/currency'
import { useLiveRate } from '../../hooks/useLiveRate'
import { BottomSheet } from './BottomSheet'

interface LiveCurrencyButtonProps {
  /** Kelas tambahan dari hero pemanggil (mis. varian di atas latar gelap). */
  className?: string
}

/**
 * Tombol kurs live (ikon koin) — duduk di dalam track yang sama dengan sakelar
 * IDR/JOD. Tap membuka bottom sheet berisi detail kurs: pasangan IDR↔JOD,
 * sumber, waktu sync terakhir, jadwal pembaruan, dan disclaimer; plus tombol
 * "Perbarui sekarang" untuk memaksa sync (sehari sekali otomatis, `useLiveRate`).
 *
 * Sumber yang ditampilkan adalah provider sebenarnya (`LIVE_RATE_SOURCE`), bukan
 * nama lembaga resmi karangan — kalau rate masih mock, itu juga dikatakan.
 */
export function LiveCurrencyButton({ className }: LiveCurrencyButtonProps) {
  const { rate, syncing, refresh } = useLiveRate()
  const [open, setOpen] = useState(false)

  const isMock = rate.source === 'Mock'
  const jodPerIdr = (1 / rate.rate).toLocaleString('id-ID', {
    maximumFractionDigits: 8,
  })

  return (
    <>
      <button
        type="button"
        className={className ? `live-rate-button ${className}` : 'live-rate-button'}
        aria-label="Detail kurs live"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Coins size={20} strokeWidth={1.75} aria-hidden="true" />
      </button>

      <BottomSheet open={open} title="Detail Kurs Live" onClose={() => setOpen(false)}>
        <div className="live-rate">
          <div className="live-rate__hero">
            <p className="live-rate__pair">1 JOD = {moneyPlain(rate.rate)}</p>
            <p className="live-rate__inverse">1 IDR = {jodPerIdr} JOD</p>
          </div>

          <dl className="live-rate__meta">
            <div className="live-rate__row">
              <dt>
                <Globe size={18} strokeWidth={1.75} aria-hidden="true" />
                Sumber
              </dt>
              <dd>{isMock ? 'Kurs bawaan (mock)' : LIVE_RATE_SOURCE}</dd>
            </div>
            <div className="live-rate__row">
              <dt>
                <RefreshCw size={18} strokeWidth={1.75} aria-hidden="true" />
                Sync terakhir
              </dt>
              <dd>{rateSyncedLabel()}</dd>
            </div>
            <div className="live-rate__row">
              <dt>
                <CalendarClock size={18} strokeWidth={1.75} aria-hidden="true" />
                Pembaruan
              </dt>
              <dd>Otomatis setiap 24 jam</dd>
            </div>
          </dl>

          <p className="live-rate__disclaimer">{RATE_DISCLAIMER}</p>

          <button
            type="button"
            className="live-rate__refresh"
            aria-busy={syncing}
            disabled={syncing}
            onClick={() => void refresh()}
          >
            <RefreshCw
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
              className={syncing ? 'live-rate-button__icon is-spinning' : 'live-rate-button__icon'}
            />
            {syncing ? 'Memperbarui…' : 'Perbarui sekarang'}
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
