import { Heart, ShoppingBag, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

/** Matches the original markup exactly — lucide's newer House also emits `lucide-home`. */
function HouseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-house"
      aria-hidden="true"
    >
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

const items = [
  { to: '/home', label: 'Home', Icon: HouseIcon },
  { to: '/checkout', label: 'My Order', Icon: ShoppingBag },
  { to: '/favorites', label: 'Favorites', Icon: Heart },
  { to: '/profile', label: 'Profile', Icon: User },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
