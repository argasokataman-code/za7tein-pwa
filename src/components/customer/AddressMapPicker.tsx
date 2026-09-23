import { useLeafletMap } from '../../hooks/useLeafletMap'

interface AddressMapPickerProps {
  lat: number
  lng: number
  onMove: (lat: number, lng: number) => void
}

/**
 * Peta pemilih titik alamat (flow f20): pin digeser untuk menetapkan
 * koordinat, lalu coverage dihitung ulang dari poligon zona master.
 *
 * Dipisah dari AddressSelection supaya peta hanya dipasang saat form terbuka —
 * `useLeafletMap` menginisialisasi sekali saat mount, jadi div-nya harus ada
 * sejak render pertama komponen ini.
 */
export function AddressMapPicker({ lat, lng, onMove }: AddressMapPickerProps) {
  useLeafletMap('address-map', 'picker', {
    picker: { initial: [lat, lng], onMove, popup: 'Titik alamat — geser untuk menyesuaikan' },
  })
  return <div id="address-map" className="address-map" role="application" aria-label="Peta titik alamat" />
}
