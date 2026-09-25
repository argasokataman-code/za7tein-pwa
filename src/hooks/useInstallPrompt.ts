import { useCallback, useEffect, useState } from 'react'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Logika "Pasang aplikasi" (PWA) di satu tempat: menangkap
 * `beforeinstallprompt`, berhenti menampilkan diri setelah `appinstalled`, dan
 * memanggil prompt-nya. Dipakai keempat peran lewat `InstallAppCard` dan oleh
 * layar onboarding — supaya tidak ada salinan logika yang harus dirawat berkali.
 *
 * `install()` mengembalikan `true` kalau prompt browser benar-benar dipanggil,
 * `false` kalau tidak ada prompt (mis. iOS Safari atau Firefox). Pemanggil yang
 * memutuskan instruksi manualnya, bukan hook ini.
 */
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  /**
   * Modalnya hanya layak muncul kalau peramban benar-benar menyediakan prompt.
   *
   * Sebelum ini `InstallPromptSheet` menyusun lapisan gelapnya lebih dulu, lalu
   * `InstallAppCard` mengembalikan `null` ketika promptnya belum ada. Di
   * peramban yang memang tidak pernah menembakkan `beforeinstallprompt`
   * (headless Chrome, Firefox, sebagian WebView) hasilnya lapisan gelap
   * `390x844` dengan `z-index: 1200` menutupi seluruh halaman sementara isinya
   * kosong. Terukur lewat hit-test: titik tengah badge diskon mendarat di
   * `.install-prompt`, bukan badge-nya — jadi seluruh beranda tak bisa diklik
   * dan tak terbaca, bukan cuma section promo.
   *
   * Dijaga di hook supaya lapisan gelap dan kartunya hilang bersama; menjaga di
   * kartunya saja tidak cukup karena lapisan gelapnya bukan milik kartu itu.
   *
   * Satu-satunya pengecualiannya iOS: di sana promptnya memang tidak pernah ada
   * (`beforeinstallprompt` tak didukung sama sekali), tapi langkah manualnya
   * justru yang mau ditampilkan.
   */
  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!promptEvent) return false
    await promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
    return true
  }, [promptEvent])

  // Sudah dibuka sebagai aplikasi terpasang → tak ada gunanya menawarkan pasang.
  // `standalone` saja tidak cukup: manifest peran memakai `display_override`
  // fullscreen, jadi app terinstal bisa melaporkan `fullscreen`. Tanpa daftar
  // mode ini kartu pasang ikut muncul di dalam aplikasi yang sudah terpasang.
  const installedMode =
    typeof window !== 'undefined' &&
    (['standalone', 'fullscreen', 'minimal-ui'].some((mode) =>
      window.matchMedia(`(display-mode: ${mode})`).matches,
    ) ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true)

  // iOS (Safari maupun peramban lain di iOS) tidak pernah menembakkan
  // `beforeinstallprompt`, jadi satu-satunya jalan pasang lewat menu Bagikan.
  // Dideteksi di sini supaya pemanggil menampilkan langkah manual, bukan tombol
  // yang diam saja.
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

  return {
    // Lapisan gelapnya bukan milik kartu, jadi `hidden` harus ikut mematikannya.
    hidden: installed || installedMode || (promptEvent === null && !isIOS),
    canPrompt: promptEvent !== null,
    isIOS,
    install,
  }
}
