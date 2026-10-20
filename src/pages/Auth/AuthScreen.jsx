import { useState } from 'react'
import { Login } from './Login'
import { Register } from './Register'

// Full-screen authentication page that toggles between login and register.
export function AuthScreen() {
  const [mode, setMode] = useState('login')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-container via-surface to-secondary-container p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-m3-lg bg-primary text-2xl text-on-primary shadow-m3-2">
            🔥
          </span>
          <h1 className="text-2xl font-bold text-on-surface">HabitFlow</h1>
          <p className="text-sm text-on-surface-variant">To Do List &amp; Habit Tracker</p>
        </div>

        {mode === 'login' ? (
          <Login onSwitch={() => setMode('register')} />
        ) : (
          <Register onSwitch={() => setMode('login')} />
        )}
      </div>
    </div>
  )
}
