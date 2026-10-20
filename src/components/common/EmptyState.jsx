// Friendly placeholder shown when a list has no items yet.
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-m3-lg border border-dashed border-outline-variant px-6 py-10 text-center">
      {Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <Icon size={26} />
        </div>
      ) : null}
      <h3 className="text-base font-medium text-on-surface">{title}</h3>
      {description ? <p className="max-w-xs text-sm text-on-surface-variant">{description}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
