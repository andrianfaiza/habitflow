import { LogOut, Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { useTheme } from '../../hooks/useTheme'
import { formatDisplayDate } from '../../utils/dateUtils'
import { Avatar } from '../common/Avatar'
import { NotificationBell } from './NotificationBell'
import { Navbar } from './Navbar'
import { Container } from './Container'

// Application header: brand, navigation, notifications and account actions
// (see design.md section 1).
export function Header() {
  const { isDark, toggleTheme } = useTheme()
  const { signOut } = useAuth()
  const { profile } = useProfile()

  const displayName = profile?.full_name || ''

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/90 backdrop-blur">
      <Container className="flex flex-col gap-2 py-3">
        {/* Top row: brand + actions */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="HabitFlow — Dashboard"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-m3-md bg-primary text-on-primary shadow-m3-1">
              {/* Simple flame mark representing the habit streak */}
              <span className="text-lg leading-none">🔥</span>
            </span>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-on-surface sm:text-base">HabitFlow</h1>
              <p className="hidden text-xs text-on-surface-variant sm:block">
                To Do List &amp; Habit Tracker
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton
              label={isDark ? 'Light mode' : 'Dark mode'}
              onClick={toggleTheme}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
            <NotificationBell />
            <Link
              to="/profile"
              aria-label="Open profile"
              title="Open profile"
              className="rounded-full transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Avatar size="sm" value={profile?.avatar_url} name={displayName || 'P'} />
            </Link>
            <IconButton label="Sign out" onClick={signOut}>
              <LogOut size={18} />
            </IconButton>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="-mx-1 overflow-x-auto lg:mx-0">
          <Navbar />
        </div>
      </Container>
    </header>
  )
}

function IconButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant"
    >
      {children}
    </button>
  )
}
