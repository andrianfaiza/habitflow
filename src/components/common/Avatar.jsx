import { useTranslation } from '../../i18n'

// Renders a user avatar from either an image URL, a preset emoji, or the
// first letter of the user's name.
const SIZES = {
  sm: 'h-9 w-9 text-lg',
  md: 'h-12 w-12 text-2xl',
  lg: 'h-20 w-20 text-4xl',
}

export function Avatar({ value, name, size = 'md', className = '' }) {
  const { t } = useTranslation()
  const sizeClasses = SIZES[size] ?? SIZES.md
  const isUrl = typeof value === 'string' && /^https?:\/\//.test(value)
  const initial = (name || '?').trim().charAt(0).toUpperCase()

  if (isUrl) {
    return (
      <img
        src={value}
        alt={name ?? t('common.avatar')}
        className={`shrink-0 rounded-full object-cover ${sizeClasses} ${className}`}
      />
    )
  }

  // Use the emoji preset when present, otherwise fall back to the initial.
  const content = value && !isUrl ? value : initial

  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full bg-primary-container font-semibold text-on-primary-container ring-1 ring-inset ring-primary/20 ${sizeClasses} ${className}`}
    >
      {content}
    </span>
  )
}
