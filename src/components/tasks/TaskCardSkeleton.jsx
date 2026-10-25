// Skeleton loader for TaskCard
export function TaskCardSkeleton() {
  return (
    <article className="m3-card flex gap-3 overflow-hidden rounded-3xl p-4 pl-5">
      <span className="absolute inset-y-0 left-0 w-1.5 bg-surface-variant animate-pulse" aria-hidden="true" />
      
      <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full border-2 border-outline bg-surface-variant animate-pulse" />
      
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-surface-variant animate-pulse" aria-hidden="true" />
            <div className="h-5 w-3/4 rounded bg-surface-variant animate-pulse" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <div className="h-8 w-8 rounded-full bg-surface-variant animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-surface-variant animate-pulse" />
          </div>
        </div>
        
        <div className="mt-1 h-4 w-full rounded bg-surface-variant animate-pulse" />
        
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <div className="h-5 w-16 rounded-full bg-surface-variant animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-surface-variant animate-pulse" />
        </div>
      </div>
    </article>
  )
}
