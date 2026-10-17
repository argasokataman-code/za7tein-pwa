import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Kelas animasi masuk untuk halaman, dan reset gulir ke atas.
 *
 * Dua tugas, satu tempat:
 *
 * 1. **Arah.** Material menyebutnya pola "forward and backward": maju dan
 *    mundur harus terbaca berbeda. `useNavigationType()` memberi tahu apakah
 *    kedatangan ini hasil `PUSH` (maju) atau `POP` (kembali lewat tombol
 *    kembali / riwayat), jadi arahnya bisa dibaca dari perilaku, bukan ditebak
 *    dari kedalaman URL. Halaman masuk dari kanan saat maju, dari kiri saat
 *    mundur.
 *
 * 2. **Posisi gulir.** React Router tidak mereset gulir sama sekali (tidak ada
 *    `ScrollToTop` di repo ini), jadi halaman baru mewarisi posisi gulir
 *    halaman sebelumnya. Diukur: tanpa ini, membuka halaman dari daftar yang
 *    sudah digulir membuat halaman baru terbuka di tengah dan pengguna harus
 *    menggulir ke atas sendiri.
 *
 * Dipakai sekali di `RoleRouter`, bukan di tiap halaman — halaman yang tidak
 * memanggilnya tidak ikut berubah, dan satu perbaikan berlaku untuk semua.
 *
 * `prefers-reduced-motion` tidak diperiksa di sini: CSS yang memutuskan
 * (lihat `system/_interaction.scss`), supaya keputusannya tetap di satu tempat
 * dan tidak ada halaman yang lupa memeriksanya.
 */
export function usePageTransition() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const isBack = navigationType === 'POP'

  // Pemulihan gulir milik browser dimatikan. Tanpa ini, **memuat ulang** sebuah
  // halaman yang sudah digulir (F5, atau gerbang menavigasi ulang) membuka
  // halaman tepat di tengah: aturan "gulir selalu mulai dari atas" bocor lewat
  // restore bawaan peramban, dan `useEffect` di bawah tak menangkapnya karena
  // pathname-nya tidak berubah. Posisi "kembali" dipulihkan sendiri lewat peta
  // di bawah, jadi perilakunya tidak hilang.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  // Posisi gulir tiap rute dicatat, supaya tombol kembali tetap mendarat di
  // tempat semula meski peramban tidak lagi memulihkannya sendiri.
  const positions = useRef(new Map())
  useEffect(() => {
    const save = () => positions.current.set(pathname, window.scrollY)
    save()
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [pathname])

  // Gulir direset saat pathname berubah, TAPI tidak saat kembali: pengguna
  // yang menekan tombol kembali mengharapkan posisi gulir halaman sebelumnya
  // utuh. Ini yang membedakan "pindah halaman" dari "kembali".
  const previousPath = useRef(pathname)
  useEffect(() => {
    if (previousPath.current === pathname) return
    const sameDirection = isBack
    previousPath.current = pathname
    if (sameDirection) {
      window.scrollTo(0, positions.current.get(pathname) ?? 0)
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, isBack])

  // `key` dipakai pemanggil supaya React memasang ulang wadah halaman saat
  // rute berubah — tanpa itu animasinya tidak jalan, karena elemen yang sama
  // hanya menerima kelas baru.
  const className = isBack ? 'page-enter-backward' : 'page-enter-forward'

  return { className, isBack, key: pathname }
}

