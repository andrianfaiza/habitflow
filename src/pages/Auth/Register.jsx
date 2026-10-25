import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../i18n'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'

// Registration form: name + email + password + confirmation.
export function Register({ onSwitch }) {
  const { signUp } = useAuth()
  const { t } = useTranslation()
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
      setError(t('auth.errors.passwordLength'))
      return
    }
    if (password !== confirm) {
      setError(t('auth.errors.passwordMismatch'))
      return
    }

    setLoading(true)
    try {
      await signUp(email.trim(), password, fullName.trim())
      setSuccess(true)
    } catch (err) {
      setError(err.message ?? t('auth.register.error'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="m3-card p-6 text-center shadow-m3-2 sm:p-8">
        <h2 className="text-xl font-semibold text-on-surface">
          {t('auth.register.successTitle')}
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          {t('auth.register.checkEmail')}{' '}
          <span className="font-medium text-on-surface">{email}</span>{' '}
          {t('auth.register.confirmEmail')}
        </p>
        <Button className="mt-6 w-full" onClick={onSwitch}>
          {t('auth.register.backToSignIn')}
        </Button>
      </div>
    )
  }

  return (
    <div className="m3-card p-6 shadow-m3-2 sm:p-8">
      <h2 className="text-xl font-semibold text-on-surface">{t('auth.register.title')}</h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        {t('auth.register.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label={t('common.fullName')}
          placeholder={t('auth.register.fullNamePlaceholder')}
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label={t('common.email')}
          type="email"
          placeholder="name@email.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label={t('common.password')}
          type="password"
          placeholder={t('auth.register.passwordPlaceholder')}
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label={t('auth.register.confirmPassword')}
          type="password"
          placeholder={t('auth.register.confirmPasswordPlaceholder')}
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
          {loading ? t('common.processing') : t('auth.register.submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        {t('auth.register.alreadyHaveAccount')}{' '}
        <button type="button" onClick={onSwitch} className="font-medium text-primary hover:underline">
          {t('auth.register.signInLink')}
        </button>
      </p>
    </div>
  )
}
