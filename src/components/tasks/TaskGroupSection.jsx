import { useState } from 'react'
import { AlertCircle, CalendarClock, ChevronDown, ChevronRight, Sun } from 'lucide-react'
import { TaskCard } from './TaskCard'

// Visual treatment per group. The overdue group relies on the error container
// tokens so past due work is impossible to miss.
const GROUP_TONES = {
  overdue: {
    icon: AlertCircle,
    shell: 'border-error/40 bg-error-container/50',
    iconChip: 'bg-error/20 text-error',
    title: 'text-on-error-container',
    count: 'bg-error/15 text-error',
  },
  today: {
    icon: Sun,
    shell: 'border-primary/25 bg-primary-container/35',
    iconChip: 'bg-primary/20 text-primary',
    title: 'text-on-primary-container',
    count: 'bg-primary/15 text-primary',
  },
  upcoming: {
    icon: CalendarClock,
    shell: 'border-outline-variant bg-surface-variant/40',
    iconChip: 'bg-surface-variant text-on-surface-variant',
    title: 'text-on-surface',
    count: 'bg-surface-variant text-on-surface-variant',
  },
}

// Section header plus the task cards of a single smart view group.
export function TaskGroupSection({
  group,
  title,
  count = 0,
  countLabel,
  tasks = [],
  onToggle,
  onEdit,
  onDelete,
  collapsible = false,
  defaultOpen = true,
  emptyHint,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const tone = GROUP_TONES[group] ?? GROUP_TONES.today
  const Icon = tone.icon

  const heading = (
    <>
      <span
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone.iconChip}`}
      >
        <Icon size={15} />
      </span>
      <span className={`text-xs font-bold uppercase tracking-wide ${tone.title}`}>
        {title}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.count}`}
        title={countLabel}
        aria-label={countLabel}
      >
        {count}
      </span>
    </>
  )

  return (
    <section className={`rounded-3xl border p-3 ${tone.shell}`}>
      <div className="flex items-center gap-2 px-1.5 py-1">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            className="flex flex-1 items-center gap-2 rounded-2xl text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            {heading}
            <span className={`ml-auto shrink-0 ${tone.title}`}>
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </button>
        ) : (
          <div className="flex flex-1 items-center gap-2">{heading}</div>
        )}
      </div>

      {open ? (
        <div className="mt-2 flex flex-col gap-2.5">
          {tasks.length === 0 ? (
            emptyHint ? (
              <p className="px-3 py-2 text-xs text-on-surface-variant">{emptyHint}</p>
            ) : null
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      ) : null}
    </section>
  )
}
