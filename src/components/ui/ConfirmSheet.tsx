import { BottomSheet } from './BottomSheet'

interface ConfirmSheetProps {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  /** Kelas tombol konfirmasi; panel CS memakai `admin-btn-ghost` untuk aksi destruktif. */
  confirmClass?: string
  onConfirm: () => void
  onClose: () => void
}

/**
 * Konfirmasi dua langkah untuk aksi jalur uang: ketuk pertama membuka sheet,
 * ketuk kedua mengeksekusi (audit 006 #4, HG-13). Dipakai putusan sengketa
 * (tulis entry ledger), blacklist COD, dan batal order (refund). Memakai
 * BottomSheet + pola `.sheet-actions` yang sudah ada, bukan modal baru.
 */
export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel,
  confirmClass = 'btn-primary',
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      <p className="sheet-copy">{body}</p>
      <div className="sheet-actions">
        <button type="button" className="btn sheet-cancel" onClick={onClose}>
          Batal
        </button>
        <button type="button" className={`btn ${confirmClass}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </BottomSheet>
  )
}
