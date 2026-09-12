import type { Category, Food } from '../types'

export const foods: Food[] = [
  {
    id: '1',
    name: 'Tandoori Pizza',
    price: 15,
    rating: 4.3,
    reviewCount: 27,
    deliveryTime: '15-30 min',
    distance: '1.3 km',
    discountPercent: 10,
    category: 'pizza',
    image: '/assets/img/menu-details/menu-details-thumb.png',
    description:
      'Delicious tandoori pizza with fresh toppings and our signature sauce. Prepared fresh to order with premium ingredients.',
    isPopular: true,
    calories: 520,
  },
  {
    id: '2',
    name: 'Chinese Fried Rice',
    price: 12,
    rating: 4.1,
    reviewCount: 45,
    deliveryTime: '20-35 min',
    distance: '2.1 km',
    discountPercent: 10,
    category: 'pasta',
    image: '/assets/img/onboarding-bg.jpg',
    description:
      'Authentic Chinese fried rice with vegetables and our special wok sauce.',
    isPopular: true,
  },
  {
    id: '3',
    name: 'Burger Deluxe',
    price: 18,
    rating: 4.7,
    reviewCount: 35,
    deliveryTime: '20-35 min',
    distance: '2.5 km',
    discountPercent: 15,
    category: 'burger',
    image: '/assets/img/onboarding-bg.jpg',
    description:
      'A premium burger stacked with fresh lettuce, tomato, double cheese, and our secret sauce.',
    isPopular: true,
  },
  {
    id: '4',
    name: 'Cheese Sizzling',
    price: 15,
    rating: 4.2,
    reviewCount: 92,
    deliveryTime: '15-30 min',
    distance: '1.3 km',
    category: 'burger',
    image: '/assets/img/onboarding-bg.jpg',
    description: 'Sizzling cheese burger with fresh vegetables and house sauce.',
    isPopular: true,
  },
  {
    id: '5',
    name: 'Classic Burger',
    price: 15,
    rating: 4.2,
    reviewCount: 92,
    deliveryTime: '15-30 min',
    distance: '1.3 km',
    category: 'burger',
    image: '/assets/img/onboarding-bg.jpg',
    description: 'Our classic beef burger with lettuce, tomato, and special sauce.',
    isPopular: true,
  },
  {
    id: '6',
    name: 'Pasta Carbonara',
    price: 13.5,
    rating: 4.6,
    reviewCount: 58,
    deliveryTime: '25-40 min',
    distance: '1.8 km',
    category: 'pasta',
    image: '/assets/img/onboarding-bg.jpg',
    description:
      'Classic Italian pasta carbonara with crispy pancetta, egg, parmesan and black pepper.',
    isPopular: true,
  },
]

export const categories: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burger', emoji: '🍔' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝' },
  { id: 'desserts', label: 'Desserts', emoji: '🍰' },
]

export const getFood = (id: string): Food | undefined => foods.find((f) => f.id === id)

export const deals = foods.filter((f) => f.discountPercent)
export const popular = foods.filter((f) => f.isPopular)
