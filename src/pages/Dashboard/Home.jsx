import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Flame, Pin, Plus, Target } from 'lucide-react'
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
import { TopbarCalendar } from '../../components/calendar/TopbarCalendar'
import { CONTENT_FILTERS, resolvePreferences } from '../../utils/constants'
import { formatShortDate, fromDateKey, getGreeting, todayKey } from '../../utils/dateUtils'
import { playCompletionSound } from '../../utils/soundUtils'

// Shared empty set so the session overlay keeps a stable identity.
const EMPTY_SET = new Set()

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
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [taskModal, setTaskModal] = useState({ open: false, task: null })
  const [habitModal, setHabitModal] = useState({ open: false, habit: null })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [actionError, setActionError] = useState(null)

  // Ids of the tasks completed during the current session. They keep their
  // "done" state (strikethrough, dimmed card) until the user switches the
  // selected day or reloads the app.
  const [sessionCompleted, setSessionCompleted] = useState(() => ({
    day: todayKey(),
    ids: new Set(),
  }))

  const displayName = profile?.full_name?.trim() || 'friend'
  const today = todayKey()
  const isTodayView = selectedDate === today
  const periodLabel = isTodayView ? 'Today' : formatShortDate(fromDateKey(selectedDate))

  // The overlay resets by itself once the calendar day rolls over.
  const sessionCompletedIds = useMemo(
    () => (sessionCompleted.day === today ? sessionCompleted.ids : EMPTY_SET),
    [sessionCompleted, today],
  )

  // Tasks for the selected calendar day. Today also shows overdue and
  // undated tasks that are still pending, so nothing gets lost.
  const dateScopedTasks = useMemo(() => {
    if (selectedDate === today) {
      return tasks.filter((task) => {
        if (!task.due_date) return !task.is_completed
        if (task.due_date === today) return true
        return task.due_date < today && !task.is_completed
      })
    }
    return tasks.filter((task) => task.due_date === selectedDate)
  }, [tasks, selectedDate, today])

  // Tasks rendered by the task list. The "Today" view feeds the smart view
  // (overdue + today + upcoming); any other date stays scoped to that day.
  const listTasks = useMemo(() => {
    if (selectedDate === today) return tasks
    return tasks.filter((task) => task.due_date === selectedDate)
  }, [tasks, selectedDate, today])

  const overdueCount = useMemo(
    () =>
      tasks.filter(
        (task) => !task.is_completed && task.due_date && task.due_date < today,
      ).length,
    [tasks, today],
  )

  // Progress summary for the selected day.
  const stats = useMemo(() => {
    const total = dateScopedTasks.length
    const completed = dateScopedTasks.filter((task) => task.is_completed).length
    const remaining = total - completed
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
    const streak = habits.reduce((max, habit) => Math.max(max, habit.currentStreak), 0)
    return { total, completed, remaining, percent, streak }
  }, [dateScopedTasks, habits])

  // Apply the priority filter to the task list.
  const filteredTasks = useMemo(() => {
    if (priorityFilter === 'all') return listTasks
    return listTasks.filter((task) => task.priority === priorityFilter)
  }, [listTasks, priorityFilter])

  const showHabits = contentFilter === 'all' || contentFilter === 'habits'
  const showTasks = contentFilter === 'all' || contentFilter === 'todo'

  const error = tasksError || habitsError || actionError

  // Plays the completion chime when the user enables it in Settings.
  function maybePlaySound() {
    if (preferences.sound.completionSound) playCompletionSound()
  }

  // Switching the selected day clears the completion feedback, so finished
  // tasks disappear from the list again.
  function handleSelectDate(key) {
    setSelectedDate(key)
    setSessionCompleted((prev) => ({ ...prev, ids: new Set() }))
  }

  async function handleToggleTask(task) {
    try {
      setActionError(null)
      const wasCompleted = Boolean(task.is_completed)
      await toggleTask(task)
      // Remember the completion so the card keeps its struck-through state
      // until the user switches the day or reloads the app.
      setSessionCompleted((prev) => {
        const ids = new Set(prev.ids)
        if (wasCompleted) ids.delete(task.id)
        else ids.add(task.id)
        return { ...prev, ids }
      })
      if (!wasCompleted) maybePlaySound()
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
            Let's complete your daily goals today.
          </p>
        </div>
      </section>

      {/* Topbar calendar + date filter */}
      <TopbarCalendar
        selectedDate={selectedDate}
        onSelect={handleSelectDate}
        tasks={tasks}
        habits={habits}
      />

      {/* Daily progress summary card */}
      <section className="m3-card flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-primary-container/60 to-surface p-6 shadow-m3-2 sm:gap-10 sm:p-8 md:flex-row">
        <ProgressRing percent={stats.percent} />
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-semibold text-on-surface">Progress {periodLabel}</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            {stats.total === 0
              ? isTodayView
                ? 'No tasks for today yet. Start by adding your first task.'
                : `No tasks due on ${periodLabel}.`
              : isTodayView
                ? `${stats.percent}% of today's tasks are done${
                    overdueCount > 0 ? ' (including overdue tasks).' : '.'
                  }`
                : `${stats.percent}% of the tasks on ${periodLabel} are done.`}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
            <StatChip icon={Flame} label={`${stats.streak} Day Streak`} />
            <StatChip icon={CheckCircle2} label={`${stats.completed} Completed`} />
            <StatChip icon={Pin} label={`${stats.remaining} Remaining`} />
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
          Show
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
                Habit Tracker
              </h2>
              <Button
                size="sm"
                variant="tonal"
                icon={Target}
                onClick={() => setHabitModal({ open: true, habit: null })}
              >
                Habits
              </Button>
            </div>
            {/* Sub-row balances the priority filter on the right column */}
            <div className="flex min-h-[2.25rem] items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5 text-xs font-medium text-on-primary-container">
                <Flame size={14} className="text-tertiary" />
                {habits.length} habits • best streak {stats.streak} days
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
                Task List
              </h2>
              <Button
                size="sm"
                variant="tonal"
                icon={Plus}
                onClick={() => setTaskModal({ open: true, task: null })}
              >
                Tasks
              </Button>
            </div>
            {/* Priority filter and the selected date context */}
            <div className="flex min-h-[2.25rem] flex-wrap items-center justify-between gap-2">
              <PriorityFilter value={priorityFilter} onChange={setPriorityFilter} />
              <div className="flex items-center gap-2">
                {isTodayView && overdueCount > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2.5 py-1 text-[11px] font-medium text-on-error-container">
                    <AlertCircle size={12} />
                    {overdueCount} overdue
                  </span>
                ) : null}
                <span className="text-[11px] font-medium text-on-surface-variant">
                  {periodLabel}
                </span>
              </div>
            </div>
            <TaskList
              tasks={filteredTasks}
              loading={tasksLoading}
              onToggle={handleToggleTask}
              onEdit={(task) => setTaskModal({ open: true, task })}
              onDelete={(task) => setConfirmDelete({ type: 'task', item: task })}
              onAdd={() => setTaskModal({ open: true, task: null })}
              today={today}
              sessionCompletedIds={sessionCompletedIds}
              smartView={isTodayView}
              emptyTitle={
                isTodayView ? 'No tasks today' : 'No tasks on this date'
              }
              emptyDescription={
                isTodayView
                  ? 'Create your first task to make your day more organized!'
                  : 'Pick another date or add a new task for this date.'
              }
            />
          </div>
        ) : null}
      </section>

      {/* Create / edit task */}
      <TaskForm
        key={taskModal.open ? `task-${taskModal.task?.id ?? 'new'}` : 'task-closed'}
        open={taskModal.open}
        initialTask={taskModal.task}
        defaultDate={selectedDate}
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
        title={confirmDelete?.type === 'task' ? 'Delete Task' : 'Delete Habit'}
        footer={
          <>
            <Button variant="text" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-on-surface-variant">
          Are you sure you want to delete{' '}
          <span className="font-medium text-on-surface">
            {confirmDelete?.item?.title ?? confirmDelete?.item?.name}
          </span>
          ? This action cannot be undone.
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
