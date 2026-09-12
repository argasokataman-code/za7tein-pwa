import { Bike, Check, Home, Utensils, type LucideIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  ORDER_STAGES,
  formatDistance,
  mockCouriers,
  mockMerchant,
  mockOrder,
  rupiah,
  zoneFor,
} from '../data/merchant'
import { useAppSelector } from '../hooks/useAppStore'
import { useLeafletMap } from '../hooks/useLeafletMap'
import type { OrderStage } from '../types'

/**
 * Layar tahap pesanan.
 *
 * Versi hasil porting menaruh peta setinggi hampir seluruh layar di belakang
 * panel melengkung, jadi bagian yang paling menonjol justru yang paling
 * sedikit informasinya — sementara status pesanan, satu-satunya hal yang
 * dicari orang, terdorong ke bawah lipatan. Di sini urutannya dibalik:
 * status lebih dulu, peta menyesuaikan tahap.
 *
 * Kelima rute order memakai komponen ini. Sebelumnya `/order-tracking`,
 * `/order-delivery`, `/order-delivered`, dan `/order-success` adalah empat
 * salinan markup portingan yang sama — hanya beda prefix kelas dan nomor
 * pesanan — sehingga perbaikan desain harus diulang empat kali dan salah
 * satunya pasti tertinggal. Sekarang tahapnya yang berbeda, tampilannya satu.
 */

/* ── Ikon ──────────────────────────────────────────────────────────────────
   Semuanya satu bahasa: viewBox 24, isi `none`, `stroke="currentColor"`, tebal
   1,75, ujung membulat. Versi lama mencampur ikon berisi (fill) dan bergaris
   (stroke) dalam satu baris — clipboard, rice cooker, lalu dua ikon garis —
   sehingga terbaca seperti diambil dari beberapa set berbeda.                 */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function IconStore() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
      <path d="M3 6.5 4.8 3.5A1 1 0 0 1 5.7 3h12.6a1 1 0 0 1 .9.5L21 6.5v1.2a2.6 2.6 0 0 1-4.5 1.8 2.6 2.6 0 0 1-4 0 2.6 2.6 0 0 1-4 0 2.6 2.6 0 0 1-4.5-1.8z" />
      <path d="M9.5 20v-5h5v5" />
    </svg>
  )
}

function IconCourier() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M5 20.5a7 7 0 0 1 14 0" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M20 10.5c0 5-8 10.5-8 10.5S4 15.5 4 10.5a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10.5" r="2.75" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2" />
    </svg>
  )
}

function IconChat() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M20.5 11.5a8 8 0 0 1-11.3 7.2L4 20l1.3-5.1A8 8 0 1 1 20.5 11.5" />
    </svg>
  )
}

function IconBack() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
    </svg>
  )
}

function IconRecenter() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  )
}

/* ── Sa7tein Journey Line ─────────────────────────────────────────────────
   Menggantikan baris empat ikon generik dengan rel bertitik: simpul selesai
   berupa centang hijau redup, simpul aktif cincin oranye, sisanya lingkaran
   kosong abu hangat. Simpulnya SVG kecil — bukan lingkaran ikon besar.        */

type NodeState = 'done' | 'active' | 'todo'

/** Ikon tiap tahap, memakai lucide yang sudah jadi bahasa ikon aplikasi. */
const STEP_ICON: Record<OrderStage, LucideIcon> = {
  diterima: Check,
  dimasak: Utensils,
  diantar: Bike,
  tiba: Home,
}

