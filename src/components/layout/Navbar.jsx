import { LayoutDashboard, Settings, User } from 'lucide-react'

// Primary navigation tabs (Dashboard / Profile / Settings).
const NAV_ITEMS = [
  { value: 'dashboard', label: 'Dasbor', icon: LayoutDashboard },
  { value: 'profile', label: 'Profil', icon: User },
  { value: 'settings', label: 'Pengaturan', icon: Settings },
]

export function Navbar({ currentView, onNavigate }) {
  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = item.value === currentView
        const Icon = item.icon
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onNavigate(item.value)}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 ${
              active
                ? 'bg-primary text-on-primary shadow-m3-1'
                : 'text-on-surface-variant hover:bg-primary-container/60 hover:text-on-primary-container'
            }`}
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
