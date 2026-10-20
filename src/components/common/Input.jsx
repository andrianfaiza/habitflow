// Text input with an optional label and inline error message.
import { useId } from 'react'

export function Input({ label, error, hint, className = '', ...props }) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-on-surface-variant">
          {label}
        </label>
      ) : null}
      <input id={id} className={`m3-field ${error ? 'border-error' : ''} ${className}`} {...props} />
      {error ? (
        <span className="text-xs text-error">{error}</span>
      ) : hint ? (
        <span className="text-xs text-on-surface-variant">{hint}</span>
      ) : null}
    </div>
  )
}
