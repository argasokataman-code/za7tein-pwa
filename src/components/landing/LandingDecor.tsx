export function RouteDecor({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 220" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M12 176C104 176 128 44 232 44s128 132 232 132 148-96 164-132"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1 14"
      />
      <circle cx="12" cy="176" r="7" fill="currentColor" />
      <circle cx="232" cy="44" r="7" fill="currentColor" />
      <circle cx="464" cy="176" r="7" fill="currentColor" />
      <circle cx="628" cy="44" r="7" fill="currentColor" />
    </svg>
  )
}

export function DotMatrixDecor({ className }: { className?: string }) {
  const cols = 12
  const rows = 7
  const dots = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      dots.push(<circle key={`${x}-${y}`} cx={14 + x * 34} cy={14 + y * 34} r="2.5" fill="currentColor" />)
    }
  }
  return (
    <svg className={className} viewBox={`0 0 ${14 * 2 + (cols - 1) * 34} ${14 * 2 + (rows - 1) * 34}`} fill="none" aria-hidden="true" focusable="false">
      {dots}
    </svg>
  )
}

export function ClocheDecor({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 170" fill="none" aria-hidden="true" focusable="false">
      <path d="M24 132h192" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 132c0-42 34-76 76-76s76 34 76 76" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M120 56V40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="120" cy="34" r="6" fill="currentColor" />
      <path d="M12 132h216" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}
