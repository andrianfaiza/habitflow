import { ClipboardList, Plus } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { TaskGroupSection } from './TaskGroupSection'
import { EmptyState } from '../common/EmptyState'
import { Loader } from '../common/Loader'
import { Button } from '../common/Button'
import { useTranslation } from '../../i18n'
import { groupTasksByDueDate, hidePreviouslyCompleted, TASK_GROUPS } from '../../utils/taskGroups'
import { todayKey } from '../../utils/dateUtils'

// Renders the task list, with loading and empty states.
// In "smart view" mode the tasks are split into Overdue / Today / Upcoming
// groups; otherwise a plain single-day list is rendered.
export function TaskList({
  tasks = [],
  loading,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
  today = todayKey(),
  sessionCompletedIds = [],
  smartView = true,
  emptyTitle,
  emptyDescription,
}) {
  const { t } = useTranslation()

  if (loading) return <Loader label="Loading tasks..." />

  const groups = smartView
    ? groupTasksByDueDate(tasks, today, sessionCompletedIds)
    : null

  const visibleTasks = groups
    ? groups.overdue.length + groups.today.length + groups.upcoming.length
    : hidePreviouslyCompleted(tasks, sessionCompletedIds).length

  if (visibleTasks === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={
          emptyTitle ?? (smartView ? t('tasks.empty.title') : t('tasks.empty.singleDateTitle'))
        }
        description={
          emptyDescription ??
          (smartView ? t('tasks.empty.description') : t('tasks.empty.singleDateDescription'))
        }
        action={
          <Button size="sm" icon={Plus} onClick={onAdd}>
            Add Task
          </Button>
        }
      />
    )
  }

  // Plain list for a single selected day.
  if (!groups) {
    return (
      <div className="flex flex-col gap-3">
        {hidePreviouslyCompleted(tasks, sessionCompletedIds).map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Overdue work comes first so it is impossible to miss. */}
      {groups.overdue.length > 0 ? (
        <TaskGroupSection
          group={TASK_GROUPS.OVERDUE}
          title={t('tasks.groups.overdue')}
          count={groups.overdue.length}
          countLabel={t('tasks.groupCount.overdue', { count: groups.overdue.length })}
          tasks={groups.overdue}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : null}

      <TaskGroupSection
        group={TASK_GROUPS.TODAY}
        title={t('tasks.groups.today')}
        count={groups.today.length}
        countLabel={t('tasks.groupCount.today', { count: groups.today.length })}
        tasks={groups.today}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyHint={t('tasks.emptyGroup.today')}
      />

      {/* Upcoming tasks live in a collapsed accordion at the bottom. */}
      {groups.upcoming.length > 0 ? (
        <TaskGroupSection
          group={TASK_GROUPS.UPCOMING}
          title={t('tasks.groups.upcoming')}
          count={groups.upcoming.length}
          countLabel={t('tasks.groupCount.upcoming', { count: groups.upcoming.length })}
          tasks={groups.upcoming}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          collapsible
          defaultOpen={false}
        />
      ) : null}
    </div>
  )
}
