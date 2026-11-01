import { Check, Clock } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent } from 'react'

/** Tinggi satu baris roda; sama dengan `--touch-min` di `_tokens.scss`. */
const ITEM_HEIGHT = 44

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))

/** Menit tiap 5 menit: 12 pilihan, cukup untuk jam operasional. */
const MINUTE_STEP = 5
const MINUTE_OPTIONS = Array.from({ length: 60 / MINUTE_STEP }, (_, index) =>
  String(index * MINUTE_STEP).padStart(2, '0'),
)

interface TimeFieldProps {
  /** Nilai `HH:MM` 24 jam. */
  value: string
  /** Nama field untuk `aria-label` trigger, mis. "Jam buka Senin". */
  label: string
  /** Id trigger, dipakai layar pemanggil untuk mengembalikan fokus. */
  id: string
  disabled?: boolean
  onClick: () => void
}

/**
 * Trigger jam bergaya design system, pengganti kotak `input type="time"`
 * peramban. Yang dipakai dari peramban dulu cuma chromenya: di desktop ia
 * menampilkan spinner dan panel abu-abu milik sistem operasi, di ponsel ia
 * memanggil pemilih jam sistem yang bentuknya beda per merek. Sekarang nilainya
 * teks bertoken dan pilihannya roda sendiri (`TimePanel`).
 */
export function TimeField({ value, label, id, disabled, onClick }: TimeFieldProps) {
  return (
    <button
      type="button"
      id={id}
      className="time-field"
      aria-label={`${label}, ${value}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="time-field-value">{value}</span>
      <Clock size={18} strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}

interface WheelProps {
  options: readonly string[]
  value: string
  /** Awalan `aria-label` roda, mis. "jam buka Senin". */
  label: string
  caption: string
  onSelect: (value: string) => void
}

/**
 * Satu roda pilihan: kolom bergulir ber-`scroll-snap`, baris aktif di tengah
 * ditandai pita. Mengetuk baris lain menggeser roda (smooth), menggulir dengan
 * jari memilih baris yang berhenti di tengah. Pola ini dipakai pemilih jam
 * ponsel karena 24 + 12 pilihan tidak muat sebagai kisi tombol.
 */
function Wheel({ options, value, label, caption, onSelect }: WheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const settleTimer = useRef<number | undefined>(undefined)
  /* Posisi awal dibekukan di ref: roda mulai dari nilai sekarang, bukan dari
     pilihan pertama, dan tidak boleh melompat lagi tiap nilai berubah. */
  const startIndex = useRef(Math.max(0, options.indexOf(value)))

  useEffect(() => {
    const wheel = wheelRef.current
    if (!wheel) return
    wheel.scrollTop = startIndex.current * ITEM_HEIGHT
  }, [])

  /* `scroll-snap` sudah menahan baris terdekat; timer ini hanya menunggu jari
     berhenti sebelum nilainya ditulis, supaya draf jam tidak berubah di tengah
     gesekan. */
  const onScroll = () => {
    const wheel = wheelRef.current
    if (!wheel) return
    window.clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(() => {
      const index = Math.round(wheel.scrollTop / ITEM_HEIGHT)
      const next = options[Math.min(Math.max(index, 0), options.length - 1)]
      if (next && next !== value) onSelect(next)
    }, 120)
  }

  return (
    <div className="time-wheel" role="presentation">
      <p className="time-wheel-caption" aria-hidden="true">
        {caption}
      </p>
      <div className="time-wheel-track">
        <span className="time-wheel-band" aria-hidden="true" />
        <div
          ref={wheelRef}
          className="time-wheel-list"
          role="listbox"
          aria-label={label}
          onScroll={onScroll}
        >
          {options.map((option) => {
            const selected = option === value
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                className={`time-wheel-item${selected ? ' is-active' : ''}`}
                onClick={() => {
                  const wheel = wheelRef.current
                  const index = options.indexOf(option)
                  if (wheel) wheel.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' })
                  if (!selected) onSelect(option)
                }}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface TimePanelProps {
  /** Judul konteks, mis. "Senin · Jam buka". */
  title: string
  /** Nilai `HH:MM` yang sedang disunting. */
  value: string
  /** Nama field untuk awalan `aria-label`. */
  label: string
  onChange: (value: string) => void
  onClose: () => void
}

/**
 * Pemilih jam + menit dua roda. Saat terbuka ia **mengganti** daftar harinya
 * (MD-06: satu daftar pada satu waktu), bukan menyempil di dalam baris.
 *
 * Roda, bukan kisi tombol: 24 jam + 12 menit sebagai kisi memaksa 36 tombol
 * terlihat sekaligus dan memakan 420px tinggi panel. Roda hanya menampilkan
 * lima baris (± 220px) dan sisanya digulir, sama seperti pemilih jam ponsel.
 * Dua kolom bergulir ini sah menurut MD-03: penggulung di dalam panel sheet
 * adalah pengecualian yang tercatat.
 */
export function TimePanel({ title, value, label, onChange, onClose }: TimePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [hour, minute] = value.split(':')
  /* Data lama bisa menyimpan menit yang bukan kelipatan 5; nilai itu tetap
     ditawarkan supaya menyimpan ulang tidak diam-diam menggeser jam toko. */
  const minutes = MINUTE_OPTIONS.includes(minute)
    ? MINUTE_OPTIONS
    : [...MINUTE_OPTIONS, minute].sort((a, b) => a.localeCompare(b))

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  /* Escape menutup panel ini saja, bukan seluruh sheet: `stopPropagation` di
     handler React (dipasang di root) menghentikan bubble sebelum listener
     dokumen milik `BottomSheet` sempat jalan. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return
    event.stopPropagation()
    onClose()
  }

  return (
    <div
      ref={panelRef}
      className="time-panel"
      role="group"
      aria-label={`Atur ${label}`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div className="time-panel-head">
        <span className="time-panel-title">{title}</span>
        <button type="button" className="time-panel-done" onClick={onClose}>
          <Check size={16} strokeWidth={1.75} aria-hidden="true" />
          Selesai
        </button>
      </div>

      <div className="time-panel-wheels">
        <Wheel
          options={HOUR_OPTIONS}
          value={hour}
          label={`${label} — jam`}
          caption="Jam"
          onSelect={(nextHour) => onChange(`${nextHour}:${minute}`)}
        />
        <Wheel
          options={minutes}
          value={minute}
          label={`${label} — menit`}
          caption="Menit"
          onSelect={(nextMinute) => onChange(`${hour}:${nextMinute}`)}
        />
      </div>
    </div>
  )
}
