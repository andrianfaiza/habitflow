import { Check, Pencil, Trash2 } from 'lucide-react'
import { StreakCounter } from './StreakCounter'
import { getColorTag } from '../../utils/constants'

// Single habit row with a daily check-in control and streak badge.
export function HabitCard({ habit, checkedToday, onToggle, onEdit, onDelete }) {
  // Supporting text e.g. "Target 8 Gelas".
  const targetText =
    habit.target && habit.target > 1
      ? `Target ${habit.target}${habit.unit ? ` ${habit.unit}` : ''}`
      : habit.description
  const color = getColorTag(habit.color, 'mint')

  return (
    <article
      className="m3-card group relative flex items-center gap-3 overflow-hidden rounded-3xl p-4 pl-5
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-m3-2"
    >
      {/* Color tag accent bar */}
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: color.hex }}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => onToggle(habit)}
        aria-label={checkedToday ? 'Batalkan check-in hari ini' : 'Check-in hari ini'}
        className={`m3-ripple flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2
          transition-all duration-200 ease-out active:scale-90 ${
            checkedToday
              ? 'border-primary bg-primary text-on-primary shadow-m3-1'
              : 'border-outline text-transparent hover:border-primary hover:bg-primary/10 active:bg-primary/20'
          }`}
      >
        <Check size={22} strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color.hex }}
            aria-hidden="true"
          />
          <h3 className="truncate text-sm font-medium text-on-surface">{habit.name}</h3>
          <StreakCounter streak={habit.currentStreak} />
        </div>
        {targetText ? (
          <p className="mt-0.5 truncate text-xs text-on-surface-variant">{targetText}</p>
        ) : null}
        {habit.bestStreak > 0 ? (
          <p className="mt-0.5 text-[11px] text-on-surface-variant">
            Rekor terbaik: {habit.bestStreak} hari
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(habit)}
          aria-label="Edit kebiasaan"
          className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(habit)}
          aria-label="Hapus kebiasaan"
          className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  )
}
