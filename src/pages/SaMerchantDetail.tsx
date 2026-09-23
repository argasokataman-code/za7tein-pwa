import { ArrowLeft, Bike, BookOpen, Clock, Scale, TriangleAlert } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { SuperAdminShell } from '../components/layout/SuperAdminShell'
import {
  adminEscalations,
  depositStatusLabel,
  disputeStatusLabel,
  ledgerTypeLabel,
  moneyFromJod,
  tenantStatusLabel,
} from '../data/admin'
import { jod } from '../data/currency'
import { couriers } from '../data/merchant'
import {
  couriersForMerchant,
  disputesForMerchant,
  escalationsForMerchant,
  ledgerForParty,
} from '../data/registry'
import { useAppSelector } from '../hooks/useAppStore'

/**
 * Dossier satu merchant, read-only.
 *
 * Registri pengguna menjawab "siapa saja merchant kita dan berapa angkanya".
 * Layar ini menjawab pertanyaan berikutnya: "merchant ini sebenarnya
 * bagaimana". Tanpa itu pengawasan berhenti di angka agregat, tidak ada cara
 * melihat kurir siapa yang dipekerjakan, sengketa apa yang menimpanya, uangnya
 * masuk entry ledger yang mana, dan alert SLA mana yang naik ke SA.
 *
 * Komposisi (satu alasan per keputusan, QL-01):
 * - **Hero dua kolom** (`.sa-hero--money`): identitas di kolom lebar, deposit
 *   yang ditahan platform di kolom sempit. Nama merchant jadi fokus pertama
 *   karena inilah halaman tentang satu orang, bukan satu daftar.
 * - **Strip empat tile** (`.sa-stats`): kurir, sengketa, entry ledger, alert
 *   SLA. Angka-angka itu sebelumnya terkubur di daftar nilai; di sini ia jadi
 *   ringkasan sekaligus indeks, tiap tile menaut ke section-nya sendiri.
 * - **Section selalu ada empat**, termasuk saat kosong: tile di atas menaut ke
 *   `#kurir`, `#sengketa`, `#ledger`, `#sla`, jadi targetnya tidak boleh
 *   hilang. Empty state juga kabar ("tidak ada alert SLA" itu baik).
 * - **SLA pakai feed, bukan tabel.** Ia peristiwa berurutan, bukan data
 *   bertabular; tabel keempat yang bentuknya sama hanya jadi pengulangan.
 *
 * **Tanpa aksi ubah status.** Suspend dan blacklist COD tetap kerja panel CS
 * (`/admin/merchants`), keputusan PO 2026-09-23: SA mengawasi, CS mengoperasi.
 * Kalau SA nanti perlu memutuskan sendiri, itu perubahan keputusan, bukan
 * tambahan tombol.
 *
 * Isinya turunan dari modul lain (`src/data/registry.ts`), bukan angka baru.
 * Daftar kurir sengaja hanya identitas: status live kurir papan pantau merchant
 * (`/merchant/couriers`), bukan pengawasan platform.
 */
