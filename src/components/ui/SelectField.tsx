import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'

/** Opsi dengan nilai dan label berbeda (mis. id menu + nama menu). */
export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  /** Daftar opsi; string berarti label = nilai. */
  options: readonly (string | SelectOption)[]
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
  const items = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  )
  const selectedLabel = items.find((option) => option.value === value)?.label

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
        <span>{selectedLabel || placeholder}</span>
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          className={`field-select-chevron${open ? ' is-open' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="field-select-menu" role="listbox" aria-label={label}>
          {items.map((option) => {
            const selected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={`field-select-option${selected ? ' is-active' : ''}`}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                <span>{option.label}</span>
                {selected ? <Check size={18} strokeWidth={1.75} aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
