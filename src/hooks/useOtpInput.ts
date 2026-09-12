import { useRef, useState } from 'react'

/**
 * Digit-box state shared by the OTP / PIN screens: typing, paste, arrow keys,
 * plus the on-screen numpad the create-pin screen shows.
 */
export function useOtpInput(length: number) {
  const [values, setValues] = useState<string[]>(() => Array(length).fill(''))
  const refs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null))

  const isComplete = values.every((v) => v !== '')

  const focus = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index))
    refs.current[clamped]?.focus()
  }

  const setAt = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    setValues((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
  }

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits.length > 1) {
      // pasted a whole code
      setValues((prev) => {
        const next = [...prev]
        for (let i = 0; i < digits.length && index + i < length; i++) {
          next[index + i] = digits[i]
        }
        return next
      })
      focus(index + digits.length)
      return
    }
    setAt(index, raw)
    if (digits) focus(index + 1)
  }

  const handleKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !values[index]) focus(index - 1)
    if (key === 'ArrowLeft') focus(index - 1)
    if (key === 'ArrowRight') focus(index + 1)
  }

  const handleNumpadInput = (digit: string) => {
    const empty = values.findIndex((v) => v === '')
    if (empty === -1) return
    setAt(empty, digit)
    focus(empty + 1)
  }

  const handleNumpadBackspace = () => {
    for (let i = length - 1; i >= 0; i--) {
      if (values[i] !== '') {
        setAt(i, '')
        focus(i)
        return
      }
    }
  }

  return {
    values,
    refs,
    isComplete,
    handleChange,
    handleKeyDown,
    handleNumpadInput,
    handleNumpadBackspace,
  }
}
