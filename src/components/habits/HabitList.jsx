import { Plus, Target } from 'lucide-react'
import { HabitCard } from './HabitCard'
import { EmptyState } from '../common/EmptyState'
import { Loader } from '../common/Loader'
import { Button } from '../common/Button'
import { todayKey } from '../../utils/dateUtils'

// Renders the habit list, with loading and empty states.
export function HabitList({ habits, logs, loading, onToggle, onEdit, onDelete, onAdd }) {
  if (loading) return <Loader label="Memuat kebiasaan..." />

  if (habits.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="Belum ada kebiasaan"
        description="Mulai bangun rutinitas pertamamu hari ini!"
        action={
          <Button size="sm" icon={Plus} onClick={onAdd}>
            Tambah Kebiasaan
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
