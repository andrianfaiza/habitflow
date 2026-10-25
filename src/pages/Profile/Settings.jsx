import { useState } from 'react'
import {
  Bell,
  Download,
  Languages,
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
import { useTranslation } from '../../i18n'
import { Button } from '../../components/common/Button'
import { Toggle } from '../../components/common/Toggle'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { resolvePreferences } from '../../utils/constants'
import { todayKey } from '../../utils/dateUtils'
import { deleteAccount, exportUserData, resetUserData } from '../../services/profileService'

// Language choices offered in Settings. English is the default.
const LANGUAGE_OPTIONS = [
  { value: 'en', labelKey: 'settings.language.english', descriptionKey: 'settings.language.englishDescription' },
  { value: 'id', labelKey: 'settings.language.indonesian', descriptionKey: 'settings.language.indonesianDescription' },
]

// Settings page: appearance, language, notification & sound preferences, data
// management and account actions.
export function Settings() {
  const { isDark, theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { profile, savePreferences } = useProfile()
  const { reloadTasks, reloadHabits } = useData()
  const { t, locale, setLocale } = useTranslation()

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
      setStatus({ type: 'error', message: err.message ?? t('settings.preferencesError') })
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
      setStatus({ type: 'success', message: t('settings.exportSuccess') })
    } catch (err) {
      setStatus({ type: 'error', message: err.message ?? t('settings.exportError') })
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
        setStatus({ type: 'success', message: t('settings.resetSuccess') })
      } else if (dialog === 'delete') {
        await deleteAccount()
        await signOut()
        return
      }
      setDialog(null)
    } catch (err) {
      setStatus({ type: 'error', message: err.message ?? t('settings.genericError') })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h2 className="text-xl font-semibold text-on-surface">{t('settings.title')}</h2>

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
        <h3 className="text-base font-semibold text-on-surface">
          {t('settings.appearance.title')}
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          {t('settings.appearance.description')}
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
            <span className="text-sm font-medium text-on-surface">
              {t('settings.appearance.light')}
            </span>
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
            <span className="text-sm font-medium text-on-surface">
              {t('settings.appearance.dark')}
            </span>
          </button>
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          {t('settings.appearance.current', {
            theme: isDark
              ? t('settings.appearance.darkShort')
              : t('settings.appearance.lightShort'),
          })}
        </p>
      </section>

      {/* Language */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <Languages size={18} className="text-primary" />
          {t('settings.language.title')}
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          {t('settings.language.description')}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {LANGUAGE_OPTIONS.map((option) => {
            const active = locale === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setLocale(option.value)}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1 rounded-3xl border p-4 text-center transition-all duration-200 ${
                  active
                    ? 'border-primary bg-primary/10 shadow-m3-1'
                    : 'border-outline-variant hover:bg-surface-variant'
                }`}
              >
                <span className="text-sm font-medium text-on-surface">
                  {t(option.labelKey)}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {active ? t('settings.language.active') : t(option.descriptionKey)}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Notification preferences */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <Bell size={18} className="text-primary" />
          {t('settings.notifications.title')}
        </h3>
        <div className="mt-4 flex flex-col gap-4">
          <Toggle
            label={t('settings.notifications.habitReminders')}
            description={t('settings.notifications.habitRemindersDescription')}
            checked={preferences.notifications.habitReminders}
            onChange={(value) => updatePreference('notifications', 'habitReminders', value)}
          />
          <Toggle
            label={t('settings.notifications.taskDeadlines')}
            description={t('settings.notifications.taskDeadlinesDescription')}
            checked={preferences.notifications.taskDeadlines}
            onChange={(value) => updatePreference('notifications', 'taskDeadlines', value)}
          />
          <Toggle
            label={t('settings.notifications.email')}
            description={t('settings.notifications.emailDescription')}
            checked={preferences.notifications.email}
            onChange={(value) => updatePreference('notifications', 'email', value)}
          />
        </div>
      </section>

      {/* Sound & effects */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <Volume2 size={18} className="text-primary" />
          {t('settings.sound.title')}
        </h3>
        <div className="mt-4 flex flex-col gap-4">
          <Toggle
            label={t('settings.sound.completion')}
            description={t('settings.sound.completionDescription')}
            checked={preferences.sound.completionSound}
            onChange={(value) => updatePreference('sound', 'completionSound', value)}
          />
        </div>
      </section>

      {/* Data management */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="text-base font-semibold text-on-surface">
          {t('settings.data.title')}
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          {t('settings.data.description')}
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant p-4">
            <div>
              <p className="text-sm font-medium text-on-surface">
                {t('settings.data.exportTitle')}
              </p>
              <p className="text-xs text-on-surface-variant">
                {t('settings.data.exportDescription')}
              </p>
            </div>
            <Button variant="outlined" icon={Download} onClick={handleExport}>
              {t('settings.data.exportButton')}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant p-4">
            <div>
              <p className="text-sm font-medium text-on-surface">
                {t('settings.data.resetTitle')}
              </p>
              <p className="text-xs text-on-surface-variant">
                {t('settings.data.resetDescription')}
              </p>
            </div>
            <Button variant="danger-text" icon={RotateCcw} onClick={() => setDialog('reset')}>
              {t('settings.data.resetButton')}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-error/40 bg-error/5 p-4">
            <div>
              <p className="text-sm font-medium text-error">
                {t('settings.data.deleteTitle')}
              </p>
              <p className="text-xs text-on-surface-variant">
                {t('settings.data.deleteDescription')}
              </p>
            </div>
            <Button variant="danger" icon={Trash2} onClick={() => setDialog('delete')}>
              {t('settings.data.deleteButton')}
            </Button>
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="text-base font-semibold text-on-surface">
          {t('settings.account.title')}
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          {t('settings.account.signedInAs')}{' '}
          <span className="font-medium text-on-surface">{user?.email}</span>
        </p>
        <div className="mt-4">
          <Button variant="outlined" icon={LogOut} onClick={signOut}>
            {t('settings.account.signOut')}
          </Button>
        </div>
      </section>

      <p className="text-center text-xs text-on-surface-variant">
        {t('settings.version')}
      </p>

      <ConfirmDialog
        open={dialog === 'reset'}
        onClose={() => setDialog(null)}
        onConfirm={handleConfirm}
        loading={processing}
        title={t('settings.resetDialog.title')}
        message={t('settings.resetDialog.message')}
        confirmLabel={t('settings.resetDialog.confirm')}
      />

      <ConfirmDialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        onConfirm={handleConfirm}
        loading={processing}
        title={t('settings.deleteDialog.title')}
        message={t('settings.deleteDialog.message')}
        confirmLabel={t('settings.deleteDialog.confirm')}
      />
    </div>
  )
}
