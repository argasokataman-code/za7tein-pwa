import { useState } from 'react'

import { BottomSheet } from '../ui/BottomSheet'

interface EvidencePhotosProps {
  /** URL foto (aset mock di `public/assets/`). Kosong = tampilkan `emptyLabel`. */
  photos: string[]
  /** Teks saat tak ada foto, mis. "Tanpa foto bukti". */
  emptyLabel: string
  /** Awalan label, mis. "Foto bukti" -> "Foto bukti 1". */
  label: string
}

/**
 * Bukti foto untuk konsol CS: petak thumbnail yang bisa dibuka menjadi pratinjau
 * penuh. Sebelumnya konsol hanya menampilkan jumlah foto sebagai angka, jadi CS
 * memutuskan sengketa tanpa pernah melihat buktinya (audit 017 F-02).
 *
 * Viewer memakai `BottomSheet` yang sudah ada (satu-satunya modal repo) supaya
 * tak lahir dialog kedua; di desktop modal itu ditengahkan oleh aturan
 * `body:has(.sa-root)` milik konsol ops/Super Admin.
 */
export function EvidencePhotos({ photos, emptyLabel, label }: EvidencePhotosProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (photos.length === 0) {
    return <p className="admin-detail-inline">{emptyLabel}</p>
  }

  const current = openIndex === null ? null : photos[openIndex]

  return (
    <>
      <div className="evidence-photos">
        {photos.map((src, index) => (
          <button
            key={src}
            type="button"
            className="evidence-photo"
            aria-label={`${label} ${index + 1} dari ${photos.length}`}
            onClick={() => setOpenIndex(index)}
          >
            <img src={src} alt="" width={72} height={72} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>

      <BottomSheet
        open={openIndex !== null}
        title={current ? `${label} ${(openIndex ?? 0) + 1} dari ${photos.length}` : label}
        onClose={() => setOpenIndex(null)}
      >
        {current ? (
          <img
            className="evidence-photo-full"
            src={current}
            alt={`${label} ${(openIndex ?? 0) + 1}`}
          />
        ) : null}
      </BottomSheet>
    </>
  )
}
