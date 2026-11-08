import { Bike, Landmark, RefreshCw, Store, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { InstallAppCard } from '../components/ui/InstallAppCard'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useAppUpdate } from '../hooks/useAppUpdate'
import { useCourierOnline } from '../hooks/useCourierOnline'
import { useMoney } from '../hooks/useMoney'
import { isActiveTask } from '../data/courier'
import { QUICK_ENABLED, TIPS_ENABLED } from '../data/features'
import { courierTipsAvailable } from '../data/courierWallet'
import { APP_VERSION } from '../data/appInfo'
import { fetchStorefront } from '../api/catalog'
import { logout } from '../store/slices/authSlice'
import type { Storefront } from '../types'

export default function CourierProfile() {
  const { money } = useMoney()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { checking: checkingUpdate, checkForUpdate } = useAppUpdate()
  const { isOnline, toggle: toggleOnline } = useCourierOnline()
  const tasks = useAppSelector((s) => s.courier.tasks)
  const payouts = useAppSelector((s) => s.courier.payouts)
  const onboarding = useAppSelector((s) => s.courier.onboarding)
  const self = useAppSelector((s) => s.courier.self)
  const balanceAvailable = courierTipsAvailable(tasks, payouts)
  const active = tasks.filter(isActiveTask).length
  const courierKind = useAppSelector((s) => s.auth.courierKind)
  // Permukaan mitra hanya ada selama layanan partner/Quick hidup.
  const isPartner = QUICK_ENABLED && courierKind === 'partner'
  const partners = useAppSelector((s) => s.partner.partners)
  const selfId = useAppSelector((s) => s.partner.selfId)
  const partner = partners.find((p) => p.id === selfId)
  const [showLogout, setShowLogout] = useState(false)
  // Toko tempat kurir bekerja: dibaca dari `merchants` lewat `merchant_id` baris
  // `couriers`. Sebelumnya kartu ini mencetak toko seed (`mockMerchant`), jadi
  // kurir mana pun melihat "Warung Sate Pak Ali".
  const [store, setStore] = useState<Storefront | null>(null)
  const merchantId = self?.merchantId
  useEffect(() => {
    if (merchantId == null) return
    let alive = true
    fetchStorefront(String(merchantId))
      .then((row) => {
        if (alive && row) setStore(row)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [merchantId])

  // Identitas kurir toko dibaca dari baris BE `couriers` milik sesi ini; isian
  // onboarding jadi cadangan sebelum muatan pertama. Mitra memakai identitas
  // dari slice partner. Tak ada lagi baris kurir demo sebagai default.
  const name = isPartner
    ? (partner?.name ?? 'Kurir partner')
    : self?.name || onboarding?.name || 'Kurir'
  const phone = isPartner ? (partner?.phone ?? '') : self?.phone || onboarding?.phone || ''

  // Keluar = keluar dari akun lalu kembali ke layar masuk kurir. Memakai
  // `logout()` dari authSlice, sama seperti Profil customer dan Setelan merchant,
  // bukan state lokal baru.
  const handleLogout = () => {
    dispatch(logout())
    setShowLogout(false)
    navigate('/signin')
  }

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader eyebrow={isPartner ? 'Akun mitra' : 'Akun'} title="Profil" />

        <section className="courier-card courier-identity">
          <span className="courier-avatar" aria-hidden="true">
            <UserRound size={28} strokeWidth={1.75} />
          </span>
          <div>
            <p className="courier-card-title">{name}</p>
            <p className="courier-card-sub">{phone}</p>
          </div>
        </section>

        {!isPartner ? (
          <>
        <section className="courier-card">
          <div className="courier-row">
            <Bike size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="courier-card-title">
                {isOnline ? 'Siap menerima tugas' : 'Sedang tidak siap'}
              </p>
              <p className="courier-card-sub">{active} tugas berjalan</p>
            </div>
          </div>
          <button
            type="button"
            className={`courier-toggle ${isOnline ? 'is-on' : ''}`}
            onClick={toggleOnline}
          >
            {isOnline ? 'Jeda dulu' : 'Siap sekarang'}
          </button>
        </section>

        {/* Dompet kurir berisi saldo tips; disembunyikan saat `TIPS_ENABLED` false. */}
        {TIPS_ENABLED ? (
          <section className="courier-card">
            <div className="courier-row">
              <Landmark size={20} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <p className="courier-card-title">Dompet kurir</p>
                <p className="courier-card-sub">{money(balanceAvailable)} tips bisa ditarik</p>
              </div>
            </div>
            <Link className="btn btn-primary courier-wallet-cta" to="/wallet">
              Buka dompet
            </Link>
          </section>
        ) : null}

        {store ? (
          <section className="courier-card">
            <div className="courier-row">
              <Store size={20} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <p className="courier-card-title">{store.name}</p>
                <p className="courier-card-sub">
                  Buka {store.openTime}–{store.closeTime}
                </p>
              </div>
            </div>
            {/* Kurir toko eksklusif milik satu merchant (PRD bab 04). Aturan
                produk, bukan kalimat untuk kurir: tidak ditampilkan di demo. */}
          </section>
        ) : null}
          </>
        ) : null}

        <section className="courier-card">
          <div className="courier-row">
            <RefreshCw size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="courier-card-title">Cek pembaruan</p>
              <p className="courier-card-sub">Versi {APP_VERSION}</p>
            </div>
          </div>
          <button type="button" className="courier-toggle" onClick={checkForUpdate} disabled={checkingUpdate}>
            {checkingUpdate ? 'Memeriksa…' : 'Periksa sekarang'}
          </button>
        </section>

        <InstallAppCard />

        <div className="courier-logout">
          <button type="button" className="btn-logout" onClick={() => setShowLogout(true)}>
            Keluar
          </button>
        </div>

        <ConfirmSheet
          open={showLogout}
          title="Keluar dari akun kurir?"
          body="Kamu kembali ke layar masuk. Tugas yang sedang berjalan tetap tersimpan di perangkat."
          confirmLabel="Keluar"
          confirmClass="courier-btn-ghost"
          onConfirm={handleLogout}
          onClose={() => setShowLogout(false)}
        />
      </main>
      <CourierBottomNav />
    </div>
  )
}
