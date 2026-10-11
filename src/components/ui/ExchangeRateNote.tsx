import {
  RATE_DISCLAIMER,
  moneyPlain,
  rateSyncedLabel,
} from '../../data/currency'
import { useLiveRate } from '../../hooks/useLiveRate'

/**
 * Widget kurs IDR↔JOD: rate, waktu sync terakhir, dan disclaimer (M1, flow F10).
 * Dipasang di layar uang (checkout) — bukan di setiap halaman, karena angkanya
 * sama di semua tempat. Berlangganan `useLiveRate` supaya ikut berubah begitu
 * sync harian memperbarui rate.
 */
export function ExchangeRateNote() {
  const { rate } = useLiveRate()
  return (
    <p className="exchange-rate-note">
      1 JOD = {moneyPlain(rate.rate)} · sync terakhir {rateSyncedLabel()} ·{' '}
      {RATE_DISCLAIMER}
    </p>
  )
}
