import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface SelectFieldProps {
  /** Daftar opsi (label = nilai). */
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  /** Teks saat belum ada pilihan. */
  placeholder?: string
  /** Nama field untuk `aria-label` trigger (mis. "Bank"). */
  label: string
  invalid?: boolean
  describedBy?: string
}

/**
 * Dropdown sendiri, pengganti `<select>` peramban. Trigger-nya memakai bentuk
 * field yang sama dengan `.form-control` (mixin `field-shape`) dan membuka
 * daftar opsi tepat di bawahnya — tampilan kontrol bawaan peramban tak muncul
 * lagi, warnanya dari design system.
 *
 * Daftar dibuka **inline** (bukan `BottomSheet` kedua) supaya bisa dipakai di
 * dalam sheet form: sheet yang menumpuk membuat satu tap menutup dua panel
 * sekaligus. Karena panel form itu `overflow: auto`, menu melayang (absolute)
 * akan terpotong — jadi menunya mengalir, mendorong field di bawahnya.
 *
 * Pilihan = satu nilai string; untuk opsi ber-`value` beda, map dulu.
 */
export function SelectField({
  options,
  value,
  onChange,
  placeholder = 'Pilih',
  label,
  invalid,
  describedBy,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={`form-control field-select${value ? '' : ' is-empty'}${invalid ? ' error' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{value || placeholder}</span>
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          className={`field-select-chevron${open ? ' is-open' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="field-select-menu" role="listbox" aria-label={label}>
          {options.map((option) => {
            const selected = option === value
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                className={`field-select-option${selected ? ' is-active' : ''}`}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                <span>{option}</span>
                {selected ? <Check size={18} strokeWidth={1.75} aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
