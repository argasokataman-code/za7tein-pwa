import { RotateCcw } from 'lucide-react'
import { useState } from 'react'

import { WEEKDAY_LABELS, WEEKDAY_ORDER, hoursForDay } from '../../data/operatingHours'
import type { OperatingHoursDay } from '../../types'
import { BottomSheet } from '../ui/BottomSheet'
import { TimeField, TimePanel } from '../ui/TimeField'

interface MerchantHoursSheetProps {
  open: boolean
  /** Draf jadwal (belum disimpan). */
  schedule: OperatingHoursDay[]
  onPatch: (day: number, patch: Partial<OperatingHoursDay>) => void
  /** Kembalikan draf ke jam bawaan (bukan ke jam tersimpan). */
  onReset: () => void
  onSave: () => void
  onClose: () => void
}

/**
 * Sheet "Jam operasional" di setelan merchant.
 *
 * Dua tampilan dalam satu sheet, tidak pernah bersamaan: daftar tujuh hari, dan
 * pemilih jam yang **menggantinya** saat sebuah jam diketuk (MD-06 satu daftar
 * pada satu waktu). Pemilihnya roda sendiri (`ui/TimeField`), bukan
 * `input type="time"` peramban.
 *
 * State draf tetap di halaman supaya "Batal" membuangnya tanpa menyentuh store;
 * komponen ini hanya memegang jam mana yang sedang disunting.
 */
export function MerchantHoursSheet({
  open,
  schedule,
  onPatch,
  onReset,
  onSave,
  onClose,
}: MerchantHoursSheetProps) {
  const [timePicker, setTimePicker] = useState<{ day: number; field: 'open' | 'close' } | null>(
    null,
  )

  /* Panel jam mengganti daftar hari, jadi trigger yang tadi disentuh ikut
     hilang dari DOM. Setelah panel ditutup, fokus dikembalikan ke trigger itu
     supaya pengguna keyboard tidak kehilangan tempat. */
  const closeTimePicker = () => {
    const last = timePicker
    setTimePicker(null)
    if (!last) return
    requestAnimationFrame(() => {
      document.getElementById(`time-${last.day}-${last.field}`)?.focus()
    })
  }

  const close = () => {
    setTimePicker(null)
    onClose()
  }

  return (
    <BottomSheet open={open} title="Jam operasional" onClose={close}>
      {timePicker ? (
        <TimePanel
          title={`${WEEKDAY_LABELS[timePicker.day]} · ${
            timePicker.field === 'open' ? 'Jam buka' : 'Jam tutup'
          }`}
          value={
            (schedule.find((row) => row.day === timePicker.day) ??
              hoursForDay(schedule, timePicker.day))[timePicker.field]
          }
          label={`jam ${timePicker.field === 'open' ? 'buka' : 'tutup'} ${
            WEEKDAY_LABELS[timePicker.day]
          }`}
          onChange={(value) => onPatch(timePicker.day, { [timePicker.field]: value })}
          onClose={closeTimePicker}
        />
      ) : (
        <div className="merchant-hours">
          {WEEKDAY_ORDER.map((day) => {
            const row = schedule.find((item) => item.day === day) ?? hoursForDay(schedule, day)
            const label = WEEKDAY_LABELS[day]
            return (
              <div className={`merchant-hours-row${row.closed ? ' is-closed' : ''}`} key={day}>
                <div className="merchant-hours-head">
                  <span className="merchant-hours-day">{label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={row.closed}
                    aria-label={`Libur ${label}`}
                    className={`merchant-hours-toggle${row.closed ? ' is-on' : ''}`}
                    onClick={() => {
                      setTimePicker(null)
                      onPatch(day, { closed: !row.closed })
                    }}
                  >
                    <span>Libur</span>
                    <span className="merchant-toggle-switch" aria-hidden="true" />
                  </button>
                </div>
                <div className="merchant-hours-times">
                  <div className="merchant-hours-field">
                    <span className="merchant-hours-field-label" aria-hidden="true">
                      Buka
                    </span>
                    <TimeField
                      id={`time-${day}-open`}
                      value={row.open}
                      label={`Jam buka ${label}`}
                      disabled={row.closed}
                      onClick={() => setTimePicker({ day, field: 'open' })}
                    />
                  </div>
                  <span className="merchant-hours-dash" aria-hidden="true">
                    &ndash;
                  </span>
                  <div className="merchant-hours-field">
                    <span className="merchant-hours-field-label" aria-hidden="true">
                      Tutup
                    </span>
                    <TimeField
                      id={`time-${day}-close`}
                      value={row.close}
                      label={`Jam tutup ${label}`}
                      disabled={row.closed}
                      onClick={() => setTimePicker({ day, field: 'close' })}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!timePicker && (
        <button type="button" className="merchant-hours-reset" onClick={onReset}>
          <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
          Atur ulang ke jam bawaan
        </button>
      )}

      <div className="merchant-actions">
        <button type="button" className="btn btn-primary" onClick={onSave}>
          Simpan
        </button>
        <button type="button" className="merchant-btn-ghost" onClick={close}>
          Batal
        </button>
      </div>
    </BottomSheet>
  )
}
