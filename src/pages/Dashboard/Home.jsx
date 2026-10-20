import { useMemo, useState } from 'react'
import { CheckCircle2, Flame, Pin, Plus, Target } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { useProfile } from '../../hooks/useProfile'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { FilterChips } from '../../components/common/FilterChips'
import { TaskList } from '../../components/tasks/TaskList'
import { TaskForm } from '../../components/tasks/TaskForm'
import { PriorityFilter } from '../../components/tasks/PriorityFilter'
import { HabitList } from '../../components/habits/HabitList'
import { HabitForm } from '../../components/habits/HabitForm'
import { CONTENT_FILTERS, resolvePreferences } from '../../utils/constants'
import { getGreeting, todayKey } from '../../utils/dateUtils'
import { playCompletionSound } from '../../utils/soundUtils'

// Main dashboard combining the habit tracker and the to-do list.
export function Home() {
  const {
    tasks,
    tasksLoading,
    tasksError,
    addTask,
    updateTask,
    toggleTask,
    removeTask,
    habits,
    habitLogs,
    habitsLoading,
    habitsError,
    addHabit,
    updateHabit,
    removeHabit,
    toggleCheckIn,
  } = useData()
  const { profile } = useProfile()
  const preferences = resolvePreferences(profile?.preferences)

  const [contentFilter, setContentFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [taskModal, setTaskModal] = useState({ open: false, task: null })
  const [habitModal, setHabitModal] = useState({ open: false, habit: null })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [actionError, setActionError] = useState(null)

  const displayName = profile?.full_name?.trim() || 'Sahabat'

  // Daily progress summary.
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.is_completed).length
    const remaining = total - completed
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
    const streak = habits.reduce((max, habit) => Math.max(max, habit.currentStreak), 0)
    return { total, completed, remaining, percent, streak }
  }, [tasks, habits])

  // Apply the priority filter to the task list.
  const filteredTasks = useMemo(() => {
    if (priorityFilter === 'all') return tasks
    return tasks.filter((task) => task.priority === priorityFilter)
  }, [tasks, priorityFilter])

  const showHabits = contentFilter === 'all' || contentFilter === 'habits'
  const showTasks = contentFilter === 'all' || contentFilter === 'todo'

  const error = tasksError || habitsError || actionError

  // Plays the completion chime when the user enables it in Settings.
  function maybePlaySound() {
    if (preferences.sound.completionSound) playCompletionSound()
  }

  async function handleToggleTask(task) {
    try {
      setActionError(null)
      await toggleTask(task)
      if (!task.is_completed) maybePlaySound()
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleToggleHabit(habit) {
    try {
      setActionError(null)
      const checkedToday = habitLogs.some(
        (log) => log.habit_id === habit.id && log.completed_date === todayKey(),
      )
      await toggleCheckIn(habit)
      if (!checkedToday) maybePlaySound()
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function submitTask(payload) {
    if (taskModal.task) {
      await updateTask(taskModal.task.id, payload)
    } else {
      await addTask(payload)
    }
  }

  async function submitHabit(payload) {
    if (habitModal.habit) {
      await updateHabit(habitModal.habit.id, payload)
    } else {
      await addHabit(payload)
    }
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return
    try {
      setActionError(null)
      if (confirmDelete.type === 'task') {
        await removeTask(confirmDelete.item.id)
      } else {
        await removeHabit(confirmDelete.item.id)
      }
      setConfirmDelete(null)
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome section */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-on-surface sm:text-2xl">
            {getGreeting()}, {displayName} 👋
          </h2>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Yuk selesaikan target harianmu hari ini.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setTaskModal({ open: true, task: null })}>
          Tambah Tugas
        </Button>
      </section>

      {/* Daily progress summary card */}
      <section className="m3-card flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-primary-container/60 to-surface p-6 shadow-m3-2 sm:gap-10 sm:p-8 md:flex-row">
        <ProgressRing percent={stats.percent} />
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-semibold text-on-surface">Progres Hari Ini</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            {stats.total === 0
              ? 'Belum ada tugas. Mulai dengan menambah tugas pertamamu.'
              : `${stats.percent}% tugas hari ini telah selesai.`}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
            <StatChip icon={Flame} label={`${stats.streak} Hari Streak`} />
            <StatChip icon={CheckCircle2} label={`${stats.completed} Selesai`} />
            <StatChip icon={Pin} label={`${stats.remaining} Tersisa`} />
          </div>
        </div>
      </section>

      {error ? (
        <p className="animate-pop rounded-m3-sm bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      {/* Category filter chips */}
      <section className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          Tampilkan
        </span>
        <FilterChips options={CONTENT_FILTERS} value={contentFilter} onChange={setContentFilter} />
      </section>

      {/* Main content: two-column grid */}
      <section
        className={`grid grid-cols-1 gap-6 ${
          contentFilter === 'all' ? 'lg:grid-cols-2 lg:gap-8' : ''
        }`}
      >
        {showHabits ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                Pelacak Kebiasaan
              </h2>
              <Button
                size="sm"
                variant="tonal"
                icon={Target}
                onClick={() => setHabitModal({ open: true, habit: null })}
              >
                Kebiasaan
              </Button>
            </div>
            {/* Sub-row balances the priority filter on the right column */}
            <div className="flex min-h-[2.25rem] items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5 text-xs font-medium text-on-primary-container">
                <Flame size={14} className="text-tertiary" />
                {habits.length} kebiasaan • rekor {stats.streak} hari
              </span>
            </div>
            <HabitList
              habits={habits}
              logs={habitLogs}
              loading={habitsLoading}
              onToggle={handleToggleHabit}
              onEdit={(habit) => setHabitModal({ open: true, habit })}
              onDelete={(habit) => setConfirmDelete({ type: 'habit', item: habit })}
              onAdd={() => setHabitModal({ open: true, habit: null })}
            />
          </div>
        ) : null}

        {showTasks ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                Daftar Tugas
              </h2>
              <Button
                size="sm"
                variant="tonal"
                icon={Plus}
                onClick={() => setTaskModal({ open: true, task: null })}
              >
                Tugas
              </Button>
            </div>
            {/* Priority filter sits directly above the task column */}
            <PriorityFilter value={priorityFilter} onChange={setPriorityFilter} />
            <TaskList
              tasks={filteredTasks}
              loading={tasksLoading}
              onToggle={handleToggleTask}
              onEdit={(task) => setTaskModal({ open: true, task })}
              onDelete={(task) => setConfirmDelete({ type: 'task', item: task })}
              onAdd={() => setTaskModal({ open: true, task: null })}
            />
          </div>
        ) : null}
      </section>

      {/* Create / edit task */}
      <TaskForm
        key={taskModal.open ? `task-${taskModal.task?.id ?? 'new'}` : 'task-closed'}
        open={taskModal.open}
        initialTask={taskModal.task}
        onClose={() => setTaskModal({ open: false, task: null })}
        onSubmit={submitTask}
      />

      {/* Create / edit habit */}
      <HabitForm
        key={habitModal.open ? `habit-${habitModal.habit?.id ?? 'new'}` : 'habit-closed'}
        open={habitModal.open}
        initialHabit={habitModal.habit}
        onClose={() => setHabitModal({ open: false, habit: null })}
        onSubmit={submitHabit}
      />

      {/* Delete confirmation */}
      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={confirmDelete?.type === 'task' ? 'Hapus Tugas' : 'Hapus Kebiasaan'}
        footer={
          <>
            <Button variant="text" onClick={() => setConfirmDelete(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Hapus
            </Button>
          </>
        }
      >
        <p className="text-sm text-on-surface-variant">
          Yakin ingin menghapus{' '}
          <span className="font-medium text-on-surface">
            {confirmDelete?.item?.title ?? confirmDelete?.item?.name}
          </span>
          ? Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  )
}

// Circular percentage indicator used in the progress card.
function ProgressRing({ percent, size = 116, stroke = 12 }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-surface-variant"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-on-surface">
        {percent}%
      </span>
    </div>
  )
}

// Small statistic pill (streak / completed / remaining).
function StatChip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-on-surface-variant backdrop-blur">
      <Icon size={14} className="text-primary" />
      {label}
    </span>
  )
}
