// Horizontal row of Material 3 filter chips.
export function FilterChips({ options, value, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {options.map((option) => {
        const active = option.value === value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium
              transition-all duration-200 ${
                active
                  ? 'border-transparent bg-primary text-on-primary shadow-m3-1'
                  : 'border-outline text-on-surface-variant hover:border-primary/40 hover:bg-primary-container/50 hover:text-on-primary-container'
              }`}
          >
            {Icon ? <Icon size={15} /> : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
