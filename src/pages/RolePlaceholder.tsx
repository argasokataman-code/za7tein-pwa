import { Construction } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  courier: 'Kurir',
  admin: 'Super Admin',
}

interface RolePlaceholderProps {
  role: string
}

/**
 * Placeholder peran yang belum dibangun (kurir, super admin).
 *
 * URL-nya sudah disiapkan supaya tiap peran punya alamat dan manifest sendiri,
 * tapi layarnya belum ada. Hapus komponen ini ketika perannya mulai dibangun.
 */
export default function RolePlaceholder({ role }: RolePlaceholderProps) {
  const label = ROLE_LABELS[role] ?? role

  return (
    <div className="app-shell">
      <div className="setup-error">
        <div className="setup-error-icon">
          <Construction size={80} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="setup-error-title">Area {label}</h1>
        <p className="setup-error-text">
          Tampilan {label} belum dibangun. Alamatnya sudah disiapkan agar tiap peran
          punya URL dan instalasi PWA sendiri.
        </p>
        <div className="setup-error-actions">
          <a className="btn btn-primary" href="/">
            Kembali ke situs
          </a>
        </div>
      </div>
    </div>
  )
}
