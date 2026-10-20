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
      setStatus({ type: 'error', message: err.message ?? 'Gagal menyimpan preferensi.' })
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
      setStatus({ type: 'success', message: 'Data berhasil diekspor.' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message ?? 'Gagal mengekspor data.' })
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
        setStatus({ type: 'success', message: 'Semua data tugas dan kebiasaan telah dihapus.' })
      } else if (dialog === 'delete') {
        await deleteAccount()
        await signOut()
        return
      }
      setDialog(null)
    } catch (err) {
      setStatus({ type: 'error', message: err.message ?? 'Terjadi kesalahan.' })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h2 className="text-xl font-semibold text-on-surface">Pengaturan</h2>

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
        <h3 className="text-base font-semibold text-on-surface">Tampilan</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Pilih tema yang paling nyaman untuk matamu.
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
            <span className="text-sm font-medium text-on-surface">Mode Terang</span>
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
            <span className="text-sm font-medium text-on-surface">Mode Gelap</span>
          </button>
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          Tema saat ini: {isDark ? 'Gelap' : 'Terang'}
        </p>
      </section>

      {/* Notification preferences */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <Bell size={18} className="text-primary" />
          Preferensi Notifikasi
        </h3>
        <div className="mt-4 flex flex-col gap-4">
          <Toggle
            label="Pengingat Habit"
            description="Tampilkan notifikasi untuk habit yang belum dicentang hari ini."
            checked={preferences.notifications.habitReminders}
            onChange={(value) => updatePreference('notifications', 'habitReminders', value)}
          />
          <Toggle
            label="Tenggat Tugas"
            description="Ingatkan tugas yang jatuh tempo hari ini atau besok."
            checked={preferences.notifications.taskDeadlines}
            onChange={(value) => updatePreference('notifications', 'taskDeadlines', value)}
          />
          <Toggle
            label="Notifikasi Email"
            description="Terima ringkasan pengingat melalui email."
            checked={preferences.notifications.email}
            onChange={(value) => updatePreference('notifications', 'email', value)}
          />
        </div>
      </section>

      {/* Sound & effects */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <Volume2 size={18} className="text-primary" />
          Suara &amp; Efek
        </h3>
        <div className="mt-4 flex flex-col gap-4">
          <Toggle
            label="Efek Suara Penyelesaian"
            description="Mainkan nada singkat saat menandai tugas atau habit selesai."
            checked={preferences.sound.completionSound}
            onChange={(value) => updatePreference('sound', 'completionSound', value)}
          />
        </div>
      </section>

      {/* Data management */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="text-base font-semibold text-on-surface">Manajemen Data</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Ekspor cadangan datamu atau bersihkan data dari akun ini.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant p-4">
            <div>
              <p className="text-sm font-medium text-on-surface">Ekspor Data</p>
              <p className="text-xs text-on-surface-variant">
                Unduh semua tugas, kebiasaan, dan log sebagai JSON.
              </p>
            </div>
            <Button variant="outlined" icon={Download} onClick={handleExport}>
              Ekspor
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant p-4">
            <div>
              <p className="text-sm font-medium text-on-surface">Reset Data</p>
              <p className="text-xs text-on-surface-variant">
                Hapus semua tugas dan kebiasaan. Akun tetap aktif.
              </p>
            </div>
            <Button variant="danger-text" icon={RotateCcw} onClick={() => setDialog('reset')}>
              Reset
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-error/40 bg-error/5 p-4">
            <div>
              <p className="text-sm font-medium text-error">Hapus Akun</p>
              <p className="text-xs text-on-surface-variant">
                Hapus akun beserta seluruh datamu secara permanen.
              </p>
            </div>
            <Button variant="danger" icon={Trash2} onClick={() => setDialog('delete')}>
              Hapus Akun
            </Button>
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="text-base font-semibold text-on-surface">Akun</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Masuk sebagai <span className="font-medium text-on-surface">{user?.email}</span>
        </p>
        <div className="mt-4">
          <Button variant="outlined" icon={LogOut} onClick={signOut}>
            Keluar dari akun
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
        message="Semua tugas dan kebiasaanmu akan dihapus permanen. Akun dan profil tetap tersimpan. Lanjutkan?"
        confirmLabel="Ya, Reset Data"
      />

      <ConfirmDialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        onConfirm={handleConfirm}
        loading={processing}
        title="Hapus Akun"
        message="Akun beserta seluruh tugas, kebiasaan, dan log akan dihapus permanen dan tidak dapat dikembalikan. Yakin ingin melanjutkan?"
        confirmLabel="Ya, Hapus Akun"
      />
    </div>
  )
}
