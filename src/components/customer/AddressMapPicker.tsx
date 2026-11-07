import { useEffect } from 'react'

import { useLeafletMap } from '../../hooks/useLeafletMap'

interface AddressMapPickerProps {
  lat: number
  lng: number
  onMove: (lat: number, lng: number) => void
  /**
   * Titik dari GPS yang harus dipusatkan peta. Dibanding `lat`/`lng` yang ikut
   * berubah saat pin digeser, prop ini hanya berganti saat tombol lokasi ditekan,
   * jadi peta tidak ikut pan setiap kali jari menggeser pin.
   */
  focus?: { lat: number; lng: number } | null
}

/**
 * Peta pemilih titik alamat (flow f20): pin digeser untuk menetapkan
 * koordinat, lalu coverage dihitung ulang dari poligon zona master.
 *
 * Dipisah dari AddressSelection supaya peta hanya dipasang saat form terbuka —
 * `useLeafletMap` menginisialisasi sekali saat mount, jadi div-nya harus ada
 * sejak render pertama komponen ini.
 */
export function AddressMapPicker({ lat, lng, onMove, focus = null }: AddressMapPickerProps) {
  const { setPosition } = useLeafletMap('address-map', 'picker', {
    picker: { initial: [lat, lng], onMove, popup: 'Titik alamat — geser untuk menyesuaikan' },
  })

  useEffect(() => {
    if (!focus) return
    setPosition(focus.lat, focus.lng)
    // `focus` sengaja jadi satu-satunya pemicu: perubahan `lat`/`lng` dari
    // geseran pin tidak boleh memanggil ulang setPosition (bisa memantul).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus])

  return <div id="address-map" className="address-map" role="application" aria-label="Peta titik alamat" />
}
