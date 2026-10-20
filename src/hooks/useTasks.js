import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import * as taskService from '../services/taskService'

// Manages the task list: initial load plus create / update / delete actions.
// Toggle and delete use optimistic updates with rollback on failure.
export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setTasks(await taskService.fetchTasks(user.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // Fetch tasks on mount and whenever the authenticated user changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const addTask = useCallback(
    async (payload) => {
      const created = await taskService.createTask(user.id, payload)
      setTasks((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const updateTask = useCallback(
    async (id, payload) => {
      const snapshot = tasks
      // Optimistic update.
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...payload } : task)))
      try {
        await taskService.updateTask(id, payload)
      } catch (err) {
        setTasks(snapshot) // Rollback.
        throw err
      }
    },
    [tasks],
  )

  const toggleTask = useCallback(
    async (task) => {
      const snapshot = tasks
      const nextCompleted = !task.is_completed
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? { ...item, is_completed: nextCompleted } : item)),
      )
      try {
        await taskService.updateTask(task.id, { is_completed: nextCompleted })
      } catch (err) {
        setTasks(snapshot) // Rollback.
        throw err
      }
    },
    [tasks],
  )

  const removeTask = useCallback(
    async (id) => {
      const snapshot = tasks
      setTasks((prev) => prev.filter((task) => task.id !== id))
      try {
        await taskService.deleteTask(id)
      } catch (err) {
        setTasks(snapshot) // Rollback.
        throw err
      }
    },
    [tasks],
  )

  return { tasks, loading, error, setError, reload: load, addTask, updateTask, toggleTask, removeTask }
}
