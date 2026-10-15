import { Info, Plus, TicketPercent, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import {
  PROMO_TYPES,
  createPromo,
  deletePromo,
  fetchMerchantPromos,
  type MerchantPromo,
  type NewPromoInput,
  type PromoType,
} from '../api/promos'
import { apiEnabled } from '../api/supabase'
import { DEMO_MERCHANT_ID } from '../api/reference'
import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { jod } from '../data/currency'
import { PROGRAM_EDIT_AVAILABLE, merchantPrograms, programSummary } from '../data/marketing'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { setStackable } from '../store/slices/marketingSlice'

/**
 * Promo & diskon merchant (tabel `marketing`). Layar ini milik merchant: kode
 * yang dibuat di sini hanya berlaku untuk toko ini (`marketing.merchant_id`),
 * dan validasinya di checkout dikerjakan server (`validate_promo`) — jadi
 * jendela tanggal, kuota, dan kepemilikan merchant tak bisa dilewati klien.
 *
 * Tabelnya tak punya kolom "aktif": status diturunkan dari jendela tanggal dan
 * kuota (`promoStatus`), jadi tak ada dua sumber kebenaran untuk "sedang jalan".
 */

const TYPE_LABEL: Record<PromoType, string> = {
  discount_pct: 'Potongan %',
  discount_fixed: 'Potongan tetap',
  promo_delivery: 'Bebas ongkir',
}

const STATUS_LABEL: Record<MerchantPromo['status'], string> = {
  active: 'Aktif',
  scheduled: 'Terjadwal',
  expired: 'Berakhir',
  used_up: 'Kuota habis',
}

/** Nilai promo untuk tampilan: persen untuk `discount_pct`, nominal untuk lainnya. */
function valueLabel(promo: MerchantPromo): string {
  return promo.type === 'discount_pct' ? `${promo.value}%` : jod(promo.value)
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** `YYYY-MM-DD` (input date) → ISO. `end` menaruh waktu di ujung hari. */
function dayToIso(day: string, end = false): string {
  return new Date(`${day}T${end ? '23:59:59' : '00:00:00'}`).toISOString()
}

function todayPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function MerchantPromos() {
  const dispatch = useAppDispatch()
  const [promos, setPromos] = useState<MerchantPromo[]>([])
  const [loading, setLoading] = useState(apiEnabled)
  const [error, setError] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MerchantPromo | null>(null)

  // Program marketing (§15) hidup di state aplikasi, bukan tabel `marketing`
  // seperti kode promo di atas. Hanya program milik toko ini yang dikelola di
  // sini; program aplikator dikelola ops.
  const programs = useAppSelector((s) => s.marketing.programs)
  const programRules = useAppSelector((s) => s.marketing.rules)
  const programRewards = useAppSelector((s) => s.marketing.rewards)
  const ownedPrograms = merchantPrograms(
    programs,
    programRules,
    programRewards,
    String(DEMO_MERCHANT_ID),
  )

  // Form create.
  const [code, setCode] = useState('')
  const [type, setType] = useState<PromoType>('discount_pct')
  const [value, setValue] = useState('10')
  const [from, setFrom] = useState(todayPlus(0))
  const [to, setTo] = useState(todayPlus(30))
  const [maxUses, setMaxUses] = useState('')

  const load = useCallback(() => {
    if (!apiEnabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    fetchMerchantPromos()
      .then(setPromos)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setCode('')
    setType('discount_pct')
    setValue('10')
    setFrom(todayPlus(0))
    setTo(todayPlus(30))
    setMaxUses('')
  }

  const submit = async () => {
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) {
      toast.error('Isi kode promo dulu')
      return
    }
    if (!value || Number(value) <= 0) {
      toast.error('Nilai promo harus lebih dari 0')
      return
    }
    if (dayToIso(to, true) <= dayToIso(from)) {
      toast.error('Tanggal berakhir harus setelah tanggal mulai')
      return
    }
    const input: NewPromoInput = {
      code: cleanCode,
      type,
      value: Number(value),
      activeFrom: dayToIso(from),
      activeTo: dayToIso(to, true),
      maxUses: maxUses.trim() ? Number(maxUses) : null,
    }
    setBusy(true)
    try {
      await createPromo(input)
      toast.success(`Promo ${cleanCode} dibuat`)
      setSheetOpen(false)
      resetForm()
      load()
    } catch {
      toast.error('Gagal membuat promo — coba lagi')
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deletePromo(deleteTarget.id)
      setPromos((list) => list.filter((p) => p.id !== deleteTarget.id))
      toast.success(`Promo ${deleteTarget.code} dihapus`)
    } catch {
      toast.error('Gagal menghapus promo')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Marketing" title="Promo & diskon" back="/" />

        <section className="merchant-card">
          <div className="merchant-row">
            <TicketPercent size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="merchant-card-title">Kode promo toko ini</p>
              <p className="merchant-card-sub">
                Kode berlaku hanya untuk pesanan dari toko ini. Potongan dihitung server saat
                checkout — jendela tanggal dan kuota pemakaian ditegakkan di sana.
              </p>
            </div>
          </div>
        </section>

        {!apiEnabled ? (
          <PlatformNotice message="Backend belum tersambung — promo tidak bisa dimuat." />
        ) : null}
        {error ? (
          <PlatformNotice message="Gagal memuat promo. Tarik ulang halaman untuk mencoba lagi." />
        ) : null}

        <section className="merchant-section">
          <div className="merchant-section-head">
            <h2>Daftar promo</h2>
            <span className="merchant-card-sub">{promos.length} kode</span>
          </div>

          {loading ? (
            <p className="merchant-empty">Memuat promo…</p>
          ) : promos.length === 0 ? (
            <p className="merchant-empty">
              Belum ada promo. Tekan “Buat” untuk menambah kode diskon pertama.
            </p>
          ) : (
            <ul className="merchant-promo-list">
              {promos.map((promo) => (
                <li key={promo.id} className="merchant-card merchant-promo-item">
                  <div className="merchant-promo-head">
                    <div>
                      <p className="merchant-promo-code">{promo.code}</p>
                      <p className="merchant-card-sub">
                        {TYPE_LABEL[promo.type]} · {valueLabel(promo)}
                      </p>
                    </div>
                    <span className={`merchant-promo-badge is-${promo.status}`}>
                      {STATUS_LABEL[promo.status]}
                    </span>
                  </div>
                  <p className="merchant-card-sub">
                    {dateLabel(promo.activeFrom)} – {dateLabel(promo.activeTo)} ·{' '}
                    {promo.usedCount}
                    {promo.maxUses != null ? ` / ${promo.maxUses}` : ''} dipakai
                  </p>
                  <button
                    type="button"
                    className="merchant-btn-ghost merchant-promo-delete"
                    onClick={() => setDeleteTarget(promo)}
                  >
                    <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" /> Hapus
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Program marketing (§15, ala Odoo): promosi, kupon, beli X gratis Y,
            loyalty. Modelnya beda dari kode promo di atas — program dihitung
            otomatis di keranjang (`useProgramDiscount`), jadi sakelar "boleh
            digabung" di sini benar-benar mengubah potongan yang dilihat pembeli.
            BE belum punya tabelnya, jadi daftar ini hidup di state aplikasi. */}
        <section className="merchant-section">
          <div className="merchant-section-head">
            <h2>Program marketing</h2>
            <span className="merchant-card-sub">{ownedPrograms.length} program</span>
          </div>

          {ownedPrograms.length === 0 ? (
            <p className="merchant-empty">Belum ada program marketing untuk toko ini.</p>
          ) : (
            <ul className="merchant-promo-list">
              {ownedPrograms.map(({ program, rule, reward }) => {
                const summary = programSummary(program, rule, reward)
                return (
                  <li key={program.id} className="merchant-card merchant-promo-item">
                    <div className="merchant-promo-head">
                      <div>
                        <p className="merchant-promo-code">{program.name}</p>
                        <p className="merchant-card-sub">
                          {summary.type} · {summary.reward}
                        </p>
                      </div>
                      <span className="merchant-badge">
                        {program.isStackable ? 'Boleh digabung' : 'Berdiri sendiri'}
                      </span>
                    </div>
                    <p className="merchant-card-sub">
                      {program.dateFrom} – {program.dateTo ?? 'tanpa batas akhir'}
                      {summary.requirement ? ` · ${summary.requirement}` : ''}
                    </p>
                    {/* Seluruh baris jadi sasaran sentuh (audit 019 #1/#7). */}
                    <label className="merchant-row">
                      <span>Boleh digabung promo lain</span>
                      <span className="toggle-wrap">
                        <input
                          className="toggle-input"
                          type="checkbox"
                          checked={program.isStackable}
                          aria-label={`Boleh digabung dengan promo lain: ${program.name}`}
                          onChange={(e) =>
                            dispatch(
                              setStackable({
                                programId: program.id,
                                isStackable: e.target.checked,
                              }),
                            )
                          }
                        />
                        <span className="toggle-slider" />
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}

          <p className="merchant-card-sub">
            Aturan gabungan masih terbuka (OPEN-23) dan di sini memakai aturan paling sederhana yang
            bisa dibuktikan: program yang boleh digabung dijumlahkan, yang berdiri sendiri hanya
            jalan sendirian, dan yang diskonnya lebih besar yang dipakai.
          </p>
        </section>

        <PlatformNotice
          message={
            PROGRAM_EDIT_AVAILABLE
              ? 'Program marketing bisa dibuat dan diubah dari sini.'
              : 'Membuat atau mengubah program marketing belum tersedia. Backend belum punya tabel program (loyalty_programs), jadi daftar dan sakelar di atas hidup di state aplikasi dan belum tersimpan ke server.'
          }
        />

        <section className="merchant-card">
          <div className="merchant-row">
            <Info size={18} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="merchant-card-title">Yang belum final</p>
              <p className="merchant-card-sub">
                Scope marketing/promo di PRD masih terbuka (MARK-1). Layar ini memakai tabel{' '}
                <code className="doc-inline">marketing</code> apa adanya: satu kode = satu
                jendela tanggal, tanpa batas per pelanggan dan tanpa promo bawaan platform.
              </p>
            </div>
          </div>
        </section>

        <BottomSheet
          open={sheetOpen}
          title="Buat promo"
          onClose={() => {
            setSheetOpen(false)
            resetForm()
          }}
        >
          <form
            className="merchant-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              void submit()
            }}
          >
            <div className="form-group">
              <label htmlFor="promo-code" className="form-label">
                Kode
              </label>
              <input
                id="promo-code"
                className="form-control"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="mis. HEMAT10"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <span className="form-label">Jenis</span>
              <div className="merchant-chip-row" role="radiogroup" aria-label="Jenis promo">
                {PROMO_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={type === t}
                    className={`merchant-chip${type === t ? ' is-active' : ''}`}
                    onClick={() => setType(t)}
                  >
                    {TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="promo-value" className="form-label">
                {type === 'discount_pct' ? 'Persen potongan' : 'Nominal (JOD)'}
              </label>
              <input
                id="promo-value"
                type="number"
                inputMode="decimal"
                min="0"
                step={type === 'discount_pct' ? '1' : '0.01'}
                className="form-control"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="promo-from" className="form-label">
                Mulai
              </label>
              <input
                id="promo-from"
                type="date"
                className="form-control"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="promo-to" className="form-label">
                Berakhir
              </label>
              <input
                id="promo-to"
                type="date"
                className="form-control"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="promo-max" className="form-label">
                Batas pemakaian (opsional)
              </label>
              <input
                id="promo-max"
                type="number"
                inputMode="numeric"
                min="1"
                className="form-control"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="tanpa batas"
              />
            </div>

            <div className="merchant-actions">
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? 'Menyimpan…' : 'Simpan promo'}
              </button>
              <button
                type="button"
                className="merchant-btn-ghost"
                onClick={() => {
                  setSheetOpen(false)
                  resetForm()
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </BottomSheet>

        <ConfirmSheet
          open={deleteTarget !== null}
          title="Hapus promo?"
          body={`${deleteTarget?.code ?? ''} tidak bisa dipakai lagi setelah dihapus.`}
          confirmLabel="Hapus promo"
          onConfirm={() => void confirmDelete()}
          onClose={() => setDeleteTarget(null)}
        />

        {/* Ruang ekstra di ujung daftar supaya baris terakhir tidak tertutup FAB. */}
        <div className="page-fab-spacer" aria-hidden="true" />
      </main>

      {/* "Buat" pindah dari pojok kanan atas header ke zona jempol: pojok atas
          adalah tempat mata, bukan tempat jempol (senior-fe mobile G-02/G-03). */}
      <button
        type="button"
        className="page-fab"
        aria-label="Buat kode promo"
        onClick={() => setSheetOpen(true)}
      >
        <Plus size={22} strokeWidth={1.75} aria-hidden="true" />
      </button>

      <MerchantBottomNav />
    </div>
  )
}
