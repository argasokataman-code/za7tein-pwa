import { useState } from 'react'
import { ArrowDownUp, Check, Info, RefreshCw, TrendingUp, X } from 'lucide-react'

import { LIVE_RATE_SOURCE, RATE_DISCLAIMER, moneyPlain, rateSyncedLabel } from '../../data/currency'
import { useLiveRate } from '../../hooks/useLiveRate'
import { CurrencyExchangeIcon } from './CurrencyExchangeIcon'

const JOD_PRESETS = [0.5, 1, 1.5, 2, 2.5, 5, 10, 20]
const RUPIAH = new Intl.NumberFormat('id-ID')

type Direction = 'JOD_TO_IDR' | 'IDR_TO_JOD'

interface CurrencyConverterProps {
  onClose: () => void
}

/**
 * Konverter kurs JOD ⇄ IDR — mengikuti modal mata uang desain v2.
 *
 * Beda dari contoh dengan sengaja:
 * - Rate datang dari `useLiveRate` repo (satu sumber, `fawazahmed0/exchange-api`
 *   + cache harian), bukan `fetch` sendiri ke provider lain di dalam komponen.
 * - Dua nominal tidak disimpan sebagai dua state seperti contoh. Yang
 *   disimpan hanya sisi "Dari"; sisi "Hasil" diturunkan dari rate saat render,
 *   jadi tak ada dua angka yang bisa desync saat rate live menyegarkan diri.
 * - Tanpa emoji bendera (aturan repo) — kode mata uang ditulis "JOD"/"IDR".
 */
