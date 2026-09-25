import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Tarik-untuk-menyegarkan, seperti app native.
 *
 * Keputusan 2026-09-24 mematikan `overscroll-behavior-y` di dokumen karena
 * pantulan bawaan peramban membuat app terinstal terasa seperti tab. Konsekuensinya
 * pull-to-refresh bawaan ikut mati — dan memang tidak diinginkan, sebab
 * `location.reload()` memuat ulang seluruh aplikasi. Yang dibangun di sini
 * adalah versi native-nya: tarik ke bawah, indikator muncul, lalu selesai.
 *
 * Lingkupnya sengaja gestur + indikator saja: repo ini tidak punya backend, jadi
 * "memuat ulang data" tidak bisa mengambil apa pun. Tidak ada state yang diubah
 * — menambahnya berarti mengosongkan katalog/dompet yang sudah diisi dari layar
 * merchant dan admin, dan itu merusak demo, bukan menyegarkannya.
 *
 * Ini keputusan UX, bukan requirement: PRD aktif (`irbid-mvp-v2-2026-09-21`)
 * tidak menyebut pull-to-refresh sama sekali (`UNRESOLVED-by-absence`).
 *
 * Kenapa membaca `touchmove` sendiri, bukan mengandalkan overscroll native:
 * `overscroll-behavior-y: none` di `html` memblokir rantai overscroll, jadi
 * tidak ada peristiwa bawaan yang bisa ditangkap. Gestur dibaca dari sentuhan
 * mentah.
 *
 * Dua penjaga supaya tidak bertabrakan dengan halaman:
 *
 * 1. Hanya aktif saat dokumen benar-benar di puncak (`scrollY <= 0`). Kalau
 *    halaman sedang digulir, tarikan diteruskan ke dokumen seperti biasa.
 * 2. Tarikan di bawah ambang mengembalikan `--ptr-pull` ke 0, jadi indikator
 *    tidak pernah tertinggal di layar.
 *
 * Gerakan yang dipakai cuma satu properti `--ptr-pull` (translate + opacity di
 * CSS), jadi tidak ada `transform` yang bisa merusak `position: fixed` —
 * pelajaran yang sama dengan parallax.
 */

/** Tarikan minimum sebelum dilepas dianggap permintaan menyegarkan. */
const TRIGGER_PX = 64

/**
 * Tarikan di atas ini tidak lagi menambah jarak; jari tetap bisa turun tanpa
 * membuat indikator meluncur keluar layar.
 */
const MAX_PULL_PX = 96

/** Lama indikator berputar setelah dilepas. Mock, jadi tidak ada jaringan nyata. */
const REFRESH_MS = 700

export function usePullToRefresh() {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const timer = useRef<number | null>(null)

  // Cermin `pull` untuk dibaca di dalam listener. `onTouchEnd` butuh nilai
  // tarikan terakhir, tapi tidak boleh membacanya lewat updater `setPull`:
  // StrictMode memutar ulang updater untuk memastikan ia murni, dan
  // `setRefreshing`/`setTimeout` di dalamnya adalah efek samping yang terbuang
  // saat replay — terukur: indikator tertinggal berputar selamanya karena
  // `finish` tak pernah dijadwalkan. Ref tidak ikut diputar ulang.
  const pullRef = useRef(0)

  // Cermin `refreshing` untuk alasan yang sama, plus satu lagi: kalau
  // `refreshing` ikut jadi dependensi efek, `setRefreshing(true)` di
  // `onTouchEnd` memasang ulang listener — dan cleanup-nya `clearTimeout`
  // tepat setelah timer dijadwalkan. Terukur: indikator berputar tanpa henti.
  // Dibaca dari ref, efeknya dipasang sekali dan timer tidak pernah dibunuh.
  const refreshingRef = useRef(false)

  const setPullValue = useCallback((value: number) => {
    pullRef.current = value
    setPull(value)
  }, [])

  const finish = useCallback(() => {
    timer.current = null
    refreshingRef.current = false
    setRefreshing(false)
    setPullValue(0)
  }, [setPullValue])

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      // Hanya mulai menghitung saat dokumen di puncak. Menyentuh di tengah
      // halaman yang sudah digulir bukan gestur menyegarkan.
      if (refreshingRef.current || window.scrollY > 0) return
      if (event.touches.length !== 1) return
      startY.current = event.touches[0].clientY
    }

    const onTouchMove = (event: TouchEvent) => {
      if (startY.current === null || refreshingRef.current) return
      const delta = event.touches[0].clientY - startY.current

      // Menarik ke atas, atau halaman sudah tidak di puncak: batalkan hitungan
      // dan kembalikan indikator, jangan menahan guliran.
      if (delta <= 0 || window.scrollY > 0) {
        startY.current = null
        setPullValue(0)
        return
      }

      // Hambatan 0.5: tarikan 128px menghasilkan 64px, jadi ambang tercapai
      // tanpa jari harus menempuh jarak yang tidak nyaman.
      setPullValue(Math.min(delta * 0.5, MAX_PULL_PX))
    }

    const onTouchEnd = () => {
      if (startY.current === null) return
      startY.current = null

      // Di bawah ambang: tarikan dibatalkan tanpa indikator berputar.
      if (pullRef.current < TRIGGER_PX) {
        setPullValue(0)
        return
      }

      setRefreshing(true)
      refreshingRef.current = true
      setPullValue(MAX_PULL_PX)
      timer.current = window.setTimeout(finish, REFRESH_MS)
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [finish, setPullValue])

  return { pull, refreshing }
}
