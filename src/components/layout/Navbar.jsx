import { LayoutDashboard, Settings, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

// Primary navigation tabs mapped to URL routes.
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Navbar() {
  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 ${
                isActive
                  ? 'bg-primary text-on-primary shadow-m3-1'
                  : 'text-on-surface-variant hover:bg-primary-container/60 hover:text-on-primary-container'
              }`
            }
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
