import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, CreditCard, Globe, MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { useLeafletMap } from '../hooks/useLeafletMap'
import { mockMerchant } from '../data/merchant'
import { merchantStoreSchema, type MerchantStoreFormData } from '../lib/schemas'

const TIER_LABEL: Record<string, string> = { free: 'Gratis', pro: 'Pro' }

const DEFAULTS: MerchantStoreFormData = {
  name: mockMerchant.name,
  phone: '0811-2222-3333',
  address: 'Jl. Kebon Sirih No. 8, Jakarta Pusat',
}

export default function MerchantSettings() {
  useLeafletMap('merchant-map', 'preview', { single: true })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MerchantStoreFormData>({
    resolver: zodResolver(merchantStoreSchema),
    defaultValues: DEFAULTS,
  })

  const onSubmit = () => {
    toast.success('Setelan toko disimpan')
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <header className="merchant-header">
          <h1 className="merchant-title">Setelan toko</h1>
        </header>

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

          <div id="merchant-map" className="merchant-map" aria-label="Pratinjau lokasi toko" />

          <button type="submit" className="btn btn-primary btn-auth" disabled={isSubmitting}>
            Simpan perubahan
          </button>
        </form>

        <section className="merchant-card">
          <div className="merchant-row">
            <MapPin size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Koordinat</p>
              <p className="merchant-card-sub">
                {mockMerchant.lat.toFixed(5)}, {mockMerchant.lng.toFixed(5)}
              </p>
            </div>
          </div>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <Clock size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Jam operasional</p>
              <p className="merchant-card-sub">
                {mockMerchant.openTime} – {mockMerchant.closeTime}
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
            <CreditCard size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Rekening pencairan</p>
              <p className="merchant-card-sub">
                {mockMerchant.bank.name} · {mockMerchant.bank.account}
              </p>
              <p className="merchant-card-sub">a.n. {mockMerchant.bank.holder}</p>
            </div>
          </div>
        </section>

        <button type="button" className="merchant-btn-ghost merchant-signout">
          Keluar
        </button>
      </main>
      <MerchantBottomNav />
    </div>
  )
}
