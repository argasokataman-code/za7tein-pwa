import type { ReactNode } from 'react'

import { BottomSheet } from './BottomSheet'

interface ConfirmSheetProps {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  /** Kelas tombol konfirmasi; panel CS memakai `admin-btn-ghost` untuk aksi destruktif. */
  confirmClass?: string
  /**
   * Nonaktifkan tombol konfirmasi sampai syarat validasi terpenuhi (mis. catatan
   * putusan jalur uang belum diisi). Default aktif.
   */
  confirmDisabled?: boolean
  /** Field yang divalidasi, diletakkan di antara body dan tombol. Opsional. */
  children?: ReactNode
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
  confirmDisabled = false,
  children,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      <p className="sheet-copy">{body}</p>
      {children}
      <div className="sheet-actions">
        <button type="button" className="btn sheet-cancel" onClick={onClose}>
          Batal
        </button>
        <button
          type="button"
          className={`btn ${confirmClass}`}
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </button>
      </div>
    </BottomSheet>
  )
}
