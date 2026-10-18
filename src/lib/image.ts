// Validasi berkas gambar yang dipilih di klien. Dipakai foto toko (Setelan) dan
// gambar item menu — keduanya menerima `accept="image/*"`, tapi `accept` tidak
// menjamin apa pun: pengguna bisa memilih apa saja lewat "All files".
// Tidak ada unggahan sungguhan; ini guard sebelum pratinjau lokal dibuat
// (AGENTS.md §1).

/** Batas ukuran berkas gambar yang diterima. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

/** Pesan galat untuk berkas yang tidak lolos, atau `null` kalau valid. */
export function imageFileError(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Berkas harus berupa gambar'
  if (file.size > MAX_IMAGE_BYTES) return 'Ukuran gambar maksimal 2 MB'
  return null
}

/**
 * Perkecil gambar ke lebar maksimum lalu jadikan data URL JPEG. Dipakai banner
 * carousel yang ikut tersimpan di localStorage lewat redux-persist: berkas
 * 2 MB mentah bisa menghabiskan kuota setelah beberapa slide, jadi gambar
 * dikecilkan dulu (lebar 1200 px, kualitas 0.82).
 */
export function imageToDataUrl(
  file: File,
  maxWidth = 1200,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const width = Math.min(image.naturalWidth, maxWidth)
      const height = Math.round((image.naturalHeight * width) / image.naturalWidth)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Kanvas tidak tersedia'))
        return
      }
      context.drawImage(image, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Gambar tidak bisa dibaca'))
    }
    image.src = objectUrl
  })
}
