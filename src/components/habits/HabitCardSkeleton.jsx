// Skeleton loader for HabitCard
export function HabitCardSkeleton() {
  return (
    <article className="m3-card flex items-center gap-3 overflow-hidden rounded-3xl p-4 pl-5">
      <span className="absolute inset-y-0 left-0 w-1.5 bg-surface-variant animate-pulse" aria-hidden="true" />
      
      <div className="h-11 w-11 shrink-0 rounded-2xl border-2 border-outline bg-surface-variant animate-pulse" />
      
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-surface-variant animate-pulse" aria-hidden="true" />
          <div className="h-5 w-1/2 rounded bg-surface-variant animate-pulse" />
          <div className="h-5 w-12 rounded-full bg-surface-variant animate-pulse" />
        </div>
        <div className="mt-0.5 h-4 w-2/3 rounded bg-surface-variant animate-pulse" />
        <div className="mt-0.5 h-3 w-1/3 rounded bg-surface-variant animate-pulse" />
      </div>
      
      <div className="flex shrink-0 items-center gap-1">
        <div className="h-8 w-8 rounded-full bg-surface-variant animate-pulse" />
        <div className="h-8 w-8 rounded-full bg-surface-variant animate-pulse" />
      </div>
    </article>
  )
}
