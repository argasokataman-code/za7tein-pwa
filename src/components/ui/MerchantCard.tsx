import type { CSSProperties } from 'react'
import { Clock, Star } from 'lucide-react'

import { formatRating } from '../../data/foods'
import { swapBrokenImage } from '../../data/storefronts'
import type { Storefront } from '../../types'

interface MerchantCardProps {
  store: Storefront
  onOpen: (store: Storefront) => void
  /** Baris promo singkat, mis. "Promo hemat 30%", dihitung dari menu berdiskon. */
  promoText?: string
  /**
   * Toko tampil tapi tak bisa dipilih (tutup / di luar coverage, PRD §6).
   * Kartu tetap terlihat dan bisa dibaca, tapi tidak membuka halaman toko.
   */
  disabled?: boolean
  /**
   * Sebab kenapa kartu tak bisa dibuka, bila pemanggil mau memberitahunya.
   * Bila diisi, kartu yang `disabled` tetap bisa difokus dan diketuk
   * (`aria-disabled`, bukan atribut `disabled`) supaya ketukan dijawab
   * penjelasan — ketukan mati tanpa jawaban adalah kontrol rusak.
   */
  onBlocked?: (store: Storefront) => void
  className?: string
  /** Variabel CSS tambahan, mis. `--stagger-index`. */
  style?: CSSProperties & Record<'--stagger-index', number>
}

/**
 * Ubin toko di beranda customer, dua kolom: foto 16:9 di kepala kartu (cukup
 * besar untuk mengenali makanannya), lalu nama (maks 2 baris) dan satu baris
 * fakta rating • jarak • waktu antar. Info tetap permukaan kartu, bukan teks di
 * atas foto: teks menimpa foto membuat daftar toko terasa galeri gambar.
 * Promo jadi chip kecil di pojok foto supaya tinggi kartu tetap seragam.
 * Seluruh ubin satu tombol.
 */
export function MerchantCard({
  store,
  onOpen,
  promoText,
  disabled = false,
  onBlocked,
  className = '',
  style,
}: MerchantCardProps) {
  const status = !store.isOpen ? 'Tutup' : store.outOfCoverage ? 'Di luar jangkauan' : 'Buka'
  const reason = !store.isOpen
    ? 'sedang tutup'
    : store.outOfCoverage
      ? 'di luar jangkauan'
      : 'buka'
  // Ketukan dijawab hanya kalau pemanggil punya penjelasan; kalau tidak, tombol
  // benar-benar mati seperti sebelumnya.
  const canExplain = disabled && Boolean(onBlocked)

  return (
    <button
      type="button"
      className={`merchant-store-card ${className}${disabled ? ' merchant-store-card--disabled' : ''}${store.isOpen ? '' : ' merchant-store-card--closed'}`.trim()}
      style={style}
      disabled={disabled && !canExplain}
      aria-disabled={disabled || undefined}
      aria-label={`Buka ${store.name}, ${reason}`}
      onClick={() => {
        if (!disabled) onOpen(store)
        else onBlocked?.(store)
      }}
    >
      <span className="merchant-card__media">
        <img
          alt=""
          loading="lazy"
          decoding="async"
          width={378}
          height={213}
          src={store.cover}
          onError={swapBrokenImage}
        />
        {promoText ? <span className="merchant-card__promo">{promoText}</span> : null}
        {store.deliveryTime ? (
          <span className="merchant-card__eta">
            <Clock size={12} aria-hidden="true" />
            {store.deliveryTime}
          </span>
        ) : null}
        {/* "Buka" tidak dilabeli: ubin yang bisa diketuk memang sudah berarti buka. */}
        {status === 'Buka' ? null : (
          <span className="merchant-card__status">
            <span className="merchant-card__dot" aria-hidden="true" />
            {status}
          </span>
        )}
      </span>

      <span className="merchant-card__body">
        <span className="merchant-card__name">{store.name}</span>

        <span className="merchant-card__facts">
          <span className="merchant-card__rating">
            <Star size={12} fill="currentColor" aria-hidden="true" />
            {formatRating(store.rating)}
          </span>
          {store.distance ? (
            <>
              <span className="merchant-card__sep" aria-hidden="true">
                •
              </span>
              <span>{store.distance}</span>
            </>
          ) : null}
        </span>
      </span>
    </button>
  )
}
