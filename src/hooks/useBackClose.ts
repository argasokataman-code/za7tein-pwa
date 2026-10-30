import { useEffect, useId, useRef } from 'react'

/**
 * Satu-satunya cara overlay modal memakai tombol back platform (MD-13 `NB-02`).
 *
 * Selama overlay terbuka ia menaruh satu entri riwayat bertanda, sehingga back
 * Android / swipe iOS menutup overlay itu — bukan memindah halaman di bawahnya.
 * `onClose` disimpan di ref karena sering berupa arrow function baru tiap render:
 * kalau ia jadi dependency, tiap render menjalankan cleanup yang memanggil
 * `history.back()` dan entri overlay ikut terbuang.
 */
export function useBackClose(open: boolean, onClose: () => void) {
  const key = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  /* `history.back()` yang kita picu sendiri memunculkan `popstate`; di StrictMode
     effect berjalan dua kali sehingga listener baru bisa sempat menangkapnya.
     Penghitung ini membuat pop yang kita sebabkan sendiri diabaikan. */
  const suppressPop = useRef(0)

  useEffect(() => {
    if (!open) return
    // State router disalin (`...history.state`) supaya navigasi React Router tak
    // rusak oleh entri tambahan ini.
    if (history.state?.__overlay !== key) {
      history.pushState({ ...history.state, __overlay: key }, '')
      suppressPop.current = 0
    }
    const onPop = () => {
      if (suppressPop.current > 0) {
        suppressPop.current -= 1
        return
      }
      onCloseRef.current()
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      // Ditutup dari UI: entri kita masih di atas, buang.
      if (history.state?.__overlay === key) {
        suppressPop.current += 1
        history.back()
      }
    }
  }, [open, key])
}
