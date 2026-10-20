import { useCallback, useEffect, useMemo, useState } from 'react'
import { useData } from './useData'
import { useProfile } from './useProfile'
import { resolvePreferences } from '../utils/constants'
import { addDays, todayKey } from '../utils/dateUtils'

const READ_KEY = 'habitflow.notifications.read'
const DISMISSED_KEY = 'habitflow.notifications.dismissed'
const MAX_STORED = 200

function readStored(key) {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStored(key, value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value.slice(-MAX_STORED)))
  } catch {
    // Ignore storage quota / privacy errors.
  }
}

// Derives the notification list from real task and habit data and tracks
// read / dismissed state in localStorage.
export function useNotifications() {
  const { tasks, habits, habitLogs } = useData()
  const { profile } = useProfile()
  const preferences = useMemo(
    () => resolvePreferences(profile?.preferences),
    [profile?.preferences],
  )

  const [readIds, setReadIds] = useState(() => readStored(READ_KEY))
  const [dismissedIds, setDismissedIds] = useState(() => readStored(DISMISSED_KEY))

  useEffect(() => {
    writeStored(READ_KEY, readIds)
  }, [readIds])

  useEffect(() => {
    writeStored(DISMISSED_KEY, dismissedIds)
  }, [dismissedIds])

  const notifications = useMemo(() => {
    const items = []
    const today = todayKey()
    const tomorrow = addDays(today, 1)
    const prefs = preferences.notifications

    // 1. Tasks that are due today or tomorrow and are not completed.
    if (prefs.taskDeadlines) {
      tasks.forEach((task) => {
        if (task.is_completed || !task.due_date) return
        if (task.due_date === today) {
          items.push({
            id: `task-due:${task.id}:${today}`,
            type: 'task_due',
            tone: 'warning',
            title: 'Tugas jatuh tempo hari ini',
            message: task.title,
          })
        } else if (task.due_date === tomorrow) {
          items.push({
            id: `task-due:${task.id}:${tomorrow}`,
            type: 'task_due',
            tone: 'warning',
            title: 'Tugas jatuh tempo besok',
            message: task.title,
          })
        }
      })
    }

    if (prefs.habitReminders) {
      habits.forEach((habit) => {
        const checkedToday = habitLogs.some(
          (log) => log.habit_id === habit.id && log.completed_date === today,
        )

        // 2. Habits that have not been checked in today.
        if (!checkedToday) {
          items.push({
            id: `habit-pending:${habit.id}:${today}`,
            type: 'habit_pending',
            tone: 'info',
            title: 'Habit belum dicentang',
            message: `${habit.name} menunggu check-in hari ini.`,
          })
        }

        // 3. Streak achievements (3 days or more).
        if (habit.currentStreak >= 3) {
          items.push({
            id: `streak:${habit.id}:${habit.currentStreak}`,
            type: 'streak',
            tone: 'success',
            title: `${habit.currentStreak} hari berturut-turut! 🔥`,
            message: `Pertahankan streak "${habit.name}".`,
          })
        }
      })
    }

    return items.filter((item) => !dismissedIds.includes(item.id))
  }, [tasks, habits, habitLogs, preferences, dismissedIds])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !readIds.includes(item.id)).length,
    [notifications, readIds],
  )

  const markRead = useCallback((id) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev)
      notifications.forEach((item) => next.add(item.id))
      return [...next]
    })
  }, [notifications])

  const dismiss = useCallback((id) => {
    setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const clearAll = useCallback(() => {
    setDismissedIds((prev) => {
      const next = new Set(prev)
      notifications.forEach((item) => next.add(item.id))
      return [...next]
    })
  }, [notifications])

  return { notifications, unreadCount, markRead, markAllRead, dismiss, clearAll }
}
