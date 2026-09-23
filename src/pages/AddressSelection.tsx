import { Check, ChevronLeft, MoreVertical, Pencil, Plus, Star, Trash2 } from 'lucide-react'
// Alamat pengantaran. PRD mewajibkan gedung, lantai, dan unit, plus pin yang
// masih dalam radius 2 km dari toko — di luar itu checkout diblokir.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { AddressMapPicker } from '../components/customer/AddressMapPicker'
import { BottomSheet } from '../components/ui/BottomSheet'
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

export default function AddressSelection() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const selectedId = useAppSelector((s) => s.cart.selectedAddressId)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  // Kartu mana yang menunya terbuka. Satu tombol "opsi" per kartu, bukan tiga
  // tombol ikon kecil yang berjejal dan bersarang di dalam kontrol radio.
  const [menuId, setMenuId] = useState<string | null>(null)
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
  const menuAddress = addresses.find((a) => a.id === menuId) ?? null

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
    toast.success(`Alamat ${address.name} dihapus`)
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
                    <div className="address-row" key={a.id}>
                      {/* Radio asli: keyboard (Space/panah) jalan sendiri, dan
                          kartu jadi <label> supaya tidak ada kontrol bersarang
                          di dalam role="radio". */}
                      <input
                        type="radio"
                        id={`address-${a.id}`}
                        name="delivery-address"
                        className="sr-only"
                        checked={isSelected}
                        disabled={blocked}
                        onChange={() => dispatch(setAddress(a.id))}
                      />
                      <label
                        htmlFor={`address-${a.id}`}
                        className={`address-item${isSelected ? ' selected' : ''}${blocked ? ' address-item--blocked' : ''}`}
                        onClick={() => {
                          if (blocked) toast.error('Di luar area antar')
                        }}
                      >
                        <span className="address-radio" aria-hidden="true" />
                        <div className="address-info">
                          <span className="address-name">
                            {a.name}
                            {a.isDefault ? (
                              <span className="address-default-tag">
                                <Check size={12} strokeWidth={2.25} aria-hidden="true" />
                                Utama
                              </span>
                            ) : null}
                          </span>
                          <span className="address-text">{a.building}</span>
                          <span className="address-text">{a.floor} · {a.unit}</span>
                          {a.notes ? <span className="address-notes">{a.notes}</span> : null}
                          {/* Satu baris meta tanpa kapsul: sebelumnya badge zona
                              + teks ongkir menumpuk jadi dua pil. */}
                          <span className="address-meta">
                            {blocked
                              ? 'Di luar area antar'
                              : `Zona ${zone!.label} · ${formatDistance(a.distanceMeters)} · ongkir ${money(fee)}`}
                          </span>
                        </div>
                      </label>
                      <button
                        type="button"
                        className="address-menu-btn"
                        aria-label={`Opsi alamat ${a.name}`}
                        aria-haspopup="dialog"
                        onClick={() => setMenuId(a.id)}
                      >
                        <MoreVertical size={20} strokeWidth={1.75} />
                      </button>
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
                    Wajib diisi. Pin GPS saja tidak cukup untuk kurir menemukan pintu.
                  </p>
                  <AddressMapPicker
                    lat={pin.lat}
                    lng={pin.lng}
                    onMove={(lat, lng) => setPin({ lat, lng })}
                  />
                  <p className="addr-form-coverage" data-deliverable={pinDeliverable}>
                    {coverage.zone
                      ? `Zona ${zoneLabel(coverage.zone)} · ${formatDistance(coverage.distanceMeters)} dari toko · ongkir ${money(deliveryFeeFor(pinPoint))}`
                      : 'Di luar area antar. Geser pin ke dalam poligon zona'}
                  </p>
                  <div className="form-group-profile">
                    <label htmlFor="building" className="form-label">Nama Gedung / Tower</label>
                    <input id="building" className={`form-input-profile${errors.building ? ' error' : ''}`} placeholder="Green View Apartment, Tower A" {...register('building')} />
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

      <BottomSheet
        open={menuAddress !== null}
        title={menuAddress ? `Alamat ${menuAddress.name}` : ''}
        onClose={() => setMenuId(null)}
      >
        <div className="sheet-menu">
          <button
            type="button"
            className="sheet-menu__item"
            disabled={menuAddress?.isDefault}
            onClick={() => {
              if (menuAddress) onSetDefault(menuAddress)
              setMenuId(null)
            }}
          >
            <Star size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>Jadikan alamat utama</span>
            {menuAddress?.isDefault ? <span className="sheet-menu__note">Sudah utama</span> : null}
          </button>
          <button
            type="button"
            className="sheet-menu__item"
            onClick={() => {
              if (menuAddress) openEdit(menuAddress)
              setMenuId(null)
            }}
          >
            <Pencil size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>Ubah alamat</span>
          </button>
          <button
            type="button"
            className="sheet-menu__item sheet-menu__item--danger"
            onClick={() => {
              if (menuAddress) onDelete(menuAddress)
              setMenuId(null)
            }}
          >
            <Trash2 size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>Hapus alamat {menuAddress?.name}</span>
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
