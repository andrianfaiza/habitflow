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
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Password confirmation does not match.')
      return
    }

    setLoading(true)
    try {
      await signUp(email.trim(), password, fullName.trim())
      setSuccess(true)
    } catch (err) {
      setError(err.message ?? 'Failed to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="m3-card p-6 text-center shadow-m3-2 sm:p-8">
        <h2 className="text-xl font-semibold text-on-surface">Registration successful 🎉</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Check your email <span className="font-medium text-on-surface">{email}</span> to confirm
          your account, then sign in again.
        </p>
        <Button className="mt-6 w-full" onClick={onSwitch}>
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="m3-card p-6 shadow-m3-2 sm:p-8">
      <h2 className="text-xl font-semibold text-on-surface">Register</h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        Create an account to start tracking your tasks and habits.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="Full name"
          placeholder="Your name"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          placeholder="name@email.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat the password"
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
          {loading ? 'Processing...' : 'Register'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="font-medium text-primary hover:underline">
          Sign in here
        </button>
      </p>
    </div>
  )
}
