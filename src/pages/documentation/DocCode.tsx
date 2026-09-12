import { useRef, type ReactNode } from 'react'
import toast from 'react-hot-toast'

interface DocCodeProps {
  lang: string
  children: ReactNode
}

export function DocCode({ lang, children }: DocCodeProps) {
  const preRef = useRef<HTMLPreElement>(null)

  const copyCode = async () => {
    const code = preRef.current?.innerText ?? ''
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Copied to clipboard!')
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <div className="doc-code-wrap">
      <div className="doc-code-header">
        <span className="doc-code-lang">{lang}</span>
        <button className="doc-copy-btn" onClick={copyCode}>
          Copy
        </button>
      </div>
      <pre className="doc-pre" ref={preRef}>
        <code>{children}</code>
      </pre>
    </div>
  )
}
