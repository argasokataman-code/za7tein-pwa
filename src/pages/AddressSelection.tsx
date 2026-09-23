import { BriefcaseBusiness, Building2, ChevronLeft, House, Plus, Trash2, type LucideIcon } from 'lucide-react'
// Alamat pengantaran. PRD mewajibkan gedung, lantai, dan unit, plus pin yang
// masih dalam radius 2 km dari toko — di luar itu checkout diblokir.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { apartmentSchema, type ApartmentFormData } from '../lib/schemas'
import {
  DEFAULT_NEW_ADDRESS_PIN,
  deliveryFeeFor,
  formatDistance,
  isDeliverable,
  money,
  zoneFor,
} from '../data/merchant'
import { resolveCoverage } from '../data/zones'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockUser } from '../data/user'
import { addAddress, setAddress } from '../store/slices/cartSlice'
import type { Address } from '../types'

const ICONS: Record<string, LucideIcon> = {
  'tower-a': House,
  'tower-b': BriefcaseBusiness,
  'luar-zona': Building2,
}

function AddressIcon({ id }: { id: string }) {
  const Icon = ICONS[id] ?? House
  return <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
}

export default function AddressSelection() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const selectedId = useAppSelector((s) => s.cart.selectedAddressId)
  const [showForm, setShowForm] = useState(false)
  const stored = useAppSelector((s) => s.cart.addresses)
  const zones = useAppSelector((s) => s.superAdmin.zones)
  const addresses = stored?.length ? stored : mockUser.addresses

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApartmentFormData>({ resolver: zodResolver(apartmentSchema) })

  const selected = addresses.find((a) => a.id === selectedId) ?? addresses[0]
  const deliverable = selected ? isDeliverable(selected) : false

  const onAdd = (data: ApartmentFormData) => {
    const id = `addr-${addresses.length + 1}`
    // Zona & jarak dihitung poligon master SA, bukan angka tetap: di produksi ini
    // hasil server (F20), di repo ini `resolveCoverage` jadi stand-in-nya. Jadi
    // kalau SA menggeser poligon, alamat baru ikut berubah statusnya.
    const coverage = resolveCoverage(
      { lat: DEFAULT_NEW_ADDRESS_PIN.lat, lng: DEFAULT_NEW_ADDRESS_PIN.lng },
      zones,
    )
    const next: Address = {
      id,
      name: 'Alamat Baru',
      building: data.building,
      floor: data.floor,
      unit: data.unit,
      notes: data.notes ?? '',
      address: data.building,
      city: 'Jakarta Selatan',
      fullAddress: `${data.building} · ${data.floor} · ${data.unit}`,
      lat: DEFAULT_NEW_ADDRESS_PIN.lat,
      lng: DEFAULT_NEW_ADDRESS_PIN.lng,
      distanceMeters: coverage.distanceMeters,
      zone: coverage.zone,
    }
    dispatch(addAddress(next))
    dispatch(setAddress(id))
    reset()
    setShowForm(false)
    toast.success(
      coverage.zone
        ? 'Alamat ditambahkan'
        : 'Alamat ditambahkan, tapi di luar area antar',
    )
  }

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="address-selection-screen">
            <header className="address-selection-header">
              <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
                <ChevronLeft size={24} strokeWidth={1.75} />
              </button>
              <h1 className="address-selection-title">
                Alamat Pengantaran
              </h1>
            </header>
            <div className="address-selection-content">
              <div className="address-list" role="radiogroup" aria-label="Pilih alamat pengantaran">
                {addresses.map((a) => {
                  const zone = zoneFor(a)
                  const blocked = zone === null
                  const fee = deliveryFeeFor(a)
                  const isSelected = a.id === selected?.id
                  return (
                    <div
                      key={a.id}
                      className={`address-item${isSelected ? ' selected' : ''}${blocked ? ' address-item--blocked' : ''}`}
                      role="radio"
                      aria-checked={isSelected}
                      aria-disabled={blocked}
                      tabIndex={blocked ? -1 : 0}
                      onClick={() => {
                        if (blocked) {
                          toast.error('Di luar area antar')
                          return
                        }
                        dispatch(setAddress(a.id))
                      }}
                    >
                      <div className="address-icon-wrap">
                        <AddressIcon id={a.id} />
                      </div>
                      <div className="address-info">
                        <h3 className="address-name">
                          {a.name}
                        </h3>
                        <p className="address-text">
                          {a.building}
                        </p>
                        <p className="address-text">
                          {a.floor} · {a.unit}
                        </p>
                        {a.notes ? <p className="address-notes">{a.notes}</p> : null}
                        <p className="address-meta">
                          <span className={blocked ? 'zone-badge zone-badge--blocked' : 'zone-badge'}>
                            {blocked ? 'Di luar area antar' : `Zona ${zone!.label} · ${zone!.area}`}
                          </span>
                          <span className="zone-fee">
                            {blocked ? 'poligon atau jarak tidak lolos' : `${formatDistance(a.distanceMeters)} · ongkir ${money(fee)}`}
                          </span>
                        </p>
                      </div>
                      <div className="address-actions">
                        <button type="button" className="address-delete-btn" aria-label="Hapus alamat" onClick={(e) => { e.stopPropagation(); toast.success('Alamat dihapus') }}>
                          <Trash2 size={14} strokeWidth={1.75} />
                        </button>
                        <div className="address-radio-dot">
                          <div className={isSelected ? 'radio-outer radio-outer--active' : 'radio-outer'}>
                            {isSelected ? <div className="radio-inner" /> : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {showForm ? (
                <form className="addr-form" noValidate onSubmit={handleSubmit(onAdd)}>
                  <h2 className="addr-form-title">Detail Apartemen</h2>
                  <p className="addr-form-hint">
                    Wajib diisi — pin GPS saja tidak cukup untuk kurir menemukan pintu.
                  </p>
                  <div className="form-group-profile">
                    <label htmlFor="building" className="form-label">Nama Gedung / Tower</label>
                    <input id="building" className={`form-input-profile${errors.building ? ' error' : ''}`} placeholder="Green View Apartment — Tower A" {...register('building')} />
                    {errors.building ? <span className="error-message">{errors.building.message}</span> : null}
                  </div>
                  <div className="form-group-profile">
                    <label htmlFor="floor" className="form-label">Lantai</label>
                    <input id="floor" className={`form-input-profile${errors.floor ? ' error' : ''}`} placeholder="Lt 12" {...register('floor')} />
                    {errors.floor ? <span className="error-message">{errors.floor.message}</span> : null}
                  </div>
                  <div className="form-group-profile">
                    <label htmlFor="unit" className="form-label">Nomor Unit</label>
                    <input id="unit" className={`form-input-profile${errors.unit ? ' error' : ''}`} placeholder="Unit 1208" {...register('unit')} />
                    {errors.unit ? <span className="error-message">{errors.unit.message}</span> : null}
                  </div>
                  <div className="form-group-profile">
                    <label htmlFor="notes" className="form-label">Catatan Kurir</label>
                    <input id="notes" className="form-input-profile" placeholder="Titip lobi, lift kode #123" {...register('notes')} />
                  </div>
                  <div className="addr-form-actions">
                    <button type="button" className="btn-profile-outline" onClick={() => setShowForm(false)}>Batal</button>
                    <button type="submit" className="btn-profile-primary">Simpan Alamat</button>
                  </div>
                </form>
              ) : (
                <button type="button" className="add-address-btn" aria-label="Tambah alamat baru" onClick={() => setShowForm(true)}>
                  <Plus size={22} strokeWidth={1.75} />
                  <span>
                    Tambah Alamat
                  </span>
                </button>
              )}
            </div>
            <div className="address-selection-footer">
              <button
                type="button"
                className="proceed-btn"
                aria-label="Lanjut dengan alamat terpilih"
                disabled={!deliverable}
                onClick={() => navigate('/checkout')}
              >
                {deliverable ? 'Lanjut' : 'Di luar area antar'}
              </button>
            </div>
            <div className="home-indicator" />
          </div>
        </main>
      </div>
    </>
  )
}
