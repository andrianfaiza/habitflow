// Smart task grouping used by the dashboard task list.
//
// Every task ends up in exactly one bucket relative to "today":
//   - OVERDUE:  past due and still open, so it needs attention right away.
//   - TODAY:    due today, plus undated open tasks and tasks that were
//               completed during the current session.
//   - UPCOMING: due in the future.
//
// Tasks that were already completed before the current session are hidden:
// the "checked off" feedback only lasts until the user switches the selected
// day or reloads the app.

export const TASK_GROUPS = {
  OVERDUE: 'overdue',
  TODAY: 'today',
  UPCOMING: 'upcoming',
}

// Rendering order of the smart view (top to bottom).
export const TASK_GROUP_ORDER = [
  TASK_GROUPS.OVERDUE,
  TASK_GROUPS.TODAY,
  TASK_GROUPS.UPCOMING,
]

// Normalises the session overlay into a Set.
function toIdSet(ids) {
  if (!ids) return new Set()
  if (ids instanceof Set) return ids
  return new Set(ids)
}

// Splits a task list into the smart view buckets.
// `today` is a "YYYY-MM-DD" key, `sessionCompletedIds` holds the ids of the
// tasks that were completed during the current session.
export function groupTasksByDueDate(tasks = [], today, sessionCompletedIds = []) {
  const sessionCompleted = toIdSet(sessionCompletedIds)

  const groups = {
    [TASK_GROUPS.OVERDUE]: [],
    [TASK_GROUPS.TODAY]: [],
    [TASK_GROUPS.UPCOMING]: [],
  }

  tasks.forEach((task) => {
    // Completed before this session: hidden until the day changes or reload.
    if (task.is_completed && !sessionCompleted.has(task.id)) return

    // Past due and still open.
    if (!task.is_completed && task.due_date && task.due_date < today) {
      groups[TASK_GROUPS.OVERDUE].push(task)
      return
    }

    // Scheduled for a later day.
    if (task.due_date && task.due_date > today) {
      groups[TASK_GROUPS.UPCOMING].push(task)
      return
    }

    // Due today, undated, or completed during this session.
    groups[TASK_GROUPS.TODAY].push(task)
  })

  return groups
}

// Drops the tasks that were already completed before the current session.
// Used by the plain single-day list so the rule stays the same everywhere.
export function hidePreviouslyCompleted(tasks = [], sessionCompletedIds = []) {
  const sessionCompleted = toIdSet(sessionCompletedIds)
  return tasks.filter((task) => !(task.is_completed && !sessionCompleted.has(task.id)))
}

// True when the task is part of the "overdue" bucket.
export function isOverdueTask(task, today) {
  if (!task || task.is_completed) return false
  return Boolean(task.due_date && task.due_date < today)
}
