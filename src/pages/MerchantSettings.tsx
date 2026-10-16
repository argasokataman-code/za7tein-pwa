import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Clock, CreditCard, Globe, ImagePlus, LocateFixed, MapPin, MapPinned, RefreshCw, Store, Trash2, Wallet } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { InstallAppCard } from '../components/ui/InstallAppCard'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { useLeafletMap } from '../hooks/useLeafletMap'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useAppUpdate } from '../hooks/useAppUpdate'
import { useMoney } from '../hooks/useMoney'
import { APP_VERSION } from '../data/appInfo'
import { MAX_MERCHANT_TAGS, MERCHANT_TAG_OPTIONS, mockMerchant } from '../data/merchant'
import {
  DISPUTE_RULES,
  INCIDENT_CATEGORIES,
  compensationForRule,
  punishmentForRule,
  rulesForMerchant,
} from '../data/rules'
import { imageFileError } from '../lib/image'
import { merchantStoreSchema, type MerchantStoreFormData } from '../lib/schemas'
import { logout } from '../store/slices/authSlice'
import {
  removeMerchantLogo,
  setMerchantLogo,
  setMerchantTags,
  setStoreProfile,
} from '../store/slices/merchantSlice'
import { toggleRule } from '../store/slices/rulesSlice'

const TIER_LABEL: Record<string, string> = { free: 'Gratis', pro: 'Pro' }

function categoryLabel(categoryId: string): string {
  return INCIDENT_CATEGORIES.find((category) => category.id === categoryId)?.label ?? categoryId
}

