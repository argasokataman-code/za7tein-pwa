import { useEffect, useId, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

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
  const sheetKey = useId()
  /* `history.back()` yang kita picu sendiri memunculkan `popstate`; di dev
     StrictMode effect berjalan dua kali sehingga listener baru bisa sempat
     menangkapnya. Penghitung ini membuat pop yang kita sebabkan sendiri
     diabaikan, bukan menutup sheet. */
  const suppressPop = useRef(0)

  useEffect(() => {
    if (!open) return
    const key = sheetKey
    // Sheet = modal: beri satu entri history supaya tombol back platform
    // (Android system back / iOS swipe-back) menutup sheet, bukan memindahkan
    // halaman (audit 013 #1). State router disalin supaya navigasi tak rusak.
    if (history.state?.__sheet !== key) {
      history.pushState({ ...history.state, __sheet: key }, '')
      suppressPop.current = 0
    }
    const onPop = () => {
      if (suppressPop.current > 0) {
        suppressPop.current -= 1
        return
      }
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('popstate', onPop)
    document.addEventListener('keydown', onKey)
    // Fokus ke panel (bukan field pertama) supaya keyboard lunak tidak langsung
    // terbuka saat sheet dibuka; Tab tetap terkurung di dalam dialog (audit 013 #7).
    panelRef.current?.focus()
    return () => {
      window.removeEventListener('popstate', onPop)
      document.removeEventListener('keydown', onKey)
      // Ditutup dari UI (backdrop/Batal/Escape): entri kita masih di atas, buang.
      if (history.state?.__sheet === key) {
        suppressPop.current += 1
        history.back()
      }
    }
  }, [open, onClose, sheetKey])

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
