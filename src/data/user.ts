import type { Card, User } from '../types'

// Sample data shared with the Sa7tein merchant mockup so both projects tell the
// same story (see sa7tein/AGENTS.md — Aturan #7).
export const mockUser: User = {
  /** Record `cus-6` di registri customer (`src/data/people.ts`) — satu orang satu kunci. */
  id: 'cus-6',
  name: 'Dimas Ardianto',
  email: 'dimas@sa7tein.id',
  phone: '+62 812 3456 7890',
  phoneVerified: true,
  dob: 'November 24, 2000',
  gender: 'male',
  avatar: '/assets/img/profile.png',
  addresses: [
    {
      id: 'tower-a',
      name: 'Rumah',
      building: 'Green View Apartment — Tower A',
      floor: 'Lt 12',
      unit: 'Unit 1208',
      notes: 'Titip di resepsionis jika tidak ada.',
      address: 'Jl. Green View Raya No. 7',
      city: 'Jakarta Selatan',
      fullAddress: 'Green View Apartment — Tower A · Lt 12 · Unit 1208',
      lat: -6.257,
      lng: 106.7818,
      distanceMeters: 420,
      zone: 'hijazi',
    },
    {
      id: 'tower-b',
      name: 'Kantor',
      building: 'Green View Apartment — Tower B',
      floor: 'Lt 6',
      unit: 'Unit 610',
      notes: 'Lift kode #123, titip lobi.',
      address: 'Jl. Green View Raya No. 7',
      city: 'Jakarta Selatan',
      fullAddress: 'Green View Apartment — Tower B · Lt 6 · Unit 610',
      lat: -6.267,
      lng: 106.78,
      distanceMeters: 780,
      zone: 'syimali',
    },
    {
      id: 'luar-zona',
      name: 'Rumah Orang Tua',
      building: 'Komplek Melati Indah',
      floor: 'Lt 1',
      unit: 'Blok C2',
      notes: '',
      address: 'Jl. Melati Indah No. 22',
      city: 'Depok',
      fullAddress: 'Komplek Melati Indah · Blok C2',
      lat: -6.2816,
      lng: 106.78,
      distanceMeters: 2400,
      zone: null,
    },
  ],
}

export const mockCards: Card[] = [
  {
    id: '1',
    brand: 'visa',
    last4: '4291',
    holder: 'Dimas Ardianto',
    expiry: '09/27',
    image: '/assets/img/card/visa.png',
  },
  {
    id: '2',
    brand: 'mastercard',
    last4: '8834',
    holder: 'Dimas Ardianto',
    expiry: '03/28',
    image: '/assets/img/card/mastercard.png',
  },
]
