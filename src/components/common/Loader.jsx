import { Loader2 } from 'lucide-react'
import { useTranslation } from '../../i18n'

// Spinning loader used while data is being fetched.
export function Loader({ label, className = '' }) {
  const { t } = useTranslation()
  const text = label ?? t('common.loading')

  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-10 text-on-surface-variant ${className}`}>
      <Loader2 className="animate-spin text-primary" size={28} />
      {text ? <span className="text-sm">{text}</span> : null}
    </div>
  )
}
