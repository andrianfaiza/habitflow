import { Calendar, Check, Clock, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '../common/Badge'
import {
  getColorTag,
  PRIORITY_BADGE_STYLES,
  PRIORITY_LABELS,
} from '../../utils/constants'
import { formatDueLabel, formatTime, isOverdue, isToday } from '../../utils/dateUtils'
import { useTranslation } from '../../i18n'

// Single task row with a completion checkbox, metadata and row actions.
export function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const { t } = useTranslation()
  const overdue = !task.is_completed && isOverdue(task.due_date)
  const dueToday = !task.is_completed && isToday(task.due_date)
  const color = getColorTag(task.color)

  return (
    <article
      className={`m3-card group relative flex gap-3 overflow-hidden rounded-3xl p-4 pl-5
        transition-all duration-300 hover:-translate-y-0.5 hover:shadow-m3-2 ${
          task.is_completed ? 'opacity-60' : ''
        } ${overdue ? '!border-error/40 !bg-error-container/25 ring-1 ring-inset ring-error/30' : ''}`}
    >
      {/* Color tag accent bar. It stays visible on completed cards as well. */}
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: color.hex }}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => onToggle(task)}
        aria-label={task.is_completed ? 'Mark as not completed' : 'Mark as completed'}
        className={`m3-ripple mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2
          transition-all duration-200 ease-out active:scale-90 ${
            task.is_completed
              ? 'border-primary bg-primary text-on-primary shadow-m3-1'
              : 'border-outline text-transparent hover:border-primary hover:bg-primary/10 active:bg-primary/20'
          }`}
      >
        <Check size={16} strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: color.hex }}
              aria-hidden="true"
            />
            <h3
              className={`text-sm font-medium ${
                task.is_completed ? 'text-on-surface-variant line-through' : 'text-on-surface'
              }`}
            >
              {task.title}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
              className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label="Delete task"
              className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {task.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{task.description}</p>
        ) : null}

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Badge className={PRIORITY_BADGE_STYLES[task.priority] ?? ''}>
            {PRIORITY_LABELS[task.priority] ?? task.priority}
          </Badge>

          {overdue ? (
            <Badge className="bg-error/15 text-error ring-1 ring-inset ring-error/30">
              {t('tasks.badge.overdue')}
            </Badge>
          ) : null}

          {task.due_date ? (
            <span
              className={`inline-flex items-center gap-1 text-xs ${
                overdue
                  ? 'font-medium text-error'
                  : dueToday
                    ? 'font-medium text-primary'
                    : 'text-on-surface-variant'
              }`}
            >
              <Calendar size={13} />
              {formatDueLabel(task.due_date)}
            </span>
          ) : null}

          {task.due_time ? (
            <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
              <Clock size={13} />
              {formatTime(task.due_time)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
