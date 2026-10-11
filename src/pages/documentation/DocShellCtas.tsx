import { DOC_SHELLS, docShellHref, docShellLabel, type DocShell } from './routes'

/**
 * Kartu CTA "akses cepat per peran". Satu tempat untuk tiga pemakai (hero
 * /documentation, section Pages & Routes, dan Introduction) supaya URL pendek
 * per peran tak disalin-tempel berkali-kali dan tak bisa lepas sinkron.
 *
 * `filter` menyaring baris — Introduction cuma menampilkan peran yang punya
 * host pendek (empat PWA), sisanya (Super Admin, Landing) tak ditampilkan.
 */
export function DocShellCtas({ filter }: { filter?: (shell: DocShell) => boolean }) {
  const shells = filter ? DOC_SHELLS.filter(filter) : DOC_SHELLS
  return (
    <div className="doc-cta-grid">
      {shells.map((s) => (
        <a
          key={s.role}
          className="doc-cta"
          href={docShellHref(s)}
          target="_blank"
          rel="noreferrer"
        >
          <span className="doc-cta-role">{s.role}</span>
          <span className="doc-cta-url">{docShellLabel(s)}</span>
          <span className="doc-card-sub">{s.desc}</span>
        </a>
      ))}
    </div>
  )
}
