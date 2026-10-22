import { Check } from 'lucide-react'
import { COLOR_TAGS } from '../../utils/constants'

// Accessible swatch picker used by the task and habit forms.
export function ColorPicker({ value, onChange, label = 'Warna label' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-on-surface-variant">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-2.5">
        {COLOR_TAGS.map((color) => {
          const selected = value === color.id
          return (
            <button
              key={color.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={color.label}
              title={color.label}
              onClick={() => onChange(color.id)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border
                border-black/10 transition-all duration-150 hover:scale-110 focus:outline-none
                focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                focus-visible:ring-offset-surface dark:border-white/20 ${
                  selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''
                }`}
              style={{ backgroundColor: color.hex }}
            >
              {selected ? (
                <Check size={16} strokeWidth={3} className="text-white drop-shadow" />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