export function CurrencyConverter({ onClose }: CurrencyConverterProps) {
  const { rate, syncing, refresh } = useLiveRate()
  const [direction, setDirection] = useState<Direction>('JOD_TO_IDR')
  const [raw, setRaw] = useState('1')
  const [copied, setCopied] = useState(false)

  const isJodFirst = direction === 'JOD_TO_IDR'
  const value = Number.parseFloat(raw)
  const hasValue = Number.isFinite(value)

  const converted = hasValue ? (isJodFirst ? value * rate.rate : value / rate.rate) : 0
  const toDisplay = hasValue
    ? isJodFirst
      ? RUPIAH.format(Math.round(converted))
      : converted.toFixed(3)
    : ''

  const fromCode = isJodFirst ? 'JOD' : 'IDR'
  const toCode = isJodFirst ? 'IDR' : 'JOD'
  const sourceLabel = rate.source === 'Mock' ? 'kurs bawaan (mock)' : LIVE_RATE_SOURCE

  const handleChange = (next: string) => {
    setRaw(next.replace(isJodFirst ? /[^0-9.]/g : /[^0-9]/g, ''))
  }

  const swapDirection = () => {
    setDirection(isJodFirst ? 'IDR_TO_JOD' : 'JOD_TO_IDR')
    // Nominal pindah ke sisi "Dari" yang baru: buang pemisah ribuan IDR.
    setRaw(toDisplay.replace(/\./g, ''))
  }

  const copyResult = () => {
    const text = isJodFirst
      ? `${raw || '0'} JOD = Rp ${RUPIAH.format(Math.round(converted))}`
      : `Rp ${RUPIAH.format(Math.round(value || 0))} = ${converted.toFixed(3)} JOD`
    void navigator.clipboard?.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="cc">
      <header className="cc__header">
        <div className="cc__head">
          <span className="cc__head-icon" aria-hidden="true">
            <CurrencyExchangeIcon size={20} />
          </span>
          <div className="cc__head-text">
            <h2 className="cc__title">Konversi Kurs JOD ⇄ IDR</h2>
            <p className="cc__subtitle">Kurs live IDR ⇄ JOD</p>
          </div>
        </div>

        <div className="cc__head-actions">
          <button
            type="button"
            className="cc__icon-btn"
            aria-label="Perbarui kurs"
            aria-busy={syncing}
            disabled={syncing}
            onClick={() => void refresh()}
          >
            <RefreshCw
              size={16}
              strokeWidth={2}
              className={syncing ? 'is-spinning' : undefined}
              aria-hidden="true"
            />
          </button>
          <button type="button" className="cc__icon-btn" aria-label="Tutup" onClick={onClose}>
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="cc__body">
        <div className="cc__rate">
          <div className="cc__rate-top">
            <span className="cc__rate-label">
              <span className="cc__rate-dot" aria-hidden="true" />
              Kurs hari ini
            </span>
            <span className="cc__rate-live">
              <TrendingUp size={12} strokeWidth={2.4} aria-hidden="true" />
              Live
            </span>
          </div>

          <p className="cc__rate-value">1 JOD = {moneyPlain(rate.rate)}</p>

          <div className="cc__rate-foot">
            <span>10.000 IDR ≈ {(10000 / rate.rate).toFixed(3)} JOD</span>
            <span>{rateSyncedLabel()}</span>
          </div>
        </div>

        <div className="cc__convert">
          <label className="cc__field">
            <span className="cc__field-top">
              <span className="cc__field-label">
                {isJodFirst ? 'Dari (Dinar Yordania)' : 'Dari (Rupiah Indonesia)'}
              </span>
              <span className="cc__field-code">{fromCode}</span>
            </span>
            <span className="cc__field-input">
              <span className="cc__field-prefix">{isJodFirst ? 'JD' : 'Rp'}</span>
              <input
                type="text"
                inputMode="decimal"
                value={raw}
                placeholder="0"
                aria-label={`Nominal dalam ${fromCode}`}
                onChange={(event) => handleChange(event.target.value)}
              />
            </span>
          </label>

          <div className="cc__swap-row">
            <button
              type="button"
              className="cc__swap"
              aria-label="Tukar arah konversi"
              onClick={swapDirection}
            >
              <ArrowDownUp size={16} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>

          <div className="cc__field">
            <span className="cc__field-top">
              <span className="cc__field-label">
                {isJodFirst ? 'Hasil (Rupiah Indonesia)' : 'Hasil (Dinar Yordania)'}
              </span>
              <span className="cc__field-code cc__field-code--accent">{toCode}</span>
            </span>
            <span className="cc__field-input">
              <span className="cc__field-prefix cc__field-prefix--accent">
                {isJodFirst ? 'Rp' : 'JD'}
              </span>
              <span className="cc__field-value">{toDisplay || '0'}</span>
            </span>
          </div>
        </div>

        <div>
          <span className="cc__presets-label">Pilihan cepat Dinar Yordania (JOD)</span>
          <div className="cc__presets-row">
            {JOD_PRESETS.map((val) => {
              const active = isJodFirst && hasValue && value === val
              return (
                <button
                  key={val}
                  type="button"
                  className={active ? 'cc__chip is-active' : 'cc__chip'}
                  aria-pressed={active}
                  onClick={() => {
                    setDirection('JOD_TO_IDR')
                    setRaw(String(val))
                  }}
                >
                  {val} JOD
                </button>
              )
            })}
          </div>
        </div>

        <div className="cc__reference">
          <p className="cc__reference-title">
            <Info size={14} strokeWidth={2} aria-hidden="true" />
            Estimasi Harga Kuliner di Irbid
          </p>
          <div className="cc__reference-grid">
            <div className="cc__reference-card">
              <span className="cc__reference-name">Ongkos Kirim Lokal</span>
              <span className="cc__reference-jod">0.5 – 1.0 JOD</span>
              <span className="cc__reference-idr">≈ {moneyPlain(0.75 * rate.rate)}</span>
            </div>
            <div className="cc__reference-card">
              <span className="cc__reference-name">Menu Nasi / Ayam</span>
              <span className="cc__reference-jod">2.0 – 3.0 JOD</span>
              <span className="cc__reference-idr">≈ {moneyPlain(2.5 * rate.rate)}</span>
            </div>
          </div>
        </div>

        <button type="button" className="cc__copy" onClick={copyResult}>
          {copied ? (
            <>
              <Check size={16} strokeWidth={3} aria-hidden="true" />
              Hasil konversi disalin
            </>
          ) : (
            <>
              <CurrencyExchangeIcon size={16} />
              Salin hasil konversi ({toCode})
            </>
          )}
        </button>

        <p className="cc__disclaimer">
          {RATE_DISCLAIMER} · sumber: {sourceLabel}
        </p>
      </div>
    </div>
  )
}
