import { Flame } from 'lucide-react'

// Streak badge with a flame icon (e.g. "🔥 5").
export function StreakCounter({ streak = 0, className = '' }) {
  const active = streak > 0
  return (
    <span
      title={`${streak} days in a row`}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        active ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'
      } ${className}`}
    >
      <Flame size={13} className={active ? 'text-tertiary' : ''} />
      {streak}
    </span>
  )
}