export default function SaMerchantDetail() {
  const { id = '' } = useParams()
  const merchants = useAppSelector((s) => s.admin.merchants)
  const disputes = useAppSelector((s) => s.admin.disputes)
  const ledger = useAppSelector((s) => s.admin.ledger)

  const merchant = merchants.find((item) => item.id === id)

  if (!merchant) {
    return (
      <SuperAdminShell>
        <section className="sa-card">
          <p className="sa-card-label">
            <TriangleAlert size={14} strokeWidth={1.75} aria-hidden="true" />
            Merchant tidak ditemukan
          </p>
          <p className="sa-card-title">Id {id || '(kosong)'} tidak ada di registri</p>
          <p className="sa-card-sub">
            Mungkin id-nya salah ketik, atau tenant-nya masih menunggu review sehingga belum masuk
            registri.
          </p>
          <Link className="sa-link" to="/users">
            <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
            Kembali ke registri pengguna
          </Link>
        </section>
      </SuperAdminShell>
    )
  }

  const merchantCouriers = couriersForMerchant(couriers, merchant.id)
  const merchantDisputes = disputesForMerchant(disputes, merchant.id)
  const entries = ledgerForParty(ledger, 'merchant', merchant.id)
  const escalations = escalationsForMerchant(adminEscalations, merchant.id)
  const zones = [merchant.isActiveHijazi ? 'Hijazi' : '', merchant.isActiveSyimali ? 'Syimali' : '']
    .filter(Boolean)
    .join(' + ')

  const summary = [
    { id: 'kurir', label: 'Kurir dipekerjakan', value: merchantCouriers.length, icon: Bike },
    { id: 'sengketa', label: 'Sengketa', value: merchantDisputes.length, icon: Scale },
    { id: 'ledger', label: 'Entry ledger', value: entries.length, icon: BookOpen },
    { id: 'sla', label: 'Alert SLA', value: escalations.length, icon: Clock },
  ]

  return (
    <SuperAdminShell>
      <Link className="sa-link" to="/users">
        <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
        Registri pengguna
      </Link>

      <section className="sa-hero sa-hero--money">
        <article className="sa-card">
          <div className="sa-card-head">
            <div>
              <p className="sa-card-label">Merchant</p>
              <h2 className="sa-card-value">{merchant.name}</h2>
              <p className="sa-card-sub">
                {merchant.id} · {merchant.owner} · {merchant.city} · paket {merchant.tier}
              </p>
            </div>
            <span
              className={`sa-chip${merchant.tenantStatus === 'approved' ? ' is-ok' : ' is-off'}`}
            >
              {tenantStatusLabel[merchant.tenantStatus]}
            </span>
          </div>
          {merchant.statusReason ? (
            <p className="sa-note">Alasan status: {merchant.statusReason}</p>
          ) : null}
          <ul className="sa-kv">
            <li>
              <span>Pemilik</span>
              <span>{merchant.owner}</span>
            </li>
            <li>
              <span>Nomor WA pemilik</span>
              <span>{merchant.ownerPhone || 'kontak belum diisi'}</span>
            </li>
            <li>
              <span>Bergabung</span>
              <span>{merchant.joinedAt}</span>
            </li>
            <li>
              <span>Disetujui</span>
              <span>{merchant.approvedAt ?? 'belum'}</span>
            </li>
          </ul>
        </article>

        <article className="sa-card sa-card--glow">
          <p className="sa-card-label">Deposit ditahan platform</p>
          <p className="sa-card-value">{moneyFromJod(merchant.deposit)}</p>
          {/* Chip, bukan baris teks: keadaan deposit adalah status, dan konsol
              memakai chip untuk status di seluruh layar lain. Tone mengikuti
              akibatnya, `unpaid` satu-satunya yang berarti ada yang kurang. */}
          <span
            className={`sa-chip ${
              merchant.depositStatus === 'unpaid'
                ? 'is-off'
                : merchant.depositStatus === 'released'
                  ? 'is-muted'
                  : 'is-ok'
            }`}
          >
            {depositStatusLabel[merchant.depositStatus]}
          </span>
          <ul className="sa-kv">
            <li>
              <span>Zona aktif</span>
              <span>{zones || 'belum ada'}</span>
            </li>
            <li>
              <span>COD bermasalah</span>
              <span>{merchant.codIssues}×</span>
            </li>
            <li>
              <span>Paket</span>
              <span>{merchant.tier}</span>
            </li>
          </ul>
        </article>
      </section>

      <section className="sa-stats" aria-label="Ringkasan pengawasan merchant">
        {summary.map((item) => (
          <a key={item.id} className="sa-stat" href={`#${item.id}`}>
            <item.icon size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className="sa-stat-value">{item.value}</span>
            <span className="sa-stat-label">{item.label}</span>
          </a>
        ))}
      </section>

      <section className="sa-card" id="kurir">
        <p className="sa-card-label">
          <Bike size={14} strokeWidth={1.75} aria-hidden="true" />
          Kurir yang dipekerjakan
        </p>
        {merchantCouriers.length === 0 ? (
          <p className="sa-empty">Merchant ini belum punya kurir di registri.</p>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th scope="col">Nama</th>
                  <th scope="col">Nomor</th>
                  <th scope="col">Gabung</th>
                </tr>
              </thead>
              <tbody>
                {merchantCouriers.map((courier) => (
                  <tr key={courier.id}>
                    <td>
                      {courier.name}
                      <span className="sa-table-sub">{courier.id}</span>
                    </td>
                    <td className="sa-nowrap">
                      {courier.phone}
                      {courier.phoneVerified ? null : (
                        <span className="sa-table-sub">belum verifikasi</span>
                      )}
                    </td>
                    <td className="sa-nowrap">{courier.joinedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="sa-note">
          Hanya identitas. Status live kurir (Di toko, Mengantar) adalah papan pantau merchant atas
          kurirnya sendiri di <code className="sa-code">/merchant/couriers</code>, bukan pengawasan
          platform.
        </p>
      </section>

      <section className="sa-card" id="sengketa">
        <p className="sa-card-label">
          <Scale size={14} strokeWidth={1.75} aria-hidden="true" />
          Sengketa
        </p>
        {merchantDisputes.length === 0 ? (
          <p className="sa-empty">Tidak ada sengketa yang menimpa merchant ini.</p>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Kategori</th>
                  <th scope="col">Diajukan oleh</th>
                  <th scope="col">Status</th>
                  <th scope="col">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {merchantDisputes.map((dispute) => (
                  <tr key={dispute.id}>
                    <td className="sa-nowrap">
                      {dispute.orderCode}
                      <span className="sa-table-sub">{dispute.filedAt}</span>
                    </td>
                    <td>{dispute.category}</td>
                    <td>
                      {dispute.filedBy === 'merchant' ? 'Merchant' : 'Customer'}
                      <span className="sa-table-sub">{dispute.party}</span>
                    </td>
                    <td>
                      <span className="sa-chip">{disputeStatusLabel[dispute.status]}</span>
                      {dispute.appeal ? (
                        <span className="sa-table-sub">banding diajukan</span>
                      ) : null}
                    </td>
                    <td className="sa-nowrap">{jod(dispute.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="sa-note">
          Putusan level-1 dibuat panel CS. Yang naik banding ke SA muncul di halaman{' '}
          <code className="sa-code">/superadmin/appeals</code>.
        </p>
      </section>

      <section className="sa-card" id="ledger">
        <p className="sa-card-label">
          <BookOpen size={14} strokeWidth={1.75} aria-hidden="true" />
          Uang di ledger
        </p>
        {entries.length === 0 ? (
          <p className="sa-empty">Belum ada entry ledger yang menyebut merchant ini.</p>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th scope="col">Waktu</th>
                  <th scope="col">Jenis</th>
                  <th scope="col">Arah</th>
                  <th scope="col">Nominal</th>
                  <th scope="col">Ref</th>
                  <th scope="col">Memo</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="sa-nowrap">{entry.at}</td>
                    <td>{ledgerTypeLabel[entry.type]}</td>
                    <td>
                      <span
                        className={`sa-chip${entry.direction === 'credit' ? ' is-ok' : ' is-off'}`}
                      >
                        {entry.direction === 'credit' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="sa-nowrap">{jod(entry.amount)}</td>
                    <td className="sa-nowrap">{entry.ref}</td>
                    <td>{entry.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="sa-note">
          Ledger append-only, tidak ada yang bisa diubah dari layar mana pun. Daftar penuh ada di{' '}
          <code className="sa-code">/superadmin/ledger</code>.
        </p>
      </section>

      <section className="sa-card" id="sla">
        <p className="sa-card-label">
          <Clock size={14} strokeWidth={1.75} aria-hidden="true" />
          Alert SLA yang naik ke SA
        </p>
        {escalations.length === 0 ? (
          <p className="sa-empty">Tidak ada pengantaran merchant ini yang lewat SLA.</p>
        ) : (
          <ul className="sa-feed">
            {escalations.map((escalation) => (
              <li key={escalation.id}>
                <span className="sa-dot" aria-hidden="true" />
                <span className="sa-feed-copy">
                  <strong>{escalation.orderCode}</strong>
                  <span>{escalation.detail}</span>
                </span>
                <span className="sa-feed-at">{escalation.minutesLate} menit</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="sa-note">
        Halaman ini hanya baca. Suspend, blacklist COD, dan review tenant tetap kerja panel CS di{' '}
        <code className="sa-code">/admin/merchants</code>.
      </p>
      <div className="sa-actions">
        <Link className="sa-link" to="/audit">
          Audit trail aksi SA &amp; CS
        </Link>
        <Link className="sa-link" to="/appeals">
          Banding sengketa
        </Link>
      </div>
    </SuperAdminShell>
  )
}
