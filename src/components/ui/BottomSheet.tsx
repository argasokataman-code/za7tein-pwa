import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { useBackClose } from '../../hooks/useBackClose'

interface BottomSheetProps {
  open: boolean
  title?: string
  /** Dipakai untuk `aria-label` saat panel membawa header sendiri (`title` kosong). */
  ariaLabel?: string
  onClose: () => void
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function BottomSheet({ open, title, ariaLabel, onClose, children }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  /* Back platform menutup sheet, bukan memindahkan halaman (MD-13 `NB-02`).
     Logika riwayat tinggal di satu hook yang dipakai semua overlay modal. */
  useBackClose(open, onClose)
  /* `onClose` sering berupa arrow function baru tiap render. Simpan di ref
     supaya listener Escape tidak dipasang ulang tiap render. */
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    // Fokus ke panel (bukan field pertama) supaya keyboard lunak tidak langsung
    // terbuka saat sheet dibuka; Tab tetap terkurung di dalam dialog (audit 013 #7).
    panelRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  /* Trap fokus: Tab dari elemen terakhir kembali ke yang pertama (audit 013 #7). */
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return
    const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null,
    )
    if (nodes.length === 0) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const active = document.activeElement
    if (active === panel || active === document.body) {
      if (e.shiftKey) {
        e.preventDefault()
        last.focus()
      }
      return
    }
    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // Portal ke `document.body`, sama seperti `BottomNav`. Wadah transisi halaman
  // (`page-enter-*`) menjalankan `animation: page-fade` dengan `fill: both`, dan
  // animasi yang masih berjalan/mengisi membuatnya jadi stacking context —
  // sehingga `z-index: 1002` pada overlay ini terkurung di bawah bilah nav
  // (z 1000) yang di-portal ke body. Terukur: tombol sheet "Hapus kurir" jatuh
  // di y 795-839, tepat di area nav 782-859, dan `elementsFromPoint` di titik
  // tengahnya mengembalikan `nav-item`, bukan tombolnya. Portal mengeluarkan
  // sheet dari pohon yang dianimasikan, jadi modal benar-benar berada di atas
  // nav (dan nav ikut diredupkan scrim). Context React tetap lewat portal.
  return createPortal(
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className="sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? <h3 className="sheet-title">{title}</h3> : null}
        {children}
      </div>
    </div>,
    document.body,
  )
}
