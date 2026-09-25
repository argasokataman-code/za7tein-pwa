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