export default function MerchantSettings() {
  const { money } = useMoney()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { checking: checkingUpdate, checkForUpdate } = useAppUpdate()
  const [coords, setCoords] = useState({ lat: mockMerchant.lat, lng: mockMerchant.lng })
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [removePhotoOpen, setRemovePhotoOpen] = useState(false)

  const logo = useAppSelector((state) => state.merchant.logo)
  const storeName = useAppSelector((state) => state.merchant.storeName)
  const storePhone = useAppSelector((state) => state.merchant.storePhone)
  const storeAddress = useAppSelector((state) => state.merchant.storeAddress)
  const openTime = useAppSelector((state) => state.merchant.openTime)
  const closeTime = useAppSelector((state) => state.merchant.closeTime)
  const tags = useAppSelector((state) => state.merchant.tags)
  const walletBalance = useAppSelector((state) => state.payout.balance)
  const coverage = useAppSelector((state) => state.coverage)
  const ruleSelection = useAppSelector((state) => state.rules.selection)
  const selectedRules = rulesForMerchant(ruleSelection)
  const primaryAccount = useAppSelector(
    (state) => state.payout.accounts.find((a) => a.isPrimary) ?? state.payout.accounts[0],
  )
  const logoInputRef = useRef<HTMLInputElement>(null)
  // URL objek yang sedang dipakai; dilepas saat diganti / dihapus / unmount
  // supaya blob tidak menumpuk.
  const logoUrlRef = useRef<string | null>(null)
  useEffect(() => () => { if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current) }, [])

  // Pratinjau lokal dari berkas yang dipilih. Tidak ada unggahan sungguhan —
  // repo ini front-end saja (AGENTS.md §1).
  const onLogoPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const error = imageFileError(file)
    if (error) {
      toast.error(error)
      event.target.value = ''
      return
    }
    if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current)
    const url = URL.createObjectURL(file)
    logoUrlRef.current = url
    dispatch(setMerchantLogo(url))
    toast.success('Pratinjau foto diperbarui — belum diunggah')
  }

  const onLogoRemove = () => {
    if (logoUrlRef.current) {
      URL.revokeObjectURL(logoUrlRef.current)
      logoUrlRef.current = null
    }
    dispatch(removeMerchantLogo())
    toast.success('Foto dihapus dari sesi ini')
  }

  const { setPosition } = useLeafletMap('merchant-map', 'picker', {
    picker: {
      initial: [mockMerchant.lat, mockMerchant.lng],
      onMove: (lat, lng) => setCoords({ lat, lng }),
    },
  })

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Browser tidak mendukung lokasi')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPosition(latitude, longitude)
        toast.success('Lokasi saat ini dipakai')
      },
      () => toast.error('Akses lokasi ditolak — geser pin saja'),
      { enableHighAccuracy: true },
    )
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MerchantStoreFormData>({
    resolver: zodResolver(merchantStoreSchema),
    defaultValues: { name: storeName, phone: storePhone, address: storeAddress },
  })

  // Profil live tiba setelah render pertama (mock dulu, API menimpa). Tanpa ini
  // form terkunci pada nilai mock yang dibaca saat mount.
  useEffect(() => {
    reset({ name: storeName, phone: storePhone, address: storeAddress })
  }, [reset, storeName, storePhone, storeAddress])

  // Simpan mengubah state (bukan cuma toast "berhasil"), TAPI state itu hidup di
  // memori sesi: `api/` belum punya penulisan profil toko, dan slice `merchant`
  // tidak masuk whitelist persist. Karena itu toast-nya menyebut apa adanya —
  // sebelumnya berbunyi "Setelan toko disimpan" seolah sudah tersimpan ke server.
  const onSubmit = (data: MerchantStoreFormData) => {
    dispatch(setStoreProfile(data))
    toast.success('Tersimpan di sesi ini — belum tersimpan ke server')
  }

  // Keluar = keluar dari akun toko lalu kembali ke layar masuk merchant.
  // Tombol ini sebelumnya tidak punya handler sama sekali: bisa ditekan, tidak
  // melakukan apa pun (kontrol mati, senior-fe HG-06). Pola yang dipakai sama
  // dengan `Profile.tsx` — `logout()` dari authSlice, bukan state lokal baru.
  // Konfirmasi lewat BottomSheet karena ini aksi yang membuang sesi, dan
  // akibatnya ditulis apa adanya supaya tidak mengejutkan.
  // Tag toko (MER-03): dibatasi `MAX_MERCHANT_TAGS`. Tag yang belum ada di
  // daftar ops belum bisa diajukan (BE tak punya kolom usulan tag), jadi yang
  // bisa dipilih hanya tag yang sudah dikenal.
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      dispatch(setMerchantTags(tags.filter((t) => t !== tag)))
      return
    }
    if (tags.length >= MAX_MERCHANT_TAGS) {
      toast.error(`Maksimal ${MAX_MERCHANT_TAGS} tag`)
      return
    }
    dispatch(setMerchantTags([...tags, tag]))
  }

  const confirmSignOut = () => {
    dispatch(logout())
    setSignOutOpen(false)
    toast.success('Kamu sudah keluar dari akun toko')
    navigate('/signin')
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Profil & operasional" title="Setelan toko" />

        {/* Profil & foto di halaman ini belum punya jalur tulis ke BE: yang
            tersimpan cuma state sesi. Ditulis di muka supaya "Unggah foto" dan
            tombol simpan tidak terbaca sebagai penyimpanan permanen. */}
        <PlatformNotice
          message={
            'Profil toko (nama, nomor, alamat, foto) belum bisa disimpan ke server — backend belum punya endpoint tulisnya. Perubahan hanya berlaku selama sesi ini.'
          }
        />

        {/* Foto toko (field D1, f16). Unggah/Ganti/Hapus ditangani di sini dan
            langsung tersimpan ke store — tidak menunggu tombol simpan form teks. */}
        <section className="merchant-card">
          <p className="merchant-card-title">Foto toko</p>
          <p className="merchant-card-sub">Tampil sebagai identitas toko di halaman pelanggan.</p>
          <div className="merchant-image-field">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={onLogoPick}
            />
            {logo ? (
              <img className="merchant-form-thumb" src={logo} alt="Foto toko" width={64} height={64} />
            ) : (
              <span className="merchant-logo-empty" aria-hidden="true">
                <Store size={24} strokeWidth={1.75} />
              </span>
            )}
            <button
              type="button"
              className="merchant-btn-ghost"
              onClick={() => logoInputRef.current?.click()}
            >
              <ImagePlus size={16} strokeWidth={1.75} />
              {logo ? 'Ganti foto' : 'Unggah foto'}
            </button>
          </div>
          {logo ? (
            <button
              type="button"
              className="merchant-btn-ghost merchant-signout"
              onClick={() => setRemovePhotoOpen(true)}
            >
              <Trash2 size={16} strokeWidth={1.75} />
              Hapus foto
            </button>
          ) : null}
        </section>

        <form className="merchant-card merchant-form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nama toko
            </label>
            <input
              id="name"
              className={`form-control${errors.name ? ' error' : ''}`}
              {...register('name')}
            />
            {errors.name ? <span className="error-message">{errors.name.message}</span> : null}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Nomor HP
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              className={`form-control${errors.phone ? ' error' : ''}`}
              {...register('phone')}
            />
            {errors.phone ? <span className="error-message">{errors.phone.message}</span> : null}
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Alamat toko
            </label>
            <input
              id="address"
              className={`form-control${errors.address ? ' error' : ''}`}
              {...register('address')}
            />
            {errors.address ? (
              <span className="error-message">{errors.address.message}</span>
            ) : null}
          </div>

          <div id="merchant-map" className="merchant-map merchant-map--picker" aria-label="Pilih lokasi toko" />
          <p className="merchant-map-hint">Geser pin oranye untuk memilih titik lokasi toko.</p>
          <button type="button" className="merchant-locate" onClick={locateMe}>
            <LocateFixed size={16} strokeWidth={1.75} />
            Pakai lokasi saat ini
          </button>

          <button type="submit" className="btn btn-primary btn-auth" disabled={isSubmitting}>
            Simpan perubahan
          </button>
        </form>

        <section className="merchant-card">
          <p className="merchant-card-title">Tag toko</p>
          <p className="merchant-card-sub">
            Pelanggan menemukan toko lewat tag ({tags.length}/{MAX_MERCHANT_TAGS}). Tag baru perlu
            moderasi tim ops sebelum tampil ke pelanggan.
          </p>
          <div className="merchant-chip-row">
            {MERCHANT_TAG_OPTIONS.map((tag) => {
              const active = tags.includes(tag)
              const blocked = !active && tags.length >= MAX_MERCHANT_TAGS
              return (
                <button
                  key={tag}
                  type="button"
                  className={`merchant-chip${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  disabled={blocked}
                  onClick={() => toggleTag(tag)}
                >
                  {active ? <Check size={14} strokeWidth={2.5} aria-hidden="true" /> : null}
                  {tag}
                </button>
              )
            })}
          </div>
        </section>

        <section className="merchant-card">
          <p className="merchant-card-title">Rule sengketa</p>
          <p className="merchant-card-sub">
            Pilih rule yang diikuti toko ({selectedRules.length}/{DISPUTE_RULES.length}). Menurut §18
            pelanggan dan kurir pada order tokomu mengikuti rule yang sama, jadi pilihan ini berlaku
            untuk ketiganya. Isi rule dibuat tim ops lewat aplikasi internal; katalog di demo ini
            contoh bentuknya.
          </p>
          <div className="merchant-chip-row">
            {DISPUTE_RULES.map((rule) => {
              const active = ruleSelection.ruleIds.includes(rule.id)
              return (
                <button
                  key={rule.id}
                  type="button"
                  data-rule-id={rule.id}
                  className={`merchant-chip${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => dispatch(toggleRule(rule.id))}
                >
                  {active ? <Check size={14} strokeWidth={2.5} aria-hidden="true" /> : null}
                  {rule.name}
                </button>
              )
            })}
          </div>
          {selectedRules.length === 0 ? (
            <p className="merchant-card-sub">
              Belum ada rule dipilih. Insiden pada order tokomu belum punya rule yang berlaku.
            </p>
          ) : (
            selectedRules.map((rule) => {
              const compensation = compensationForRule(rule.id)
              const punishment = punishmentForRule(rule.id)
              return (
                <div key={rule.id} className="merchant-row">
                  <div>
                    <p className="merchant-card-title">
                      {rule.code} · {categoryLabel(rule.categoryId)}
                    </p>
                    <p className="merchant-card-sub">Mitigasi: {rule.mitigation}</p>
                    <p className="merchant-card-sub">
                      {compensation
                        ? `Kompensasi ke ${compensation.recipient}: ${compensation.form} (${compensation.formula})`
                        : 'Kompensasi: belum diatur ops'}
                    </p>
                    <p className="merchant-card-sub">
                      {punishment
                        ? `Punishment ke ${punishment.subject}: ${punishment.form} (${punishment.level})`
                        : 'Punishment: tidak ada'}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <MapPin size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Koordinat</p>
              <p className="merchant-card-sub">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            </div>
          </div>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <MapPinned size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="merchant-card-title">Area layanan</p>
              <p className="merchant-card-sub">
                {coverage.mode === 'radius'
                  ? `Radius ${((coverage.radiusMeters ?? 0) / 1000).toFixed(1)} km`
                  : `${coverage.polygons.length} area`}
              </p>
            </div>
          </div>
          <Link className="merchant-btn-ghost merchant-wallet-manage" to="/coverage">
            Atur area layanan
          </Link>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <Clock size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Jam operasional</p>
              <p className="merchant-card-sub">
                {openTime} – {closeTime}
              </p>
            </div>
          </div>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <Globe size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Paket {TIER_LABEL[mockMerchant.tier]}</p>
              <p className="merchant-card-sub">{mockMerchant.dailyLimit} order / hari</p>
            </div>
          </div>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <Wallet size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Saldo &amp; pencairan</p>
              <p className="merchant-card-sub">{money(walletBalance.available)}</p>
            </div>
          </div>
          <Link className="merchant-btn-ghost merchant-wallet-manage" to="/wallet">
            Buka dompet
          </Link>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <CreditCard size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Rekening pencairan</p>
              <p className="merchant-card-sub">
                {primaryAccount
                  ? `${primaryAccount.bankName} · ${primaryAccount.accountNumber}`
                  : 'Belum ada rekening tujuan'}
              </p>
              <p className="merchant-card-sub">
                {primaryAccount ? `a.n. ${primaryAccount.holderName}` : 'Tambahkan rekening dulu'}
              </p>
            </div>
          </div>
          <Link className="merchant-btn-ghost merchant-wallet-manage" to="/payout-accounts">
            Kelola rekening
          </Link>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <RefreshCw size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="merchant-card-title">Cek pembaruan</p>
              <p className="merchant-card-sub">Versi {APP_VERSION}</p>
            </div>
          </div>
          <button
            type="button"
            className="merchant-btn-ghost merchant-wallet-manage"
            onClick={checkForUpdate}
            disabled={checkingUpdate}
          >
            {checkingUpdate ? 'Memeriksa…' : 'Periksa sekarang'}
          </button>
        </section>

        <InstallAppCard />

        <button
          type="button"
          className="merchant-btn-ghost merchant-signout"
          onClick={() => setSignOutOpen(true)}
        >
          Keluar
        </button>

        <ConfirmSheet
          open={signOutOpen}
          title="Keluar dari akun toko?"
          body="Pesanan yang sedang berjalan tetap ada, tapi kamu harus masuk lagi untuk mengelolanya."
          confirmLabel="Keluar"
          onConfirm={confirmSignOut}
          onClose={() => setSignOutOpen(false)}
        />

        <ConfirmSheet
          open={removePhotoOpen}
          title="Hapus foto toko?"
          body="Foto toko kembali ke placeholder. Kamu bisa mengunggahnya lagi kapan saja."
          confirmLabel="Hapus foto"
          onConfirm={() => {
            onLogoRemove()
            setRemovePhotoOpen(false)
          }}
          onClose={() => setRemovePhotoOpen(false)}
        />
      </main>
      <MerchantBottomNav />
    </div>
  )
}
