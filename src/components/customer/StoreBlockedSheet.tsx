import { BottomSheet } from '../ui/BottomSheet'
import type { Storefront } from '../../types'

/**
 * Sebab sebuah toko tak bisa dibuka (tutup / di luar jangkauan), dijawab dari
 * satu tempat. Daftar toko tampil di dua halaman (beranda dan hasil pencarian),
 * jadi kalimatnya tidak boleh bercabang sendiri di tiap halaman.
 */
export function StoreBlockedSheet({
  store,
  onClose,
}: {
  store: Storefront | null
  onClose: () => void
}) {
  return (
    <BottomSheet
      open={store !== null}
      title={store?.isOpen ? 'Toko di luar jangkauan' : 'Maaf, toko sedang tutup'}
      onClose={onClose}
    >
      <p className="sheet-copy">
        {store?.isOpen
          ? `${store.name} belum bisa mengantar ke alamat kamu — tokonya di luar jangkauan.`
          : `${store?.name} belum menerima pesanan sekarang. Buka lagi${store?.openTime ? ` jam ${store.openTime}–${store.closeTime}` : ''}.`}
      </p>
      <div className="sheet-actions">
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Mengerti
        </button>
      </div>
    </BottomSheet>
  )
}
