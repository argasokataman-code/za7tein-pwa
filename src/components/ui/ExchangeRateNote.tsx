import {
  MOCK_EXCHANGE_RATE,
  RATE_DISCLAIMER,
  moneyPlain,
  rateSyncedLabel,
} from '../../data/currency'

/**
 * Widget kurs IDR↔JOD: rate, waktu sync terakhir, dan disclaimer (M1, flow F10).
 * Dipasang di layar uang (checkout) — bukan di setiap halaman, karena angkanya
 * sama di semua tempat.
 */
export function ExchangeRateNote() {
  return (
    <p className="exchange-rate-note">
      1 JOD = {moneyPlain(MOCK_EXCHANGE_RATE.rate)} · sync terakhir{' '}
      {rateSyncedLabel()} · {RATE_DISCLAIMER}
    </p>
  )
}
