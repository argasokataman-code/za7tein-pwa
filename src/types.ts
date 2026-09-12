export interface Food {
  id: string
  name: string
  price: number
  rating: number
  reviewCount: number
  deliveryTime: string
  distance: string
  discountPercent?: number
  category: string
  image: string
  description: string
  isPopular?: boolean
  calories?: number
}

export interface Category {
  id: string
  label: string
  emoji?: string
}

export interface Review {
  id: string
  name: string
  avatar: string
  rating: number
  text: string
}

export interface Address {
  id: string
  name: string
  address: string
  city: string
  fullAddress: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  dob: string
  gender: string
  avatar: string
  addresses: Address[]
}

export interface Card {
  id: string
  brand: 'visa' | 'mastercard'
  last4: string
  holder: string
  expiry: string
  image: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}
