import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'

// Registration form: name + email + password + confirmation.
export function Register({ onSwitch }) {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    setLoading(true)
    try {
      await signUp(email.trim(), password, fullName.trim())
      setSuccess(true)
    } catch (err) {
      setError(err.message ?? 'Gagal mendaftar. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="m3-card p-6 text-center shadow-m3-2 sm:p-8">
        <h2 className="text-xl font-semibold text-on-surface">Pendaftaran berhasil 🎉</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Cek email <span className="font-medium text-on-surface">{email}</span> untuk konfirmasi
          akun, lalu masuk kembali.
        </p>
        <Button className="mt-6 w-full" onClick={onSwitch}>
          Kembali ke halaman masuk
        </Button>
      </div>
    )
  }

  return (
    <div className="m3-card p-6 shadow-m3-2 sm:p-8">
      <h2 className="text-xl font-semibold text-on-surface">Daftar</h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        Buat akun untuk mulai melacak tugas dan kebiasaanmu.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="Nama lengkap"
          placeholder="Nama kamu"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Minimal 6 karakter"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Konfirmasi password"
          type="password"
          placeholder="Ulangi password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error ? (
          <p className="rounded-m3-sm bg-error-container px-3 py-2 text-sm text-on-error-container">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" icon={UserPlus} disabled={loading} className="w-full">
          {loading ? 'Memproses...' : 'Daftar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Sudah punya akun?{' '}
        <button type="button" onClick={onSwitch} className="font-medium text-primary hover:underline">
          Masuk di sini
        </button>
      </p>
    </div>
  )
}
