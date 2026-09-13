import { Bike, ChefHat, Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { HomeIndicator } from '../components/layout/HomeIndicator'

const SLIDES = [
  {
    id: 'near',
    kind: 'photo',
    title: 'Makanan sekitar, selagi hangat',
    text: 'Pesan dari dapur di sekitarmu dan ikuti perjalanannya sampai tiba.',
  },
  {
    id: 'kitchen',
    kind: 'soft',
    title: 'Antrean dapur terlihat',
    text: 'Estimasi masak 15, 25, atau 35 menit, jelas sejak checkout.',
  },
  {
    id: 'deliver',
    kind: 'mint',
    title: 'Diantar satu perjalanan',
    text: 'Kurir menjemput beberapa pesanan sekaligus dengan rute terkunci.',
  },
] as const

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [showInstall, setShowInstall] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const onInstalled = () => setShowInstall(false)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const installApp = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      setInstallPrompt(null)
      if (choice.outcome === 'accepted') setShowInstall(false)
      return
    }
    toast('Buka menu Bagikan di browser, lalu pilih Tambahkan ke Layar Utama.')
  }

  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1

  const goNext = () => {
    if (isLast) navigate('/signin')
    else setIndex((current) => current + 1)
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-media">
        {slide.kind === 'photo' ? (
          <div className="onboarding-photo" aria-hidden="true" />
        ) : (
          <div className={`onboarding-art is-${slide.kind}`} aria-hidden="true">
            {slide.kind === 'soft' ? (
              <ChefHat size={68} strokeWidth={1.75} />
            ) : (
              <Bike size={68} strokeWidth={1.75} />
            )}
          </div>
        )}

        {showInstall && !window.matchMedia('(display-mode: standalone)').matches && (
          <aside className="onboarding-install" aria-label="Saran pasang aplikasi">
            <Download size={16} strokeWidth={1.75} aria-hidden="true" />
            <p>Pasang aplikasi untuk pengalaman lebih cepat</p>
            <button
              type="button"
              className="onboarding-install-btn"
              onClick={installApp}
            >
              Pasang
            </button>
            <button
              type="button"
              className="onboarding-install-close"
              aria-label="Tutup saran pasang"
              onClick={() => setShowInstall(false)}
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </aside>
        )}
      </div>

      <div className="onboarding-sheet">
        <div className="onboarding-sheet-top">
          <div className="onboarding-dots" role="group" aria-label="Langkah pengenalan">
            {SLIDES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-current={i === index ? 'step' : undefined}
                aria-label={`Langkah ${i + 1}`}
                className={`onboarding-dot${i === index ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
          <button type="button" className="onboarding-skip" onClick={() => navigate('/signin')}>
            Lewati
          </button>
        </div>

        <h1 className="onboarding-heading">{slide.title}</h1>
        <p className="onboarding-body">{slide.text}</p>

        <button type="button" className="onboarding-cta" onClick={goNext}>
          {isLast ? 'Mulai' : 'Lanjut'}
        </button>
      </div>

      <HomeIndicator />
    </div>
  )
}
