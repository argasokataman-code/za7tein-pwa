import { MessageCircleQuestion, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import type { CustomerActiveOrder } from '../../api/orders'
import { formatCountdown } from '../../data/courier'
import { useMoney } from '../../hooks/useMoney'
import { useTick } from '../../hooks/useTick'
import {
  CANCEL_REASONS,
  cancelWindowRemainingMs,
  canCancelOrder,
  itemsLine,
  statusLabelOf,
  statusTone,
} from './orderStatus'

interface ActiveOrderRowProps {
  order: CustomerActiveOrder
  /** Baris ini sedang minta konfirmasi batal (satu saja per daftar). */
  confirming: boolean
  /** Pembatalan baris ini sedang dikirim ke BE. */
  pending: boolean
  /** Pesan gagal kirim untuk baris ini (null = tak ada). */
  error: string | null
  onTrack: (order: CustomerActiveOrder) => void
  /** Ikon X membuka/menutup konfirmasi. */
  onToggleConfirm: (order: CustomerActiveOrder) => void
  onCancel: (order: CustomerActiveOrder, reason?: string) => void
}

/**
 * Satu baris pesanan berjalan. Dipakai sheet dok keranjang dan tab "Aktif" di
 * Pesanan Saya — bentuknya identik supaya customer mengenali baris yang sama di
 * mana pun ia melihatnya (AGENTS §12: turunkan dari komponen, jangan salin).
 *
 * Konfirmasi batal tumbuh **di baris itu** (`ck-confirm`), bukan sheet kedua.
 * Tombol aman membaca "Simpan pesanan", bukan "Batal": kata "Batal" di bahasa
 * Indonesia berarti tindakan membatalkan, jadi label itu di tombol pembatalan
 * konfirmasi justru menunjuk aksi yang salah.
 */
export function ActiveOrderRow({
  order,
  confirming,
  pending,
  error,
  onTrack,
  onToggleConfirm,
  onCancel,
}: ActiveOrderRowProps) {
  const { money } = useMoney()
  // Detak 1 detik untuk jendela batal; baris yang statusnya di luar jendela
  // tetap diam (remaining = 0).
  const { now } = useTick()
  const remaining = cancelWindowRemainingMs(order, now)
  const cancelable = canCancelOrder(order, now)

  const panelId = `ck-cancel-${order.id}`
  const questionId = `${panelId}-q`
  const safeRef = useRef<HTMLButtonElement>(null)
  const [reason, setReason] = useState<string | null>(null)

  // Konfirmasi dibuka: fokus pindah ke tombol aman supaya pengguna keyboard
  // tidak jatuh ke `body` saat ikon X diganti panel.
  useEffect(() => {
    if (confirming) safeRef.current?.focus()
    else setReason(null)
  }, [confirming])

  return (
    <li className="ck-row">
      <button type="button" className="ck-row__line list-row" onClick={() => onTrack(order)}>
        <span className="ck-row__title">{order.merchantName}</span>
        <span className="ck-row__sum">{money(order.totalIdr)}</span>
        <span className="ck-row__meta">
          <span className="ck-row__code">{order.code}</span>
          <span className="ck-row__ago">{order.placedAt}</span>
          {remaining > 0 ? (
            /* Tenggat = chip bertitik, bukan kata abu di tengah string meta
               (MD-07). Angka berganti tiap detik: `aria-live` sengaja mati. */
            <span className="ck-chip ck-chip--win" role="timer" aria-live="off">
              <span className="ck-chip__dot ck-chip__dot--warn" aria-hidden="true" />
              Batal {formatCountdown(remaining)}
            </span>
          ) : null}
        </span>
        <span className="ck-chip ck-chip--end">
          <span
            className={`ck-chip__dot ck-chip__dot--${statusTone(order.status)}`}
            aria-hidden="true"
          />
          {statusLabelOf(order)}
        </span>
        {order.items.length ? <span className="ck-row__sub">{itemsLine(order.items)}</span> : null}
      </button>
      {/* Kolom aksi selebar tetap; CSS menyembunyikannya untuk seluruh daftar
          bila tak ada satu pun baris beraksi, supaya gutter kanan tidak
          menyisakan 44px kosong. Bila ada aksi, semua baris tetap satu rel. */}
      <span className="ck-row__act">
        {cancelable ? (
          <button
            type="button"
            className="ck-icon"
            aria-label={
              confirming
                ? `Tutup konfirmasi pembatalan ${order.code}`
                : `Batalkan pesanan ${order.code}`
            }
            aria-expanded={confirming}
            aria-controls={confirming ? panelId : undefined}
            onClick={() => onToggleConfirm(order)}
          >
            <X size={16} strokeWidth={2.25} aria-hidden="true" />
          </button>
        ) : (
          /* Jendela batal tutup: jangan tinggalkan layar tanpa jalan. Sengketa
             adalah pintu CS yang sudah ada dan membawa kode order. */
          <Link
            className="ck-icon"
            to={`/dispute?order=${encodeURIComponent(order.code)}&by=customer`}
            aria-label={`Ajukan masalah pesanan ${order.code} ke CS`}
          >
            <MessageCircleQuestion size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
        )}
      </span>
      {confirming ? (
        <span className="ck-confirm" id={panelId} role="group" aria-label="Konfirmasi pembatalan">
          <span className="ck-confirm__q" id={questionId}>
            Batalkan pesanan dari {order.merchantName}?
            <span className="ck-confirm__code">{order.code}</span>
          </span>
          <span className="ck-confirm__reasons" role="group" aria-label="Alasan batal, opsional">
            {CANCEL_REASONS.map((item) => (
              <button
                key={item}
                type="button"
                className={`ck-confirm__reason${reason === item ? ' is-on' : ''}`}
                aria-pressed={reason === item}
                disabled={pending}
                onClick={() => setReason((cur) => (cur === item ? null : item))}
              >
                {item}
              </button>
            ))}
          </span>
          {error ? (
            <span className="ck-confirm__err" role="alert">
              {error}
            </span>
          ) : null}
          <span className="ck-confirm__actions">
            <button
              ref={safeRef}
              type="button"
              className="ck-confirm__btn"
              aria-describedby={questionId}
              disabled={pending}
              onClick={() => onToggleConfirm(order)}
            >
              Simpan pesanan
            </button>
            <button
              type="button"
              className="ck-confirm__btn ck-confirm__btn--danger"
              aria-busy={pending}
              disabled={pending}
              onClick={() => onCancel(order, reason ?? undefined)}
            >
              {pending ? 'Membatalkan…' : 'Ya, batalkan'}
            </button>
          </span>
        </span>
      ) : null}
    </li>
  )
}
