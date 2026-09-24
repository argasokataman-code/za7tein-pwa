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
  const standalone =
    typeof window !== 'undefined' &&
    window.matchMedia('(display-mode: standalone)').matches

  return {
    hidden: installed || standalone,
    canPrompt: promptEvent !== null,
    install,
  }
}
