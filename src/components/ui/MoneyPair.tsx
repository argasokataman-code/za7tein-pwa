import { idrToJod, jod, moneyPlain } from '../../data/currency'

interface MoneyPairProps {
  /** Nominal IDR — source of truth; JOD hanya padanan tampilan (R-CURR-01). */
  idr: number
}

/**
 * Pasangan IDR + JOD **dua baris**, untuk sel tabel konsol SA.
 *
 * Satu baris (`money()`) tidak muat di tabel yang kolomnya banyak: tabel pajak
 * butuh 1031px di ruang 934px, tabel merchant 863px di ruang 754px — keduanya
 * lalu menggulir mendatar. Kalau dibiarkan membungkus sendiri, nilainya pecah di
 * tengah ("±1182,26" lalu "JOD"). Dua baris menyelesaikan keduanya tanpa
 * membuang salah satu mata uang.
 *
 * Memakai `.sa-table-sub` — baris kedua di dalam satu sel tabel. Kelasnya milik
 * konsol SA; kalau role lain butuh pola yang sama, angkat kelasnya dulu, jangan
 * salin gayanya ke sini.
 */
export function MoneyPair({ idr }: MoneyPairProps) {
  return (
    <>
      {moneyPlain(idr)}
      <span className="sa-table-sub">±{jod(idrToJod(idr))}</span>
    </>
  )
}
