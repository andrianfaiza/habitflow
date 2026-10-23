import { useMemo } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import 'react-activity-calendar/tooltips.css'
import { CalendarCheck, CalendarDays, Flame, Trophy } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { calculateStreaks } from '../../utils/streakUtils'
import {
  addDays,
  buildDateRange,
  formatDisplayDate,
  fromDateKey,
  todayKey,
} from '../../utils/dateUtils'

// GitHub-style green scale for the five activity levels (0-4).
const HEATMAP_THEME = {
  light: ['#e6efe7', '#c8e6c9', '#9bd3a1', '#4caf50', '#2e7d32'],
  dark: ['#1b241d', '#244a2e', '#2f7a43', '#43a95a', '#7bd88f'],
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Maps a daily check-in count to one of the five intensity levels.
function toLevel(count, maxCount) {
  if (count <= 0) return 0
  if (maxCount <= 1) return 3
  return Math.max(1, Math.min(4, Math.ceil((count / maxCount) * 4)))
}

// Habit contribution heatmap plus aggregate statistics for the last year.
export function HabitHeatmap({ logs = [] }) {
  const { isDark } = useTheme()

  const stats = useMemo(() => {
    const end = todayKey()
    const start = addDays(end, -364)

    // Count how many habits were checked in per day.
    const counts = new Map()
    logs.forEach((log) => {
      if (!log.completed_date) return
      counts.set(log.completed_date, (counts.get(log.completed_date) ?? 0) + 1)
    })

    const maxCount = Math.max(1, ...counts.values())
    const data = buildDateRange(start, end).map((date) => {
      const count = counts.get(date) ?? 0
      return { date, count, level: toLevel(count, maxCount) }
    })

    // Overall streak: a day counts when at least one habit was checked in.
    const { currentStreak, bestStreak } = calculateStreaks(
      logs.map((log) => log.completed_date),
    )

    return {
      data,
      totalCheckIns: logs.length,
      activeDays: counts.size,
      currentStreak,
      bestStreak,
    }
  }, [logs])

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <HeatStat icon={CalendarCheck} label="Total Check-ins" value={stats.totalCheckIns} />
        <HeatStat icon={CalendarDays} label="Active Days" value={stats.activeDays} />
        <HeatStat icon={Flame} label="Current Streak" value={`${stats.currentStreak} days`} />
        <HeatStat icon={Trophy} label="Best Streak" value={`${stats.bestStreak} days`} />
      </div>

      <div className="m3-scrollbar mt-5 overflow-x-auto pb-1">
        <ActivityCalendar
          data={stats.data}
          colorScheme={isDark ? 'dark' : 'light'}
          theme={HEATMAP_THEME}
          weekStart={1}
          blockSize={10}
          blockMargin={3}
          blockRadius={2}
          fontSize={11}
          showMonthLabels
          showWeekdayLabels={false}
          showColorLegend
          showTotalCount={false}
          labels={{
            months: MONTH_LABELS,
            weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            legend: { less: 'Less', more: 'More' },
          }}
          tooltips={{
            activity: {
              text: (activity) =>
                `${activity.count} check-ins • ${formatDisplayDate(fromDateKey(activity.date))}`,
            },
            colorLegend: { text: (level) => `Intensity ${level}` },
          }}
        />
      </div>

      <p className="mt-3 text-xs text-on-surface-variant">
        Each square represents one day. The color gets darker the more habits you
        checked in on that day.
      </p>
    </div>
  )
}

function HeatStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-base font-semibold leading-tight text-on-surface">{value}</p>
        <p className="truncate text-[11px] text-on-surface-variant">{label}</p>
      </div>
    </div>
  )
}
