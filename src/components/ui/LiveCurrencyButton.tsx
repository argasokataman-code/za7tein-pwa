import { useState } from 'react'

import { BottomSheet } from './BottomSheet'
import { CurrencyConverter } from './CurrencyConverter'
import { CurrencyExchangeIcon } from './CurrencyExchangeIcon'

interface LiveCurrencyButtonProps {
  /** Kelas tambahan dari hero pemanggil (mis. varian di atas latar gelap). */
  className?: string
}

/**
 * Tombol kurs live (ikon koin) — tap membuka konverter kurs JOD ⇄ IDR
 * (`CurrencyConverter`), sama seperti beranda customer.
 */
export function LiveCurrencyButton({ className }: LiveCurrencyButtonProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        className={className ? `live-rate-button ${className}` : 'live-rate-button'}
        aria-label="Konversi kurs JOD ⇄ IDR"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <CurrencyExchangeIcon size={20} />
      </button>

      <BottomSheet open={open} ariaLabel="Konversi Kurs JOD ⇄ IDR" onClose={close}>
        <CurrencyConverter onClose={close} />
      </BottomSheet>
    </>
  )
}
