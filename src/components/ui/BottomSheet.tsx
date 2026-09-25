import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

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
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="sheet-handle" />
        {title ? <h3 className="sheet-title">{title}</h3> : null}
        {children}
      </div>
    </div>,
    document.body,
  )
}
