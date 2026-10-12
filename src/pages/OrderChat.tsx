// Chat dengan kurir. Sebelumnya tombol "Chat" di halaman pelacakan hanya
// memunculkan toast "Membuka chat dengan kurir" lalu tidak terjadi apa-apa,
// dan tidak ada rutenya sama sekali. Layar ini yang menggantikannya.
//
// Saat ada order aktif (customer checkout), percakapan dibaca/ditulis ke
// PostgREST lewat `useApiChat` (tabel `chats` + `chat_messages`). Tanpa order
// aktif — atau bila API mati — layar jatuh ke percakapan mock lama, jadi tak
// pernah kosong saat demo.
import { MessageCircle, Send } from 'lucide-react'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { mockCouriers, mockOrder } from '../data/merchant'
import { waLink } from '../data/phone'
import { useApiChat } from '../hooks/useApiChat'
import { useAppSelector } from '../hooks/useAppStore'
import { BackButton } from '../components/ui/BackButton'

type Pesan = {
  id: number
  dari: 'kurir' | 'aku'
  teks: string
  jam: string
}

const jam = (offsetMenit = 0) => {
  const d = new Date(Date.now() + offsetMenit * 60_000)
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`
}

/** `HH.MM` dari stempel ISO backend. */
const jamIso = (iso: string) => {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`
}

/** Percakapan pembuka: kurir sudah mengabari lebih dulu, seperti di aplikasi asli. */
const AWAL: Pesan[] = [
  { id: 1, dari: 'kurir', teks: `Halo, pesanan ${mockOrder.code} sudah saya ambil dari toko.`, jam: jam(-6) },
  { id: 2, dari: 'kurir', teks: 'Saya menuju ke Green View Apartment ya.', jam: jam(-5) },
  { id: 3, dari: 'aku', teks: 'Baik, ditunggu. Titip ke resepsionis kalau saya belum turun.', jam: jam(-4) },
  { id: 4, dari: 'kurir', teks: 'Siap, saya kabari lagi kalau sudah dekat.', jam: jam(-3) },
]

const SARAN = [
  'Di mana sekarang?',
  'Tolong titip ke satpam',
  'Sudah dekat?',
  'Tolong jangan pakai sambal',
]

/** Balasan bergilir supaya mengirim pesan terasa ada yang menjawab (mode mock). */
const BALASAN = [
  'Siap, saya catat ya.',
  'Baik, sebentar lagi sampai.',
  'Sudah masuk gerbang, tinggal cari tower A.',
  'Terima kasih, ditunggu ya.',
]

/** `users.id` pengirim customer di backend (demo) — pembanding sisi "aku". */
const CUSTOMER_USER_ID = 1

