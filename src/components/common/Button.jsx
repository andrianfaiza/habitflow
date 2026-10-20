// Material 3 (M3) style button with several visual variants.
const VARIANTS = {
  filled: 'bg-primary text-on-primary hover:shadow-m3-1',
  tonal: 'bg-secondary-container text-on-secondary-container hover:shadow-m3-1',
  outlined: 'border border-outline text-primary hover:bg-primary/10',
  text: 'text-primary hover:bg-primary/10',
  danger: 'bg-error text-on-error hover:shadow-m3-1',
  'danger-text': 'text-error hover:bg-error/10',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

export function Button({
  children,
  variant = 'filled',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex select-none items-center justify-center rounded-full font-medium
        transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        focus-visible:ring-offset-surface ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon ? <Icon size={size === 'sm' ? 16 : 18} /> : null}
      {children}
      {IconRight ? <IconRight size={size === 'sm' ? 16 : 18} /> : null}
    </button>
  )
}