function JourneyLine({ stage }: { stage: OrderStage }) {
  const activeIndex = ORDER_STAGES.findIndex((s) => s.id === stage)
  const stateOf = (i: number): NodeState =>
    i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'todo'

  return (
    <div className="journey">
      <div className="journey-rail">
        {ORDER_STAGES.map((s, i) => {
          const Icon = STEP_ICON[s.id]
          const st = stateOf(i)
          return (
            <span key={s.id} className={`journey-cell journey-cell--${st}`}>
              <span className={`journey-node journey-node--${st}`}>
                <Icon size={13} strokeWidth={2} aria-hidden="true" />
              </span>
            </span>
          )
        })}
      </div>
      <div className="journey-labels">
        {ORDER_STAGES.map((s, i) => (
          <span key={s.id} className={`journey-label journey-label--${stateOf(i)}`}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Teks per tahap ──────────────────────────────────────────────────────── */

const STATUS: Record<
  OrderStage,
  { label: string; etaLabel: string; eta: string; courier: string }
> = {
  diterima: {
    label: 'Pesanan diterima',
    etaLabel: 'Estimasi siap',
    eta: mockOrder.readyEstimate,
    courier: 'Menunggu konfirmasi toko',
  },
  dimasak: {
    label: 'Sedang dimasak',
    etaLabel: 'Estimasi siap',
    eta: mockOrder.readyEstimate,
    courier: 'Menunggu pesanan siap',
  },
  diantar: {
    label: 'Sedang diantar',
    etaLabel: 'Estimasi tiba',
    eta: mockOrder.arriveEstimate,
    courier: 'Menuju alamatmu',
  },
  tiba: {
    label: 'Pesanan tiba',
    etaLabel: 'Tiba pukul',
    eta: mockOrder.arriveEstimate,
    courier: 'Pesanan sudah diterima',
  },
}

type Props = {
  /**
   * Tahap yang ditampilkan rute ini. Kalau dikosongkan, tahapnya dibaca dari
   * store — itu yang dipakai `/order-placed`, karena halaman itu muncul tepat
   * setelah memesan dan tahapnya masih bergerak.
   */
  stage?: OrderStage
}

export default function OrderStageScreen({ stage: fixedStage }: Props) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const rawStage = useAppSelector((s) => s.cart.orderStage)
  const addresses = useAppSelector((s) => s.cart.addresses)
  const selectedAddressId = useAppSelector((s) => s.cart.selectedAddressId)

  // State tersimpan bisa berasal dari bentuk sebelum tahap pesanan ada, jadi
  // nilainya divalidasi di sini. Tanpa ini STATUS[undefined] melempar dan
  // seluruh halaman gagal dirender. `?stage=` menang atas semuanya supaya
  // tiap tahap bisa diperiksa tanpa mengubah kode.
  const sah = (v: string | null | undefined): v is OrderStage =>
    !!v && ORDER_STAGES.some((s) => s.id === v)

  const override = params.get('stage')
  const stage: OrderStage = sah(override)
    ? override
    : fixedStage ?? (sah(rawStage) ? rawStage : 'dimasak')

  // Pengantaran satu-satunya tahap di mana peta memang layak dominan.
  const isDelivery = stage === 'diantar'
  const { recenter } = useLeafletMap('order-map', isDelivery ? 'delivery' : 'preview')

  const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0] ?? null
  const courier = mockCouriers[0]
  const copy = STATUS[stage]
  const zone = address ? zoneFor(address.distanceMeters) : null
  // building menyimpan "Kompleks — Tower" dalam satu string; dipisah supaya
  // baris pertama menyebut kompleksnya dan baris kedua unitnya, seperti PRD.
  const [alamatKompleks, alamatTower] = address
    ? address.building.split(' — ')
    : ['', '']

  const mapBlock = (
    <div className={`track-map track-map--${isDelivery ? 'delivery' : 'preview'}`}>
      <div id="order-map" className="order-map-container" />
      {isDelivery ? (
        <button
          className="track-recenter"
          aria-label="Pusatkan peta"
          type="button"
          onClick={recenter}
        >
          <IconRecenter />
        </button>
      ) : null}
    </div>
  )

  useEffect(() => {
    document.body.className = 'sa7tein-track-page'
    return () => {
      document.body.className = ''
    }
  }, [])

  return (
    <div className="app-shell">
      <main>
        <div className="track-screen">
          <header className="track-header">
            <button
              className="track-back"
              aria-label="Kembali"
              type="button"
              onClick={() => navigate(-1)}
            >
              <IconBack />
            </button>
            <div className="track-header-text">
              <h1 className="track-title">Pesanan</h1>
              <span className="track-ref">#{mockOrder.code}</span>
            </div>
          </header>

          {isDelivery ? mapBlock : null}

          <section className="track-status" aria-live="polite">
            <p className="track-status-label">{copy.label}</p>
            <p className="track-status-eta">{copy.etaLabel}</p>
            <p className="track-status-time">{copy.eta}</p>
          </section>

          <JourneyLine stage={stage} />

          {isDelivery ? null : mapBlock}

          <section className="track-section">
            <h2 className="track-section-title">Toko</h2>
            <div className="track-row">
              <span className="track-icon">
                <IconStore />
              </span>
              <div className="track-row-text">
                <p className="track-row-name">{mockMerchant.name}</p>
                <p className="track-row-note">
                  Buka {mockMerchant.openTime}–{mockMerchant.closeTime}
                </p>
              </div>
            </div>
          </section>

          <section className="track-section">
            <h2 className="track-section-title">Kurir</h2>
            <div className="track-row">
              <span className="track-icon">
                <IconCourier />
              </span>
              <div className="track-row-text">
                <p className="track-row-name">
                  {courier.name}
                  <span className="track-rating">
                    <svg width={12} height={12} viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2L3 9.5l6.4-.6z"
                        fill="currentColor"
                      />
                    </svg>
                    {mockOrder.courierRating}
                  </span>
                </p>
                <p className="track-row-note">{copy.courier}</p>
              </div>
              <div className="track-actions">
                <a className="track-action" href="tel:+6281234567890">
                  <IconPhone />
                  Hubungi
                </a>
                <button
                  className="track-action"
                  type="button"
                  onClick={() => navigate('/order-chat')}
                >
                  <IconChat />
                  Chat
                </button>
              </div>
            </div>
          </section>

          {address ? (
            <section className="track-section">
              <h2 className="track-section-title">Tujuan</h2>
              <div className="track-row">
                <span className="track-icon">
                  <IconPin />
                </span>
                <div className="track-row-text">
                  <p className="track-row-name">{alamatKompleks}</p>
                  <p className="track-row-note">
                    {[alamatTower, address.floor, address.unit].filter(Boolean).join(' · ')}
                  </p>
                  <p className="track-row-meta">
                    {address.address} · {formatDistance(address.distanceMeters)}
                    {zone
                      ? ` · ${zone.label} · ongkir ${rupiah(zone.fee)}`
                      : ' · di luar jangkauan'}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  )
}
