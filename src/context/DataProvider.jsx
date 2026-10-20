import { useMemo } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useHabits } from '../hooks/useHabits'
import { DataContext } from './dataContext'

// Provides the task and habit state to the whole app so multiple consumers
// (dashboard, header notifications, profile) share a single fetch.
export function DataProvider({ children }) {
  const taskState = useTasks()
  const habitState = useHabits()

  const value = useMemo(
    () => ({
      // Tasks
      tasks: taskState.tasks,
      tasksLoading: taskState.loading,
      tasksError: taskState.error,
      addTask: taskState.addTask,
      updateTask: taskState.updateTask,
      toggleTask: taskState.toggleTask,
      removeTask: taskState.removeTask,
      reloadTasks: taskState.reload,
      // Habits
      habits: habitState.habits,
      habitLogs: habitState.logs,
      habitsLoading: habitState.loading,
      habitsError: habitState.error,
      addHabit: habitState.addHabit,
      updateHabit: habitState.updateHabit,
      removeHabit: habitState.removeHabit,
      toggleCheckIn: habitState.toggleCheckIn,
      reloadHabits: habitState.reload,
    }),
    [taskState, habitState],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
