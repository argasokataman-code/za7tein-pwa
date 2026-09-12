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
  formatDistance,
  isDeliverable,
  rupiah,
  zoneFor,
} from '../data/merchant'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockUser } from '../data/user'
import { addAddress, setAddress } from '../store/slices/cartSlice'
import type { Address } from '../types'

const ICONS: Record<string, string> = {
  'tower-a': 'lucide-house',
  'tower-b': 'lucide-briefcase',
  'luar-zona': 'lucide-building2 lucide-building-2',
}

function AddressIcon({ id }: { id: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`lucide ${ICONS[id] ?? 'lucide-house'}`}>
      <path d="M10 12h4" />
      <path d="M10 8h4" />
      <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
      <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
    </svg>
  )
}

export default function AddressSelection() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const selectedId = useAppSelector((s) => s.cart.selectedAddressId)
  const [showForm, setShowForm] = useState(false)
  const stored = useAppSelector((s) => s.cart.addresses)
  const addresses = stored?.length ? stored : mockUser.addresses

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApartmentFormData>({ resolver: zodResolver(apartmentSchema) })

  const selected = addresses.find((a) => a.id === selectedId) ?? addresses[0]
  const deliverable = selected ? isDeliverable(selected.distanceMeters) : false

  const onAdd = (data: ApartmentFormData) => {
    const id = `addr-${addresses.length + 1}`
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
      ...DEFAULT_NEW_ADDRESS_PIN,
    }
    dispatch(addAddress(next))
    dispatch(setAddress(id))
    reset()
    setShowForm(false)
    toast.success('Alamat ditambahkan')
  }

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="address-selection-screen">
            <header className="address-selection-header">
              <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h1 className="address-selection-title">
                Alamat Pengantaran
              </h1>
            </header>
            <div className="address-selection-content">
              <div className="address-list" role="radiogroup" aria-label="Pilih alamat pengantaran">
                {addresses.map((a) => {
                  const zone = zoneFor(a.distanceMeters)
                  const blocked = zone === null
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
                          toast.error(`Di luar jangkauan — maksimal 2 km`)
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
                            {blocked ? 'Di luar jangkauan' : `Zona ${zone!.id} · ${zone!.range}`}
                          </span>
                          <span className="zone-fee">
                            {blocked ? '> 2 km' : `${formatDistance(a.distanceMeters)} · ongkir ${rupiah(zone!.fee)}`}
                          </span>
                        </p>
                      </div>
                      <div className="address-actions">
                        <button type="button" className="address-delete-btn" aria-label="Hapus alamat" onClick={(e) => { e.stopPropagation(); toast.success('Alamat dihapus') }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 lucide-trash-2">
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
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
                {deliverable ? 'Lanjut' : 'Di luar jangkauan 2 km'}
              </button>
            </div>
            <div className="home-indicator" />
          </div>
        </main>
      </div>
      <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
