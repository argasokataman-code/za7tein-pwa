/**
 * Aturan pelacakan kurir (PRD aktif `sa7tein-mvp-2026-10-11` §9.7, COU-06, L1).
 * Fungsi murni: layar hanya menyalurkan waktu dan geometri, keputusan aturannya di
 * sini supaya bisa diuji tanpa browser.
 */

/**
 * Ambang notifikasi "kurir hampir sampai" **berbasis waktu** (§9.7), bukan jarak.
 * Nilainya di-setup **aplikator lewat aplikasi internal** (ops); panel ops baru
 * dibangun di M10, jadi angka di sini adalah nilai demo yang ditandai — bukan
 * keputusan yang dipalsukan sebagai final.
 */
export const ALMOST_ARRIVED_MINUTES = 5

/** Ambang bisa diubah dari UI? Belum: panel ops (M10) belum ada. */
export const ALMOST_ARRIVED_CONFIGURABLE = false

/**
 * Lokasi kurir hanya disiarkan "selama delivery aktif" (§9.7). Pengantaran
 * dimulai saat kurir berangkat (`diantar`) sampai order diserahkan (`tiba`);
 * setelah `selesai` tidak ada siaran lagi.
 */
export function tracksLocation(stage: string): boolean {
  return stage === 'diantar' || stage === 'tiba'
}

/** Sudah masuk ambang hampir sampai? `null` = ETA belum diketahui. */
export function almostArrived(etaMinutes: number | null): boolean {
  return etaMinutes !== null && etaMinutes <= ALMOST_ARRIVED_MINUTES
}

/**
 * Kemajuan perjalanan 0..1 dari waktu tempuh. Dipakai menggantikan event
 * `courier_location` di demo (BE yang menyiarkannya, §19).
 */
export function travelProgress(elapsedMinutes: number, totalMinutes: number): number {
  if (totalMinutes <= 0) return 1
  return Math.min(1, Math.max(0, elapsedMinutes / totalMinutes))
}

/** Sisa menit, dibulatkan **ke atas** supaya "1 menit lagi" tidak jadi "0". */
export function etaMinutesRemaining(totalMinutes: number, progress: number): number {
  return Math.max(0, Math.ceil(totalMinutes * (1 - Math.min(1, Math.max(0, progress)))))
}

/**
 * Posisi kurir di sepanjang rute pada kemajuan `progress`. Titik-titik rute
 * dianggap berjarak sama (cukup untuk mock; jarak sebenarnya milik Routes API dan
 * **tidak boleh** disimpan untuk dipakai ulang, §9.7 + R4).
 */
export function positionAlong(
  path: [number, number][],
  progress: number,
): [number, number] | null {
  if (path.length === 0) return null
  if (path.length === 1) return path[0]
  const t = Math.min(1, Math.max(0, progress))
  const span = (path.length - 1) * t
  const index = Math.min(path.length - 2, Math.floor(span))
  const fraction = span - index
  const from = path[index]
  const to = path[index + 1]
  return [from[0] + (to[0] - from[0]) * fraction, from[1] + (to[1] - from[1]) * fraction]
}

/**
 * Menit jalan kaki dari jarak (rute WALK masih beta, §9.7). Dipakai untuk ETA
 * perjalanan; angka kecepatannya konservatif supaya estimasi tidak terlalu optimis.
 */
export function walkMinutes(meters: number, speedMps = 1.4): number {
  if (meters <= 0) return 0
  return Math.max(1, Math.round(meters / speedMps / 60))
}

/**
 * Kalimat ETA di layar customer. Saat sudah masuk ambang, catatan sumbernya ikut
 * supaya angkanya tidak terbaca sebagai keputusan produk (§9.7: ambang = ops).
 */
export function etaCopy(etaMinutes: number, dekat: boolean): string {
  const ambang =
    `ambang ${ALMOST_ARRIVED_MINUTES} menit dari konfigurasi ops` +
    (ALMOST_ARRIVED_CONFIGURABLE ? '' : ', panel ops belum ada')
  return `Tiba sekitar ${etaMinutes} menit lagi${dekat ? ` (${ambang})` : ''}`
}

