import type { MerchantReview } from '../types'

/**
 * Ulasan pembeli tentang menu toko, dari sudut pandang merchant.
 * Di luar PRD aktif — lihat docs/product/prd/milestones-irbid-mvp.md
 * (UNRESOLVED: FR-MC tidak menyebut ulasan/respons).
 */
export const merchantReviews: MerchantReview[] = [
  {
    id: 'mr-1',
    customerName: 'Rani',
    avatar: '/assets/img/reviewer/user1.png',
    rating: 5,
    text: 'Ayam gepreknya masih anget dan sambalnya nampol. Porsi nasi banyak, worth it.',
    foodId: 'mm-1',
    foodName: 'Ayam Geprek + Nasi',
    createdAt: '2 jam lalu',
  },
  {
    id: 'mr-2',
    customerName: 'Budi',
    avatar: '/assets/img/reviewer/user2.png',
    rating: 4,
    text: 'Mie gorengnya enak, tapi agak kurang asin buat seleraku. Pengiriman cepat.',
    foodId: 'mm-3',
    foodName: 'Mie Goreng Spesial',
    createdAt: '5 jam lalu',
  },
  {
    id: 'mr-3',
    customerName: 'Sinta',
    avatar: '/assets/img/reviewer/user3.png',
    rating: 5,
    text: 'Nasi uduk komplitnya mantap, tempe orek dan telurnya pas. Pesan lagi besok.',
    foodId: 'mm-2',
    foodName: 'Nasi Uduk Komplit',
    createdAt: 'kemarin',
  },
  {
    id: 'mr-4',
    customerName: 'Andre',
    avatar: '/assets/img/reviewer/user4.png',
    rating: 3,
    text: 'Sate ayamnya bumbu kacangnya enak, sayang datang sudah agak dingin.',
    foodId: 'mm-4',
    foodName: 'Sate Ayam (10 tusuk)',
    createdAt: 'kemarin',
  },
  {
    id: 'mr-5',
    customerName: 'Maya',
    avatar: '/assets/img/reviewer/user5.png',
    rating: 5,
    text: 'Es teh manisnya segar, manisnya pas nggak berlebihan. Cocok sama geprek.',
    foodId: 'mm-5',
    foodName: 'Es Teh Manis',
    createdAt: '2 hari lalu',
  },
  {
    id: 'mr-6',
    customerName: 'Dimas',
    avatar: '/assets/img/reviewer/user6.png',
    rating: 5,
    text: 'Sate ayamnya juicy dan porsinya besar. Bumbunya kental, bukan yang encer.',
    foodId: 'mm-4',
    foodName: 'Sate Ayam (10 tusuk)',
    createdAt: '3 hari lalu',
  },
  {
    id: 'mr-7',
    customerName: 'Tia',
    avatar: '/assets/img/reviewer/user1.png',
    rating: 4,
    text: 'Ayam gepreknya enak, sambal terpisah jadi bisa atur sendiri pedasnya.',
    foodId: 'mm-1',
    foodName: 'Ayam Geprek + Nasi',
    createdAt: '4 hari lalu',
  },
  {
    id: 'mr-8',
    customerName: 'Fajar',
    avatar: '/assets/img/reviewer/user2.png',
    rating: 4,
    text: 'Mie goreng spesialnya porsi pas, telurnya nggak pelit. Lumayan cepat sampai.',
    foodId: 'mm-3',
    foodName: 'Mie Goreng Spesial',
    createdAt: '5 hari lalu',
  },
]

/** Balasan awal supaya state "sudah dibalas" langsung terlihat. */
export const merchantReviewReplies: Record<string, string> = {
  'mr-1': 'Terima kasih, Kak Rani! Sambal kami memang digiling baru tiap pagi.',
}

const ALL_FILTER_ID = 'all'

export interface ReviewFilter {
  id: string
  label: string
}

/** Filter "Semua" plus satu entri per hidangan yang punya ulasan. */
export function reviewFilters(reviews: MerchantReview[]): ReviewFilter[] {
  const seen = new Map<string, string>()
  for (const review of reviews) {
    if (!seen.has(review.foodId)) seen.set(review.foodId, review.foodName)
  }
  return [
    { id: ALL_FILTER_ID, label: 'Semua' },
    ...[...seen].map(([id, label]) => ({ id, label })),
  ]
}

export function reviewsForFilter(reviews: MerchantReview[], filterId: string): MerchantReview[] {
  if (filterId === ALL_FILTER_ID) return reviews
  return reviews.filter((review) => review.foodId === filterId)
}

/** Rata-rata rating, satu desimal. */
export function averageRating(reviews: MerchantReview[]): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((total, review) => total + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export interface RatingBucket {
  stars: number
  count: number
  percent: number
}

/** Distribusi bintang 5 → 1 untuk bar ringkasan. */
export function ratingDistribution(reviews: MerchantReview[]): RatingBucket[] {
  const total = reviews.length
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => Math.round(review.rating) === stars).length
    return { stars, count, percent: total === 0 ? 0 : Math.round((count / total) * 100) }
  })
}
