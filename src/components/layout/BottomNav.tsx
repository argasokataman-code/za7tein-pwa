import { Heart, House, ShoppingBag, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/home', label: 'Home', Icon: House },
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
          <Icon size={24} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
