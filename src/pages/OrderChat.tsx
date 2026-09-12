// Chat dengan kurir. Sebelumnya tombol "Chat" di halaman pelacakan hanya
// memunculkan toast "Membuka chat dengan kurir" lalu tidak terjadi apa-apa,
// dan tidak ada rutenya sama sekali. Layar ini yang menggantikannya.
//
// Percakapannya hidup di state lokal halaman, bukan di store: prototipe ini
// tidak punya backend, dan menyimpannya di store berarti percakapan ikut
// tersimpan ke localStorage lewat redux-persist, yang justru bikin keadaan
// aneh saat dibuka lagi berhari-hari kemudian.
import { ArrowLeft, Send } from 'lucide-react'

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { mockCouriers, mockOrder } from '../data/merchant'

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

/** Balasan bergilir supaya mengirim pesan terasa ada yang menjawab. */
const BALASAN = [
  'Siap, saya catat ya.',
  'Baik, sebentar lagi sampai.',
  'Sudah masuk gerbang, tinggal cari tower A.',
  'Terima kasih, ditunggu ya.',
]

export default function OrderChat() {
  const navigate = useNavigate()
  const courier = mockCouriers[0]

  const [pesan, setPesan] = useState<Pesan[]>(AWAL)
  const [draf, setDraf] = useState('')
  const [menulis, setMenulis] = useState(false)
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

  // Selalu tampilkan pesan terbaru.
  useEffect(() => {
    ujungDaftar.current?.scrollIntoView({ block: 'end' })
  }, [pesan, menulis])

  const kirim = (teks: string) => {
    const isi = teks.trim()
    if (!isi) return

    setPesan((lama) => [
      ...lama,
      { id: Date.now(), dari: 'aku', teks: isi, jam: jam() },
    ])
    setDraf('')
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
            <button
              type="button"
              className="btn-back"
              aria-label="Kembali"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" />
            </button>

            <div className="chat-header__who">
              <span className="chat-header__name">{courier.name}</span>
              <span className="chat-header__status">
                {menulis ? 'sedang menulis…' : 'Kurir · pesanan ' + mockOrder.code}
              </span>
            </div>

            <span className="chat-header__spacer" aria-hidden="true" />
          </header>

          <div className="chat-thread" role="log" aria-live="polite" aria-label="Percakapan dengan kurir">
            {pesan.map((p) => (
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
