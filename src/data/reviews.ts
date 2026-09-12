import type { Review } from '../types'

export const reviews: Review[] = [
  {
    id: '1',
    name: 'Dianne Russell',
    avatar: '/assets/img/reviewer/user1.png',
    rating: 4.5,
    text: 'Amazing! The burger was juicier and tastier than I expected. Perfectly grilled with fresh toppings. Highly recommend!',
  },
  {
    id: '2',
    name: 'Cody Fisher',
    avatar: '/assets/img/reviewer/user2.png',
    rating: 4.4,
    text: 'The burger was cooked to perfection. Loved the special sauce!',
  },
  {
    id: '3',
    name: 'Jacob Jones',
    avatar: '/assets/img/reviewer/user3.png',
    rating: 4.8,
    text: 'Even better than the pictures. The patty was flavorful and fresh.',
  },
  {
    id: '4',
    name: 'Esther Howard',
    avatar: '/assets/img/reviewer/user4.png',
    rating: 4.4,
    text: 'Delicious and perfectly sized. Great textures and flavors.',
  },
  {
    id: '5',
    name: 'Sarah Wilson',
    avatar: '/assets/img/reviewer/user5.png',
    rating: 5,
    text: "Absolutely fantastic! Best burger I've had in a long time.",
  },
  {
    id: '6',
    name: 'Michael Brown',
    avatar: '/assets/img/reviewer/user6.png',
    rating: 4.7,
    text: 'Great food and fast delivery! Really enjoyed it.',
  },
]

// The menu-detail screen renders its own four reviews with slightly different copy.
export const menuDetailReviews: Review[] = [
  {
    id: '1',
    name: 'Dianne Russell',
    avatar: '/assets/img/reviewer/user1.png',
    rating: 4.5,
    text: 'Amazing! The food was juicier and tastier than I expected. Perfectly prepared with fresh toppings. Highly recommend!',
  },
  {
    id: '2',
    name: 'Cody Fisher',
    avatar: '/assets/img/reviewer/user2.png',
    rating: 4.4,
    text: 'Cooked to perfection, and the flavors were spot on. Loved the special sauce — definitely coming back for more!',
  },
  {
    id: '3',
    name: 'Jacob Jones',
    avatar: '/assets/img/reviewer/user3.png',
    rating: 4.8,
    text: 'Incredible! Even better than the pictures. The flavors were so rich and the portion was generous. A must-try!',
  },
  {
    id: '4',
    name: 'Esther Howard',
    avatar: '/assets/img/reviewer/user4.png',
    rating: 4.4,
    text: 'Delicious, and the portion size was just right. Loved the combination of textures and flavors. Great job!',
  },
]
