import { useState } from 'react'
import {
  Bell,
  Download,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  Volume2,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../hooks/useData'
import { useProfile } from '../../hooks/useProfile'
import { useTheme } from '../../hooks/useTheme'
import { Button } from '../../components/common/Button'
import { Toggle } from '../../components/common/Toggle'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { resolvePreferences } from '../../utils/constants'
import { todayKey } from '../../utils/dateUtils'
import { deleteAccount, exportUserData, resetUserData } from '../../services/profileService'

// Settings page: appearance, notification & sound preferences, data management
// and account actions.
export function Settings() {
  const { isDark, theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { profile, savePreferences } = useProfile()
  const { reloadTasks, reloadHabits } = useData()

  const preferences = resolvePreferences(profile?.preferences)

  const [dialog, setDialog] = useState(null) // 'reset' | 'delete' | null
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState(null)

  // Persists a single nested preference value.
  async function updatePreference(section, key, value) {
    const next = {
      ...preferences,
      [section]: { ...preferences[section], [key]: value },
    }
    try {
      await savePreferences(next)
    } catch (err) {
      setStatus({ type: 'error', message: err.message ?? 'Failed to save preferences.' })
    }
  }

  // Downloads every task, habit and log the user owns as a JSON file.
  async function handleExport() {
    setStatus(null)
    try {
      const data = await exportUserData(user)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `habitflow-backup-${todayKey()}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      setStatus({ type: 'success', message: 'Data exported successfully.' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message ?? 'Failed to export the data.' })
    }
  }

  // Handles both destructive confirmations.
  async function handleConfirm() {
    setProcessing(true)
    setStatus(null)
    try {
      if (dialog === 'reset') {
        await resetUserData(user.id)
        await Promise.all([reloadTasks(), reloadHabits()])
        setStatus({ type: 'success', message: 'All tasks and habits have been deleted.' })
      } else if (dialog === 'delete') {
        await deleteAccount()
        await signOut()
        return
      }
      setDialog(null)
    } catch (err) {
      setStatus({ type: 'error', message: err.message ?? 'Something went wrong.' })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h2 className="text-xl font-semibold text-on-surface">Settings</h2>

      {status ? (
        <p
          className={`animate-pop rounded-m3-sm px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-error-container text-on-error-container'
          }`}
        >
          {status.message}
        </p>
      ) : null}

      {/* Appearance */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="text-base font-semibold text-on-surface">Appearance</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Choose the theme that is most comfortable for your eyes.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2 rounded-3xl border p-4 transition-all duration-200 ${
              theme === 'light'
                ? 'border-primary bg-primary/10 shadow-m3-1'
                : 'border-outline-variant hover:bg-surface-variant'
            }`}
          >
            <Sun size={22} className="text-primary" />
            <span className="text-sm font-medium text-on-surface">Light Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2 rounded-3xl border p-4 transition-all duration-200 ${
              theme === 'dark'
                ? 'border-primary bg-primary/10 shadow-m3-1'
                : 'border-outline-variant hover:bg-surface-variant'
            }`}
          >
            <Moon size={22} className="text-primary" />
            <span className="text-sm font-medium text-on-surface">Dark Mode</span>
          </button>
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          Current theme: {isDark ? 'Dark' : 'Light'}
        </p>
      </section>

      {/* Notification preferences */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <Bell size={18} className="text-primary" />
          Notification Preferences
        </h3>
        <div className="mt-4 flex flex-col gap-4">
          <Toggle
            label="Habit Reminders"
            description="Show notifications for habits that have not been checked in today."
            checked={preferences.notifications.habitReminders}
            onChange={(value) => updatePreference('notifications', 'habitReminders', value)}
          />
          <Toggle
            label="Task Deadlines"
            description="Remind you about tasks that are due today or tomorrow."
            checked={preferences.notifications.taskDeadlines}
            onChange={(value) => updatePreference('notifications', 'taskDeadlines', value)}
          />
          <Toggle
            label="Email Notifications"
            description="Receive a reminder summary by email."
            checked={preferences.notifications.email}
            onChange={(value) => updatePreference('notifications', 'email', value)}
          />
        </div>
      </section>

      {/* Sound & effects */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <Volume2 size={18} className="text-primary" />
          Sound &amp; Effects
        </h3>
        <div className="mt-4 flex flex-col gap-4">
          <Toggle
            label="Completion Sound Effect"
            description="Play a short tone when you mark a task or habit as done."
            checked={preferences.sound.completionSound}
            onChange={(value) => updatePreference('sound', 'completionSound', value)}
          />
        </div>
      </section>

      {/* Data management */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="text-base font-semibold text-on-surface">Data Management</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Export a backup of your data or clear the data from this account.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant p-4">
            <div>
              <p className="text-sm font-medium text-on-surface">Export Data</p>
              <p className="text-xs text-on-surface-variant">
                Download all tasks, habits, and logs as JSON.
              </p>
            </div>
            <Button variant="outlined" icon={Download} onClick={handleExport}>
              Export
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant p-4">
            <div>
              <p className="text-sm font-medium text-on-surface">Reset Data</p>
              <p className="text-xs text-on-surface-variant">
                Delete all tasks and habits. Your account stays active.
              </p>
            </div>
            <Button variant="danger-text" icon={RotateCcw} onClick={() => setDialog('reset')}>
              Reset
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-error/40 bg-error/5 p-4">
            <div>
              <p className="text-sm font-medium text-error">Delete Account</p>
              <p className="text-xs text-on-surface-variant">
                Permanently delete your account and all of its data.
              </p>
            </div>
            <Button variant="danger" icon={Trash2} onClick={() => setDialog('delete')}>
              Delete Account
            </Button>
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="text-base font-semibold text-on-surface">Account</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Signed in as <span className="font-medium text-on-surface">{user?.email}</span>
        </p>
        <div className="mt-4">
          <Button variant="outlined" icon={LogOut} onClick={signOut}>
            Sign out
          </Button>
        </div>
      </section>

      <p className="text-center text-xs text-on-surface-variant">
        HabitFlow v1.0 — To Do List &amp; Habit Tracker
      </p>

      <ConfirmDialog
        open={dialog === 'reset'}
        onClose={() => setDialog(null)}
        onConfirm={handleConfirm}
        loading={processing}
        title="Reset Data"
        message="All your tasks and habits will be permanently deleted. Your account and profile will be kept. Continue?"
        confirmLabel="Yes, Reset Data"
      />

      <ConfirmDialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        onConfirm={handleConfirm}
        loading={processing}
        title="Delete Account"
        message="Your account along with all tasks, habits, and logs will be permanently deleted and cannot be recovered. Are you sure you want to continue?"
        confirmLabel="Yes, Delete Account"
      />
    </div>
  )
}
