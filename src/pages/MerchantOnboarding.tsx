import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Store, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { DELIVERY_ZONES, zoneLabel } from '../data/merchant'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { imageFileError } from '../lib/image'
import { merchantStoreSchema, type MerchantStoreFormData } from '../lib/schemas'
import {
  removeMerchantLogo,
  setDeliveryConfig,
  setMerchantLogo,
  setStoreProfile,
} from '../store/slices/merchantSlice'
import type { MerchantDeliveryConfig } from '../types'

/**
 * Langkah 2 onboarding merchant (flow f16 `profil`): form profil toko setelah
 * signup. Mengisi foto (D1), identitas toko, dan konfigurasi pengiriman
 * (`deliveryConfig`), lalu submit → `/merchant/pending`.
 *
 * Tarif per-jarak / per-area belum final di PRD, jadi layar hanya menyimpan
 * ongkir tunggal yang sudah ada di seed dan menandai sisanya UNRESOLVED.
 * Tombol simpan benar-benar mengubah state, bukan toast kosong.
 */
export default function MerchantOnboarding() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const logo = useAppSelector((s) => s.merchant.logo)
  const savedConfig = useAppSelector((s) => s.merchant.deliveryConfig)

  const [config, setConfig] = useState<MerchantDeliveryConfig>(savedConfig)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const logoUrlRef = useRef<string | null>(null)
  useEffect(() => () => { if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current) }, [])

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
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MerchantStoreFormData>({
    resolver: zodResolver(merchantStoreSchema),
  })

  const toggleZone = (id: 'hijazi' | 'syimali') => {
    setConfig((prev) => ({
      ...prev,
      [id === 'hijazi' ? 'isActiveHijazi' : 'isActiveSyimali']:
        !(id === 'hijazi' ? prev.isActiveHijazi : prev.isActiveSyimali),
    }))
  }

  const onSubmit = (data: MerchantStoreFormData) => {
    if (!config.isActiveHijazi && !config.isActiveSyimali) {
      toast.error('Pilih minimal satu zona pengiriman')
      return
    }
    dispatch(setStoreProfile(data))
    dispatch(setDeliveryConfig(config))
    toast.success('Profil toko dikirim, menunggu persetujuan')
    navigate('/pending')
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Langkah 2 dari 2" title="Profil toko" />

        <form className="merchant-form" noValidate onSubmit={handleSubmit(onSubmit)}>
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
                className="merchant-btn-ghost"
                onClick={() => dispatch(removeMerchantLogo())}
              >
                <Trash2 size={16} strokeWidth={1.75} />
                Hapus foto
              </button>
            ) : null}
          </section>

          <section className="merchant-card merchant-form">
            <p className="merchant-card-title">Identitas toko</p>
            <div className="form-group">
              <label htmlFor="store-name" className="form-label">Nama toko</label>
              <input
                id="store-name"
                className={`form-control${errors.name ? ' error' : ''}`}
                {...register('name')}
              />
              {errors.name && <span className="error-message">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="store-phone" className="form-label">Nomor WhatsApp toko</label>
              <input
                id="store-phone"
                inputMode="tel"
                className={`form-control${errors.phone ? ' error' : ''}`}
                {...register('phone')}
              />
              {errors.phone && <span className="error-message">{errors.phone.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="store-address" className="form-label">Alamat toko</label>
              <input
                id="store-address"
                className={`form-control${errors.address ? ' error' : ''}`}
                {...register('address')}
              />
              {errors.address && <span className="error-message">{errors.address.message}</span>}
            </div>
          </section>

          <section className="merchant-card">
            <p className="merchant-card-title">Pengiriman</p>
            <p className="merchant-card-sub">
              Tentukan jangkauan dan ongkir. Tarif per jarak / per area belum final di PRD.
            </p>

            <div className="form-group">
              <span className="form-label">Mode jangkauan</span>
              <div className="merchant-onboarding-mode">
                <label>
                  <input
                    type="radio"
                    name="delivery-mode"
                    checked={config.mode === 'area'}
                    onChange={() => setConfig((prev) => ({ ...prev, mode: 'area' }))}
                  />
                  Area
                </label>
                <label>
                  <input
                    type="radio"
                    name="delivery-mode"
                    checked={config.mode === 'radius'}
                    onChange={() => setConfig((prev) => ({ ...prev, mode: 'radius' }))}
                  />
                  Radius
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="delivery-max" className="form-label">Jangkauan maksimum (km)</label>
              <input
                id="delivery-max"
                type="number"
                min={1}
                max={10}
                className="form-control"
                value={config.maxKm}
                onChange={(e) => setConfig((prev) => ({ ...prev, maxKm: Number(e.target.value) }))}
              />
            </div>

            <div className="form-group">
              <span className="form-label">Zona aktif</span>
              <div className="merchant-onboarding-zones">
                {DELIVERY_ZONES.map((zone) => {
                  const id = zone.id as 'hijazi' | 'syimali'
                  const checked = id === 'hijazi' ? config.isActiveHijazi : config.isActiveSyimali
                  return (
                    <label key={zone.id}>
                      <input type="checkbox" checked={checked} onChange={() => toggleZone(id)} />
                      {zoneLabel(zone.id)}
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="delivery-fee" className="form-label">Ongkir dasar (Rp)</label>
              <input
                id="delivery-fee"
                type="number"
                min={0}
                step={1000}
                className="form-control"
                value={config.ongkirIdr}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, ongkirIdr: Number(e.target.value) }))
                }
              />
            </div>
          </section>

          <button type="submit" className="btn btn-primary">
            Kirim untuk persetujuan
          </button>
        </form>
      </main>
    </div>
  )
}
