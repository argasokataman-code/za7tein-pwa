import { useState } from 'react'

import { BottomSheet } from '../ui/BottomSheet'
import { CurrencyConverter } from '../ui/CurrencyConverter'
import { CurrencyExchangeIcon } from '../ui/CurrencyExchangeIcon'

interface CustomerCurrencyButtonProps {
  /** Kelas tambahan dari hero pemanggil (penempatan di baris atas). */
  className?: string
}

/**
 * Tombol mata uang beranda customer — mengikuti desain v2: satu tombol kaca
 * 44×44 (ikon tukar mata uang) di kanan baris atas.
 *
 * EDISI 02 **tidak punya sakelar IDR/JOD**: yang ada di contoh adalah konverter
 * kurs (JOD ⇄ IDR), bukan pemilih mata uang tampilan. Jadi sheet ini memuat
 * `CurrencyConverter` — bukan tombol segmented.
 */
export function CustomerCurrencyButton({ className }: CustomerCurrencyButtonProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        className={className ? `s7-currency-button ${className}` : 's7-currency-button'}
        aria-label="Konversi kurs JOD ⇄ IDR"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <CurrencyExchangeIcon size={22} />
      </button>

      <BottomSheet open={open} ariaLabel="Konversi Kurs JOD ⇄ IDR" onClose={close}>
        <CurrencyConverter onClose={close} />
      </BottomSheet>
    </>
  )
}
