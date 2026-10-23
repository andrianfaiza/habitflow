import { useEffect, useRef, useState } from 'react'
import { Bell, BellRing, CalendarClock, CheckCheck, Flame, Target, Trash2, X } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { NOTIFICATION_TONES } from '../../utils/constants'

const TYPE_ICONS = {
  task_due: CalendarClock,
  habit_pending: Target,
  streak: Flame,
}

// Bell button with an unread badge and a dropdown notification center.
export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clearAll } =
    useNotifications()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Close the popover on outside click or Escape.
  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant"
      >
        {unreadCount > 0 ? <BellRing size={18} /> : <Bell size={18} />}
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-m3-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-outline-variant px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-on-surface">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-semibold text-on-primary-container">
                  {unreadCount} new
                </span>
              ) : null}
            </div>
            {notifications.length > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <CheckCheck size={14} />
                Mark all as read
              </button>
            ) : null}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
                  <Bell size={22} />
                </span>
                <p className="text-sm font-medium text-on-surface">No notifications</p>
                <p className="text-xs text-on-surface-variant">
                  All your tasks and habits are all clear. 🎉
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const Icon = TYPE_ICONS[item.type] ?? Bell
                return (
                  <div
                    key={item.id}
                    className="group flex items-start gap-3 border-b border-outline-variant/60 px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-variant/50"
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        NOTIFICATION_TONES[item.tone] ?? NOTIFICATION_TONES.info
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <button
                      type="button"
                      onClick={() => markRead(item.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-sm font-medium text-on-surface">{item.title}</p>
                      <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                        {item.message}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => dismiss(item.id)}
                      aria-label="Dismiss notification"
                      className="rounded-full p-1 text-on-surface-variant opacity-0 transition-opacity hover:bg-error/10 hover:text-error group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 ? (
            <div className="border-t border-outline-variant px-4 py-2">
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
              >
                <Trash2 size={14} />
                Delete all notifications
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
