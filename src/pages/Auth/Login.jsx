import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'

// Email + password login form.
export function Login({ onSwitch }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(err.message ?? 'Gagal masuk. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="m3-card p-6 shadow-m3-2 sm:p-8">
      <h2 className="text-xl font-semibold text-on-surface">Masuk</h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        Selamat datang kembali! Masuk untuk melanjutkan.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
          placeholder="••••••••"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error ? (
          <p className="rounded-m3-sm bg-error-container px-3 py-2 text-sm text-on-error-container">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" icon={LogIn} disabled={loading} className="w-full">
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Belum punya akun?{' '}
        <button type="button" onClick={onSwitch} className="font-medium text-primary hover:underline">
          Daftar di sini
        </button>
      </p>
    </div>
  )
}
