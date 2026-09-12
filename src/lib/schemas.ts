import { z } from 'zod'

// Recovered from the original app's src/lib/schemas.ts, messages included.

export const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// The sign-up screen validates a phone number, not a password confirmation —
// the in-app documentation still describes the older shape.
export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
})

export const createPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const cardSchema = z.object({
  cardHolder: z.string().min(2, 'Card holder name is required'),
  cardNumber: z.string().min(16, 'Enter a valid card number'),
  cvv: z.string().min(3, 'Enter a valid CVV').max(4),
  expiry: z.string().length(5, 'Enter expiry as MM/YY'),
})

export const billingSchema = z.object({
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(4, 'Zip code is required'),
})

export const personalDataSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Phone number is required'),
  dob: z.string().optional(),
  gender: z.string().optional(),
})

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type CreatePasswordFormData = z.infer<typeof createPasswordSchema>
export type CardFormData = z.infer<typeof cardSchema>
export type BillingFormData = z.infer<typeof billingSchema>
export type PersonalDataFormData = z.infer<typeof personalDataSchema>
