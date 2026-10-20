// Material 3 style switch used for preference toggles.
export function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-on-surface">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-on-surface-variant">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200
          disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? 'bg-primary' : 'bg-surface-variant ring-1 ring-inset ring-outline'}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-m3-1 transition-transform duration-200
            ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}
