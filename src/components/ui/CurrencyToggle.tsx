import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { useDisplayCurrency } from '../../hooks/useMoney'
import { setCurrency } from '../../store/slices/preferencesSlice'
import type { CurrencyCode } from '../../types'

const OPTIONS: CurrencyCode[] = ['IDR', 'JOD']

interface CurrencyToggleProps {
  /** Kelas tambahan dari header pemanggil (mis. penempatan di bar). */
  className?: string
}

/**
 * Sakelar mata uang tampilan IDR/JOD — satu peran, disimpan lokal (bukan DB).
 *
 * Dua pilihan saja dan sengaja sempit supaya bisa duduk di baris judul tanpa
 * mendorong kontrol lain. Tidak dirender saat peran belum diketahui (layar
 * pra-masuk), karena preferensinya memang per peran.
 */
export function CurrencyToggle({ className }: CurrencyToggleProps) {
  const dispatch = useAppDispatch()
  const role = useAppSelector((s) => s.auth.role)
  const current = useDisplayCurrency()

  if (!role) return null

  return (
    <div
      className={className ? `currency-toggle ${className}` : 'currency-toggle'}
      role="radiogroup"
      aria-label="Mata uang tampilan"
    >
      {OPTIONS.map((code) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={current === code}
          className={
            current === code
              ? 'currency-toggle__option is-active'
              : 'currency-toggle__option'
          }
          onClick={() => dispatch(setCurrency({ role, currency: code }))}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
