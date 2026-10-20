import { useState } from 'react'
import { CheckCircle2, Flame, KeyRound, Mail, Save, Target } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../hooks/useData'
import { useProfile } from '../../hooks/useProfile'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Avatar } from '../../components/common/Avatar'
import { Loader } from '../../components/common/Loader'
import { AVATAR_PRESETS } from '../../utils/constants'
import { formatShortDate } from '../../utils/dateUtils'

// Profile page: account summary, avatar, display info and password.
export function UserProfile() {
  const { profile, loading, error } = useProfile()

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader label="Memuat profil..." />
      </div>
    )
  }

  if (error) {
    return (
      <p className="mx-auto max-w-2xl rounded-m3-sm bg-error-container px-4 py-3 text-sm text-on-error-container">
        {error}
      </p>
    )
  }

  if (!profile) return null

  // Keyed by id so form state initializes correctly once the row loads.
  return <ProfileContent key={profile.id} profile={profile} />
}

function ProfileContent({ profile }) {
  const { user, updatePassword } = useAuth()
  const { habits, tasks } = useData()
  const { saveProfile } = useProfile()

  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [infoStatus, setInfoStatus] = useState(null)
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState(null)
  const [savingPassword, setSavingPassword] = useState(false)

  const stats = {
    totalHabits: habits.length,
    completedTasks: tasks.filter((task) => task.is_completed).length,
    highestStreak: habits.reduce((max, habit) => Math.max(max, habit.bestStreak ?? 0), 0),
  }

  const joinDate = user?.created_at ? formatShortDate(new Date(user.created_at)) : '-'
  const displayName = profile.full_name || user?.email?.split('@')[0] || 'Pengguna'

  async function handleSaveInfo(event) {
    event.preventDefault()
    setSavingInfo(true)
    setInfoStatus(null)
    try {
      await saveProfile({ full_name: fullName.trim() || null, bio: bio.trim() || null })
      setInfoStatus({ type: 'success', message: 'Profil berhasil diperbarui.' })
    } catch (err) {
      setInfoStatus({ type: 'error', message: err.message ?? 'Gagal memperbarui profil.' })
    } finally {
      setSavingInfo(false)
    }
  }

  async function handleSelectAvatar(value) {
    setSavingAvatar(true)
    try {
      await saveProfile({ avatar_url: value })
    } catch {
      // Error surfaced through the profile context.
    } finally {
      setSavingAvatar(false)
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault()
    setPasswordStatus(null)

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Kata sandi minimal 6 karakter.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok.' })
      return
    }

    setSavingPassword(true)
    try {
      await updatePassword(newPassword)
      setPasswordStatus({ type: 'success', message: 'Kata sandi berhasil diubah.' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.message ?? 'Gagal mengubah kata sandi.' })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h2 className="text-xl font-semibold text-on-surface">Profil Pengguna</h2>

      {/* Summary card */}
      <section className="m3-card flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-primary-container/60 to-surface p-6 shadow-m3-2 sm:flex-row sm:items-center">
        <Avatar size="lg" value={profile.avatar_url} name={displayName} />
        <div className="min-w-0 text-center sm:text-left">
          <p className="truncate text-lg font-semibold text-on-surface">{displayName}</p>
          <p className="mt-0.5 flex items-center justify-center gap-1.5 truncate text-sm text-on-surface-variant sm:justify-start">
            <Mail size={14} />
            {user?.email}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">Bergabung sejak {joinDate}</p>
        </div>
      </section>

      {/* Summary statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Target} label="Total Habits" value={stats.totalHabits} />
        <StatCard icon={CheckCircle2} label="Completed Tasks" value={stats.completedTasks} />
        <StatCard icon={Flame} label="Highest Streak" value={`${stats.highestStreak} hari`} />
      </section>

      {/* Avatar picker */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="text-base font-semibold text-on-surface">Ubah Avatar</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Pilih salah satu preset di bawah ini.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {AVATAR_PRESETS.map((emoji) => {
            const active = profile.avatar_url === emoji
            return (
              <button
                key={emoji}
                type="button"
                disabled={savingAvatar}
                onClick={() => handleSelectAvatar(emoji)}
                aria-label={`Pilih avatar ${emoji}`}
                aria-pressed={active}
                className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all duration-200 hover:scale-110 disabled:opacity-50 ${
                  active
                    ? 'bg-primary-container ring-2 ring-primary ring-offset-2 ring-offset-surface'
                    : 'bg-surface-variant hover:bg-primary-container/60'
                }`}
              >
                {emoji}
              </button>
            )
          })}
          <button
            type="button"
            disabled={savingAvatar}
            onClick={() => handleSelectAvatar(null)}
            className={`flex h-12 items-center justify-center rounded-full border border-dashed border-outline px-4 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-variant disabled:opacity-50`}
          >
            Tanpa avatar
          </button>
        </div>
      </section>

      {/* Display info */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="text-base font-semibold text-on-surface">Informasi Akun</h3>

        <form onSubmit={handleSaveInfo} className="mt-4 flex flex-col gap-4">
          <Input
            label="Nama lengkap"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama kamu"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-bio" className="text-sm font-medium text-on-surface-variant">
              Bio singkat
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              value={bio}
              maxLength={160}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan sedikit tentang dirimu..."
              className="m3-field resize-none"
            />
            <span className="text-xs text-on-surface-variant">{bio.length}/160 karakter</span>
          </div>
          <Input label="Email" value={user?.email ?? ''} disabled readOnly />

          {infoStatus ? <StatusMessage status={infoStatus} /> : null}

          <div className="flex justify-end">
            <Button type="submit" icon={Save} disabled={savingInfo}>
              {savingInfo ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </section>

      {/* Change password */}
      <section className="m3-card rounded-3xl p-6 shadow-m3-1">
        <h3 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <KeyRound size={18} className="text-primary" />
          Ubah Kata Sandi
        </h3>

        <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-4">
          <Input
            label="Kata sandi baru"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
          />
          <Input
            label="Konfirmasi kata sandi"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi kata sandi baru"
          />

          {passwordStatus ? <StatusMessage status={passwordStatus} /> : null}

          <div className="flex justify-end">
            <Button type="submit" icon={KeyRound} disabled={savingPassword}>
              {savingPassword ? 'Menyimpan...' : 'Ubah Kata Sandi'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="m3-card flex items-center gap-4 rounded-3xl p-5 shadow-m3-1">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-lg font-semibold text-on-surface">{value}</p>
        <p className="truncate text-xs text-on-surface-variant">{label}</p>
      </div>
    </div>
  )
}

function StatusMessage({ status }) {
  return (
    <p
      className={`animate-pop rounded-m3-sm px-3 py-2 text-sm ${
        status.type === 'success'
          ? 'bg-primary-container text-on-primary-container'
          : 'bg-error-container text-on-error-container'
      }`}
    >
      {status.message}
    </p>
  )
}
