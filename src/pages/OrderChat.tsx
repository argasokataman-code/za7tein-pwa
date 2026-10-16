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

import {
  CHAT_MEDIA_AVAILABLE,
  chatParticipants,
  chatStatusFor,
  courierJoinedInhouse,
  courierJoinedPartner,
  hasChatThread,
  type ChatRole,
} from '../data/chat'
import { mockCouriers, mockMerchant, mockOrder } from '../data/merchant'
import { mockUser } from '../data/user'
import { waLink } from '../data/phone'
import { useApiChat } from '../hooks/useApiChat'
import { useAppSelector } from '../hooks/useAppStore'
import { BackButton } from '../components/ui/BackButton'
import { PlatformNotice } from '../components/ui/PlatformNotice'

type PesanDari = 'kurir' | 'merchant' | 'aku'

type Pesan = {
  id: number
  dari: PesanDari
  teks: string
  jam: string
}

const ROLE_LABEL: Record<ChatRole, string> = {
  customer: 'Pembeli',
  merchant: 'Toko',
  kurir: 'Kurir',
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

/**
 * Percakapan pembuka menggambarkan **tujuan** chat §20.1: koordinasi dengan toko
 * saat permintaan customer tidak bisa dipenuhi apa adanya. Pesan kurir hanya ikut
 * tampil kalau kurir memang sudah bergabung.
 */
const AWAL: Pesan[] = [
  {
    id: 1,
    dari: 'merchant',
    teks: `Halo, catatan pesanan ${mockOrder.code} minta paha atas. Yang tersedia tinggal dada, mau diganti atau dibatalkan?`,
    jam: jam(-8),
  },
  { id: 2, dari: 'aku', teks: 'Diganti dada saja ya, jangan pakai sambal.', jam: jam(-7) },
  { id: 3, dari: 'merchant', teks: 'Siap, dicatat. Pesanannya kami mulai masak.', jam: jam(-6) },
  {
    id: 4,
    dari: 'kurir',
    teks: `Halo, pesanan ${mockOrder.code} sudah saya ambil dari toko.`,
    jam: jam(-5),
  },
  { id: 5, dari: 'kurir', teks: 'Saya menuju ke Green View Apartment ya.', jam: jam(-4) },
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
  const batch = useAppSelector((s) => s.courier.batch)
  const assignments = useAppSelector((s) => s.partner.assignments)
  const orderStage = useAppSelector((s) => s.cart.orderStage)
  const orderCancelled = useAppSelector((s) => s.cart.orderCancelled)
  const queryOrder = params.get('order')
  const orderId = queryOrder
    ? Number(queryOrder)
    : activeOrder
      ? Number(activeOrder.id)
      : null
  const live = useApiChat(orderId)
  const threadAda = hasChatThread(activeOrder, orderId)

  /**
   * Keanggotaan kurir diturunkan dari state demo: batch sudah di-assign (§20.1
   * jalur inhouse) atau assignment partner sudah di-approve (jalur partner).
   * Catatan jujur: id batch/organisasi demo (`ct-*`) belum menyatu dengan order
   * BE (`api-*`), jadi ini "ada batch ter-assign di sesi ini", bukan pencocokan
   * per order — gap identitas lintas peran yang sudah tercatat (M5).
   */
  const batchAssigned = courierJoinedInhouse(batch, activeOrder?.id)
  const partnerApproved = courierJoinedPartner(assignments)
  const courierJoined = batchAssigned || partnerApproved
  const orderState: 'active' | 'done' | 'cancelled' = orderCancelled
    ? 'cancelled'
    : orderStage === 'selesai'
      ? 'done'
      : 'active'

  const peserta = chatParticipants({
    customerName: mockUser.name,
    merchantName: mockMerchant.name,
    courierName: courier.name,
    batchAssigned,
    partnerApproved,
    orderState,
  })
  const thread = chatStatusFor(orderState)
  /** Siapa yang "menjawab" di mode mock: kurir bila sudah bergabung, bila belum dari toko. */
  const balasDari: PesanDari = courierJoined ? 'kurir' : 'merchant'

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
  const daftar = live.live
    ? pesanLive
    : pesan.filter((p) => p.dari !== 'kurir' || courierJoined)

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
    // berpura-pura kurirnya masih membaca (M8). Di thread order, balasan mock
    // datang dari toko selama kurir belum bergabung.
    if (offline) return
    setMenulis(true)

    timer.current = setTimeout(() => {
      const balasan = BALASAN[nomorBalasan.current % BALASAN.length]
      nomorBalasan.current += 1
      setMenulis(false)
      setPesan((lama) => [
        ...lama,
        { id: Date.now(), dari: balasDari, teks: balasan, jam: jam() },
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
              <span className="chat-header__name">
                {threadAda
                  ? `Pesanan ${live.live ? (activeOrder?.code ?? `#${orderId}`) : mockOrder.code}`
                  : 'Contoh group chat'}
              </span>
              <span className="chat-header__status">
                {!live.live && offline
                  ? 'Lawan bicara sedang offline'
                  : menulis
                    ? 'sedang menulis…'
                    : `Group chat order · ${peserta.filter((p) => p.joined).length} peserta`}
              </span>
            </div>

            <span className="chat-header__spacer" aria-hidden="true" />
          </header>

          <ul className="chat-participants" aria-label="Peserta chat order">
            {peserta.map((p) => (
              <li
                key={p.role}
                className={`chat-participant${p.joined ? '' : ' chat-participant--muted'}`}
              >
                <span className="chat-participant__name">
                  {p.joined ? p.name : ROLE_LABEL[p.role]}
                </span>
                <span className="chat-participant__role">
                  {p.joined ? ROLE_LABEL[p.role] : 'belum bergabung'}
                </span>
              </li>
            ))}
          </ul>

          <div className="chat-thread" role="log" aria-live="polite" aria-label="Percakapan group order">
            {daftar.map((p) => (
              <div key={p.id} className={`chat-bubble chat-bubble--${p.dari}`}>
                {p.dari === 'aku' ? null : (
                  <span className="chat-bubble__from">
                    {p.dari === 'merchant' ? mockMerchant.name : courier.name}
                  </span>
                )}
                <p className="chat-bubble__text">{p.teks}</p>
                <span className="chat-bubble__jam">{p.jam}</span>
              </div>
            ))}

            {menulis ? (
              <div className={`chat-bubble chat-bubble--${balasDari} chat-typing`}>
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
                Lawan bicara offline, balasan otomatis dimatikan.
              </p>
              {courierJoined ? (
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
              ) : null}
            </div>
          ) : null}

          {thread.status === 'closed' ? (
            <p className="chat-closed" role="status">
              {thread.reason === 'cancelled'
                ? 'Chat ditutup karena order dibatalkan atau ditolak. Riwayatnya tetap bisa dibaca.'
                : 'Chat ditutup setelah order selesai. Riwayatnya tetap bisa dibaca sampai masa simpan berakhir.'}
            </p>
          ) : (
            <>
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
                    {offline ? 'Lawan kembali online' : 'Simulasi: lawan offline'}
                  </button>
                )}
              </div>

              {/* Lampiran gambar (§20.1) butuh R2; BE demo belum punya bucket
                  maupun kolom lampiran. Ditandai, bukan dipalsukan. */}
              {CHAT_MEDIA_AVAILABLE ? null : (
                <div className="chat-media-note">
                  <PlatformNotice message="Lampiran gambar belum tersedia: gambar chat disimpan di R2 dan penyimpanannya belum ada di BE demo." />
                </div>
              )}

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
                  aria-label="Tulis pesan ke group order"
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
            </>
          )}
        </div>
      </main>
    </div>
  )
}
