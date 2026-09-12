import { z } from 'zod'

// Sa7tein memakai nomor HP sebagai identitas login (PRD bab 02), jadi email
// tidak lagi wajib. Pesan validasi memakai Bahasa Indonesia.

/** Nomor HP Indonesia: 08xx / +628xx / 628xx. */
export const phoneField = z
  .string()
  .min(1, 'Nomor HP wajib diisi')
  .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Format nomor HP tidak valid')

export const signInSchema = z.object({
  phone: phoneField,
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const signUpSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: phoneField,
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

// Merchant memakai email sebagai identitas, terpisah dari akun customer.
export const merchantSignInSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const merchantSignUpSchema = z.object({
  name: z.string().min(2, 'Nama toko minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: phoneField.optional().or(z.literal('')),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

// Item menu toko — halaman Menu & Stock.
export const merchantMenuItemSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  price: z.number().min(1000, 'Harga minimal Rp1.000'),
  category: z.string().min(2, 'Kategori wajib diisi'),
  stock: z.number().min(0, 'Stok tidak boleh negatif'),
})

// Profil toko — halaman Setelan merchant.
export const merchantStoreSchema = z.object({
  name: z.string().min(2, 'Nama toko minimal 2 karakter'),
  phone: phoneField,
  address: z.string().min(5, 'Alamat wajib diisi'),
})

export const forgotPasswordSchema = z.object({
  phone: phoneField,
})

export const createPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak sama',
    path: ['confirmPassword'],
  })

/**
 * Alamat apartemen. PRD mewajibkan gedung, lantai, dan unit — pin GPS saja
 * tidak cukup bagi kurir untuk menemukan pintu.
 */
export const apartmentSchema = z.object({
  building: z.string().min(3, 'Nama gedung / tower wajib diisi'),
  floor: z.string().min(1, 'Nomor lantai wajib diisi'),
  unit: z.string().min(1, 'Nomor unit wajib diisi'),
  notes: z.string().optional(),
})

// Masih dipakai halaman dompet lama.
export const cardSchema = z.object({
  cardHolder: z.string().min(2, 'Nama pemegang kartu wajib diisi'),
  cardNumber: z.string().min(16, 'Nomor kartu tidak valid'),
  cvv: z.string().min(3, 'CVV tidak valid').max(4),
  expiry: z.string().length(5, 'Isi masa berlaku MM/YY'),
})

export const billingSchema = z.object({
  street: z.string().min(3, 'Alamat wajib diisi'),
  city: z.string().min(2, 'Kota wajib diisi'),
  state: z.string().min(2, 'Provinsi wajib diisi'),
  zip: z.string().min(4, 'Kode pos wajib diisi'),
})

export const personalDataSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
  phone: phoneField,
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  dob: z.string().optional(),
  gender: z.string().optional(),
})

export type PhoneField = z.infer<typeof phoneField>
export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type MerchantSignInFormData = z.infer<typeof merchantSignInSchema>
export type MerchantSignUpFormData = z.infer<typeof merchantSignUpSchema>
export type MerchantMenuItemFormData = z.infer<typeof merchantMenuItemSchema>
export type MerchantStoreFormData = z.infer<typeof merchantStoreSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type CreatePasswordFormData = z.infer<typeof createPasswordSchema>
export type ApartmentFormData = z.infer<typeof apartmentSchema>
export type CardFormData = z.infer<typeof cardSchema>
export type BillingFormData = z.infer<typeof billingSchema>
export type PersonalDataFormData = z.infer<typeof personalDataSchema>
