import type { Card, User } from '../types'

export const mockUser: User = {
  id: '1',
  name: 'Jenny Wilson',
  email: 'wilson@09gail.com',
  phone: '+1 - 304 555 0121',
  dob: 'November 24, 2000',
  gender: 'female',
  avatar: '/assets/img/profile.png',
  addresses: [
    {
      id: 'home',
      name: 'Home',
      address: '4517 Washington Ave.',
      city: 'Manchester, Kentucky 394',
      fullAddress: '4517 Washington Ave. Manchester, Kentucky 394',
    },
    {
      id: 'office',
      name: 'My Office',
      address: '4517 Washington Ave.',
      city: 'Manchester, Kentucky 394',
      fullAddress: '4517 Washington Ave. Manchester, Kentucky 394',
    },
  ],
}

export const mockCards: Card[] = [
  {
    id: '1',
    brand: 'visa',
    last4: '4291',
    holder: 'Jenny Wilson',
    expiry: '09/27',
    image: '/assets/img/card/visa.png',
  },
  {
    id: '2',
    brand: 'mastercard',
    last4: '8834',
    holder: 'Jenny Wilson',
    expiry: '03/28',
    image: '/assets/img/card/mastercard.png',
  },
]

export const paymentMethods = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'cash', label: 'Cash on Delivery', icon: '💵' },
  { id: 'googlepay', label: 'Google Pay', icon: '🅶' },
  { id: 'applepay', label: 'Apple Pay', icon: '' },
]
