import { BriefcaseBusiness, Building2, Check, ChevronLeft, House, Pencil, Plus, Star, Trash2, type LucideIcon } from 'lucide-react'
// Alamat pengantaran. PRD mewajibkan gedung, lantai, dan unit, plus pin yang
// masih dalam radius 2 km dari toko — di luar itu checkout diblokir.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { AddressMapPicker } from '../components/customer/AddressMapPicker'
import { apartmentSchema, type ApartmentFormData } from '../lib/schemas'
import {
  DEFAULT_NEW_ADDRESS_PIN,
  deliveryFeeFor,
  formatDistance,
  isDeliverable,
  money,
  zoneFor,
  zoneLabel,
} from '../data/merchant'
import { resolveCoverage } from '../data/zones'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockUser } from '../data/user'
import {
  addAddress,
  removeAddress,
  setAddress,
  setDefaultAddress,
  updateAddress,
} from '../store/slices/cartSlice'
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
  const [editingId, setEditingId] = useState<string | null>(null)
  // Titik pin peta (flow f20). Default dari konstanta mock, digeser di form.
  const [pin, setPin] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_NEW_ADDRESS_PIN.lat,
    lng: DEFAULT_NEW_ADDRESS_PIN.lng,
  })
  const stored = useAppSelector((s) => s.cart.addresses)
  const zones = useAppSelector((s) => s.superAdmin.zones)
  const addresses = stored?.length ? stored : mockUser.addresses

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApartmentFormData>({ resolver: zodResolver(apartmentSchema) })

  const selected =
    addresses.find((a) => a.id === selectedId) ??
    addresses.find((a) => a.isDefault) ??
    addresses[0]
  const deliverable = selected ? isDeliverable(selected) : false

  // Zona & jarak dihitung dari poligon master SA, bukan angka tetap: di produksi
  // ini hasil server (F20), di repo ini `resolveCoverage` jadi stand-in-nya. Jadi
  // kalau SA menggeser poligon, titik pin di form ikut berubah statusnya.
  const coverage = resolveCoverage({ lat: pin.lat, lng: pin.lng }, zones)
  const pinPoint = { zone: coverage.zone, distanceMeters: coverage.distanceMeters }
  const pinDeliverable = isDeliverable(pinPoint)

  const openAdd = () => {
    setEditingId(null)
    setPin({ lat: DEFAULT_NEW_ADDRESS_PIN.lat, lng: DEFAULT_NEW_ADDRESS_PIN.lng })
    reset({
      building: '',
      floor: '',
      unit: '',
      notes: '',
      isDefault: !addresses.some((a) => a.isDefault),
    })
    setShowForm(true)
  }

  const openEdit = (address: Address) => {
    setEditingId(address.id)
    setPin({ lat: address.lat, lng: address.lng })
    reset({
      building: address.building,
      floor: address.floor,
      unit: address.unit,
      notes: address.notes,
      isDefault: address.isDefault,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    reset()
  }

  const onSubmit = (data: ApartmentFormData) => {
    const result = resolveCoverage({ lat: pin.lat, lng: pin.lng }, zones)
    if (editingId) {
      const current = addresses.find((a) => a.id === editingId)
      if (!current) return
      // Alamat utama tidak bisa dicabut tanpa menunjuk pengganti — biarkan
      // statusnya kalau checkbox tidak dicentang.
      const next: Address = {
        ...current,
        building: data.building,
        floor: data.floor,
        unit: data.unit,
        notes: data.notes ?? '',
        fullAddress: `${data.building} · ${data.floor} · ${data.unit}`,
        lat: pin.lat,
        lng: pin.lng,
        distanceMeters: result.distanceMeters,
        zone: result.zone,
        isDefault: Boolean(data.isDefault) || current.isDefault,
      }
      dispatch(updateAddress(next))
      toast.success('Alamat diperbarui')
    } else {
      // Id diturunkan dari daftar yang ada (murni), bukan dari jam — supaya
      // tidak tabrakan setelah alamat dihapus.
      const nextNumber =
        addresses.reduce((max, a) => {
          const n = Number(a.id.split('-')[1])
          return Number.isFinite(n) ? Math.max(max, n) : max
        }, 0) + 1
      const id = `addr-${nextNumber}`
      const next: Address = {
        id,
        name: 'Alamat Baru',
        isDefault: Boolean(data.isDefault),
        building: data.building,
        floor: data.floor,
        unit: data.unit,
        notes: data.notes ?? '',
        address: data.building,
        city: 'Jakarta Selatan',
        fullAddress: `${data.building} · ${data.floor} · ${data.unit}`,
        lat: pin.lat,
        lng: pin.lng,
        distanceMeters: result.distanceMeters,
        zone: result.zone,
      }
      dispatch(addAddress(next))
      if (data.isDefault) dispatch(setDefaultAddress(id))
      else dispatch(setAddress(id))
      toast.success(
        result.zone ? 'Alamat ditambahkan' : 'Alamat ditambahkan, tapi di luar area antar',
      )
    }
    closeForm()
  }

  const onDelete = (address: Address) => {
    dispatch(removeAddress(address.id))
    toast.success('Alamat dihapus')
  }

  const onSetDefault = (address: Address) => {
    dispatch(setDefaultAddress(address.id))
    toast.success('Alamat utama diperbarui')
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
                      onKeyDown={(e) => {
                        // Kartu ini role="radio" dan bisa di-tab; tanpa ini
                        // Enter/Space tidak melakukan apa pun.
                        if (e.key !== 'Enter' && e.key !== ' ') return
                        e.preventDefault()
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
                          {a.isDefault ? (
                            <span className="address-default-badge">
                              <Check size={12} strokeWidth={2.25} aria-hidden="true" />
                              Utama
                            </span>
                          ) : null}
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
                        {!a.isDefault ? (
                          <button
                            type="button"
                            className="address-default-btn"
                            aria-label={`Jadikan ${a.name} alamat utama`}
                            onClick={(e) => {
                              e.stopPropagation()
                              onSetDefault(a)
                            }}
                          >
                            <Star size={14} strokeWidth={1.75} />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="address-edit-btn"
                          aria-label={`Ubah alamat ${a.name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            openEdit(a)
                          }}
                        >
                          <Pencil size={14} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          className="address-delete-btn"
                          aria-label={`Hapus alamat ${a.name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(a)
                          }}
                        >
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
                <form className="addr-form" noValidate onSubmit={handleSubmit(onSubmit)}>
                  <h2 className="addr-form-title">
                    {editingId ? 'Ubah Alamat' : 'Detail Apartemen'}
                  </h2>
                  <p className="addr-form-hint">
                    Wajib diisi — pin GPS saja tidak cukup untuk kurir menemukan pintu.
                  </p>
                  <AddressMapPicker
                    lat={pin.lat}
                    lng={pin.lng}
                    onMove={(lat, lng) => setPin({ lat, lng })}
                  />
                  <p className="addr-form-coverage" data-deliverable={pinDeliverable}>
                    {coverage.zone
                      ? `Zona ${zoneLabel(coverage.zone)} · ${formatDistance(coverage.distanceMeters)} dari toko · ongkir ${money(deliveryFeeFor(pinPoint))}`
                      : 'Di luar area antar — geser pin ke dalam poligon zona'}
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
                  <label className="addr-form-check">
                    <input type="checkbox" {...register('isDefault')} />
                    <span>Jadikan alamat utama</span>
                  </label>
                  <div className="addr-form-actions">
                    <button type="button" className="btn-profile-outline" onClick={closeForm}>Batal</button>
                    <button type="submit" className="btn-profile-primary">
                      {editingId ? 'Simpan Perubahan' : 'Simpan Alamat'}
                    </button>
                  </div>
                </form>
              ) : (
                <button type="button" className="add-address-btn" aria-label="Tambah alamat baru" onClick={openAdd}>
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
