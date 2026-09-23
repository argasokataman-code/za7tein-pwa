import { useState } from 'react'

/** Multi-select state for filter chips — tracks which keys are on. */
export function useChipSet(initial: string[] = []) {
  const [active, setActive] = useState<string[]>(initial)
  return {
    isActive: (key: string) => active.includes(key),
    toggle: (key: string) =>
      setActive((a) => (a.includes(key) ? a.filter((x) => x !== key) : [...a, key])),
    /** Semua chip yang sedang aktif. */
    values: active,
    /** Kosongkan semua chip sekaligus (tombol "Clear All"). */
    clear: () => setActive([]),
  }
}

/** Single-select state for list rows (payment method, address, ...). */
export function useSelection(initial: string | null = null) {
  const [selected, setSelected] = useState<string | null>(initial)
  return {
    isSelected: (key: string) => selected === key,
    select: (key: string) => setSelected(key),
  }
}

/** Open/closed state for accordions, addressed by index. */
export function useToggleSet() {
  const [items, setItems] = useState<number[]>([])
  return {
    open: { has: (key: number) => items.includes(key) },
    toggle: (key: number) =>
      setItems((s) => (s.includes(key) ? s.filter((x) => x !== key) : [...s, key])),
  }
}