export default function OrderChat() {
  const courier = mockCouriers[0]
  // Order bisa datang dari order aktif (checkout customer) atau deep-link
  // `?order=<id>` — rute chat tak punya segmen `:id`, dan kurir/merchant tak
  // menyetel `cart.activeOrder`, jadi tanpa order mereka tetap pakai mock.
  const [params] = useSearchParams()
  const activeOrder = useAppSelector((s) => s.cart.activeOrder)
  const queryOrder = params.get('order')
  const orderId = queryOrder
    ? Number(queryOrder)
    : activeOrder
      ? Number(activeOrder.id)
      : null
  const live = useApiChat(orderId)

  const [pesan, setPesan] = useState<Pesan[]>(AWAL)
  const [draf, setDraf] = useState('')
  const [menulis, setMenulis] = useState(false)
  /**
   * Lawan (kurir) offline → balasan otomatis berhenti dan tombol fallback WA
   * muncul (M8). Demo mock saja: chat live tak punya soket presence.
   */
  const [offline, setOffline] = useState(false)
  const nomorBalasan = useRef(0)
  const ujungDaftar = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.body.className = 'sa7tein-track-page'
    return () => {
      document.body.className = ''
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  /** Pesan live dari backend dipetakan ke bentuk UI; pengirim 1 = customer (aku). */
  const pesanLive: Pesan[] = live.lines.map((line) => ({
    id: Number(line.id.replace('cm-', '')) || 0,
    dari: line.senderId === CUSTOMER_USER_ID ? 'aku' : 'kurir',
    teks: line.body,
    jam: jamIso(line.at),
  }))
  const daftar = live.live ? pesanLive : pesan

  // Selalu tampilkan pesan terbaru.
  useEffect(() => {
    ujungDaftar.current?.scrollIntoView({ block: 'end' })
  }, [daftar, menulis])

  const kirim = (teks: string) => {
    const isi = teks.trim()
    if (!isi) return

    // Live: tulis ke BE; polling 5 dtk + fetch pasca-kirim yang menampilkannya.
    if (live.live) {
      setDraf('')
      void live.send(isi)
      return
    }

    setPesan((lama) => [
      ...lama,
      { id: Date.now(), dari: 'aku', teks: isi, jam: jam() },
    ])
    setDraf('')
    // Lawan offline: pesan tetap tampil, tapi tidak ada balasan otomatis yang
    // berpura-pura kurirnya masih membaca (M8).
    if (offline) return
    setMenulis(true)

    timer.current = setTimeout(() => {
      const balasan = BALASAN[nomorBalasan.current % BALASAN.length]
      nomorBalasan.current += 1
      setMenulis(false)
      setPesan((lama) => [
        ...lama,
        { id: Date.now(), dari: 'kurir', teks: balasan, jam: jam() },
      ])
    }, 1200)
  }

  return (
    <div className="app-shell">
      <main>
        <div className="chat-screen">
          <header className="chat-header">
            <BackButton className="btn-back" />

            <div className="chat-header__who">
              <span className="chat-header__name">{live.live ? 'Kurir' : courier.name}</span>
              <span className="chat-header__status">
                {!live.live && offline
                  ? 'Kurir sedang offline'
                  : menulis
                    ? 'sedang menulis…'
                    : 'Kurir · pesanan ' + (live.live ? (activeOrder?.code ?? `#${orderId}`) : mockOrder.code)}
              </span>
            </div>

            <span className="chat-header__spacer" aria-hidden="true" />
          </header>

          <div className="chat-thread" role="log" aria-live="polite" aria-label="Percakapan dengan kurir">
            {daftar.map((p) => (
              <div key={p.id} className={`chat-bubble chat-bubble--${p.dari}`}>
                <p className="chat-bubble__text">{p.teks}</p>
                <span className="chat-bubble__jam">{p.jam}</span>
              </div>
            ))}

            {menulis ? (
              <div className="chat-bubble chat-bubble--kurir chat-typing">
                <span className="chat-typing__dot" />
                <span className="chat-typing__dot" />
                <span className="chat-typing__dot" />
              </div>
            ) : null}

            <div ref={ujungDaftar} />
          </div>

          {/* Fallback WA (M8): tampil hanya saat lawan offline, dengan deep link
              wa.me berisi nomor E.164 + teks order supaya konteksnya ikut. */}
          {!live.live && offline ? (
            <div className="chat-fallback" role="status">
              <p className="chat-fallback__text">
                Kurir offline — balasan otomatis dimatikan. Lanjut lewat WhatsApp?
              </p>
              <a
                className="chat-fallback__cta"
                href={waLink(
                  courier.phone,
                  `Halo ${courier.name}, ini soal pesanan ${mockOrder.code}.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={16} strokeWidth={1.75} aria-hidden="true" />
                Chat WhatsApp
              </a>
            </div>
          ) : null}

          <div className="chat-suggestions">
            {SARAN.map((s) => (
              <button
                key={s}
                type="button"
                className="chat-chip"
                onClick={() => kirim(s)}
              >
                {s}
              </button>
            ))}
            {live.live ? null : (
              <button
                type="button"
                className="chat-chip chat-chip--demo"
                onClick={() => setOffline((v) => !v)}
              >
                {offline ? 'Kurir kembali online' : 'Simulasi: kurir offline'}
              </button>
            )}
          </div>

          <form
            className="chat-compose"
            onSubmit={(e) => {
              e.preventDefault()
              kirim(draf)
            }}
          >
            <input
              className="chat-compose__input"
              type="text"
              value={draf}
              onChange={(e) => setDraf(e.target.value)}
              placeholder="Tulis pesan…"
              aria-label="Tulis pesan untuk kurir"
            />
            <button
              type="submit"
              className="chat-compose__send"
              aria-label="Kirim pesan"
              disabled={draf.trim().length === 0}
            >
              <Send size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
