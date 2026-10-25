import { Plus, Target } from 'lucide-react'
import { HabitCard } from './HabitCard'
import { HabitCardSkeleton } from './HabitCardSkeleton'
import { EmptyState } from '../common/EmptyState'
import { Loader } from '../common/Loader'
import { Button } from '../common/Button'
import { useTranslation } from '../../i18n'
import { todayKey } from '../../utils/dateUtils'

// Renders the habit list, with loading and empty states.
export function HabitList({ habits, logs, loading, onToggle, onEdit, onDelete, onAdd }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <HabitCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title={t('habits.emptyTitle')}
        description={t('habits.emptyDescription')}
        action={
          <Button size="sm" icon={Plus} onClick={onAdd}>
            {t('habits.addHabit')}
          </Button>
        }
      />
    )
  }

  const today = todayKey()

  return (
    <div className="flex flex-col gap-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          checkedToday={logs.some(
            (log) => log.habit_id === habit.id && log.completed_date === today,
          )}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
