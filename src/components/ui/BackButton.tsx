import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  to?: string
  className?: string
  label?: string
}

export function BackButton({ to, className = '', label = 'Go back' }: BackButtonProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className={`back-button ${className}`.trim()}
      aria-label={label}
      onClick={() => (to ? navigate(to) : navigate(-1))}
    >
      <ChevronLeft size={24} />
    </button>
  )
}
