import { Loader2 } from 'lucide-react'

// Spinning loader used while data is being fetched.
export function Loader({ label = 'Memuat...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-10 text-on-surface-variant ${className}`}>
      <Loader2 className="animate-spin text-primary" size={28} />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  )
}
