import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'
import * as habitService from '../services/habitService'
import { calculateStreaks } from '../utils/streakUtils'
import { todayKey } from '../utils/dateUtils'

// Manages habits and their daily logs, and derives streak stats per habit.
export function useHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!user) {
      setHabits([])
      setLogs([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [nextHabits, nextLogs] = await Promise.all([
        habitService.fetchHabits(user.id),
        habitService.fetchHabitLogs(user.id),
      ])
      setHabits(nextHabits)
      setLogs(nextLogs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // Fetch habits and logs on mount and whenever the user changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  // Habit list enriched with computed current/best streaks.
  const habitsWithStats = useMemo(() => {
    return habits.map((habit) => {
      const habitLogs = logs
        .filter((log) => log.habit_id === habit.id)
        .map((log) => log.completed_date)
      const { currentStreak, bestStreak } = calculateStreaks(habitLogs)
      return { ...habit, currentStreak, bestStreak }
    })
  }, [habits, logs])

  const addHabit = useCallback(
    async (payload) => {
      const created = await habitService.createHabit(user.id, payload)
      setHabits((prev) => [...prev, created])
      return created
    },
    [user],
  )

  const updateHabit = useCallback(
    async (id, payload) => {
      const snapshot = habits
      setHabits((prev) => prev.map((habit) => (habit.id === id ? { ...habit, ...payload } : habit)))
      try {
        await habitService.updateHabit(id, payload)
      } catch (err) {
        setHabits(snapshot) // Rollback.
        throw err
      }
    },
    [habits],
  )

  const removeHabit = useCallback(
    async (id) => {
      const snapshotHabits = habits
      const snapshotLogs = logs
      setHabits((prev) => prev.filter((habit) => habit.id !== id))
      setLogs((prev) => prev.filter((log) => log.habit_id !== id))
      try {
        await habitService.deleteHabit(id)
      } catch (err) {
        setHabits(snapshotHabits) // Rollback.
        setLogs(snapshotLogs)
        throw err
      }
    },
    [habits, logs],
  )

  // Toggles a habit check-in for a specific date key with optimistic UI.
  const toggleCheckIn = useCallback(
    async (habit, dateKey = todayKey()) => {
      const alreadyChecked = logs.some(
        (log) => log.habit_id === habit.id && log.completed_date === dateKey,
      )
      const snapshot = logs
      const tempId = `temp-${habit.id}-${dateKey}`

      if (alreadyChecked) {
        setLogs((prev) =>
          prev.filter((log) => !(log.habit_id === habit.id && log.completed_date === dateKey)),
        )
        try {
          await habitService.undoHabitCheckIn(habit.id, dateKey)
        } catch (err) {
          setLogs(snapshot) // Rollback.
          throw err
        }
        return
      }

      setLogs((prev) => [
        ...prev,
        { id: tempId, habit_id: habit.id, user_id: user.id, completed_date: dateKey },
      ])
      try {
        const saved = await habitService.checkInHabit(habit.id, user.id, dateKey)
        if (saved) {
          setLogs((prev) => prev.map((log) => (log.id === tempId ? saved : log)))
        }
      } catch (err) {
        setLogs(snapshot) // Rollback.
        throw err
      }
    },
    [logs, user],
  )

  return {
    habits: habitsWithStats,
    logs,
    loading,
    error,
    setError,
    reload: load,
    addHabit,
    updateHabit,
    removeHabit,
    toggleCheckIn,
  }
}
