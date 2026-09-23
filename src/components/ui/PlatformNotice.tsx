import { AlertTriangle } from 'lucide-react'

interface PlatformNoticeProps {
  message: string
}

/**
 * Pemberitahuan jalur yang sedang ditutup kill switch platform (COD, payout,
 * maintenance). Dipakai lintas role, jadi komponennya satu: kalau tiap layar
 * menulis versinya sendiri, teks dan warnanya akan menyimpang.
 */
export function PlatformNotice({ message }: PlatformNoticeProps) {
  return (
    <p className="platform-notice" role="status">
      <AlertTriangle size={16} strokeWidth={1.75} aria-hidden="true" />
      <span>{message}</span>
    </p>
  )
}
