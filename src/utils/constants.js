// Global application constants.

export const PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

// Priority options rendered in forms and filters.
export const PRIORITY_OPTIONS = [
  { value: PRIORITIES.HIGH, label: 'Tinggi' },
  { value: PRIORITIES.MEDIUM, label: 'Sedang' },
  { value: PRIORITIES.LOW, label: 'Rendah' },
]

export const PRIORITY_LABELS = {
  [PRIORITIES.HIGH]: 'Tinggi',
  [PRIORITIES.MEDIUM]: 'Sedang',
  [PRIORITIES.LOW]: 'Rendah',
}

// Soft pill badge styling per priority (light + dark variants).
export const PRIORITY_BADGE_STYLES = {
  [PRIORITIES.HIGH]: 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/25',
  [PRIORITIES.MEDIUM]: 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/25',
  [PRIORITIES.LOW]: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/25',
}

// Accent bar color per priority.
export const PRIORITY_BAR_STYLES = {
  [PRIORITIES.HIGH]: 'bg-rose-500',
  [PRIORITIES.MEDIUM]: 'bg-amber-500',
  [PRIORITIES.LOW]: 'bg-emerald-500',
}

// Main content filter chips (matches the design specification).
export const CONTENT_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'habits', label: 'Habits' },
  { value: 'todo', label: 'To-Do' },
]

// Preset avatars (emoji) that users can pick from on the profile page.
export const AVATAR_PRESETS = ['🦊', '🐼', '🐨', '🦁', '🐧', '🐸', '🦄', '🐙', '🌻', '🚀', '🧠', '⭐']

// Default user preferences stored in profiles.preferences.
export const DEFAULT_PREFERENCES = {
  notifications: {
    habitReminders: true,
    taskDeadlines: true,
    email: false,
  },
  sound: {
    completionSound: true,
  },
}

// Deep-merges stored preferences over the defaults so new keys always exist.
export function resolvePreferences(stored) {
  const safe = stored && typeof stored === 'object' ? stored : {}
  return {
    notifications: {
      ...DEFAULT_PREFERENCES.notifications,
      ...(safe.notifications ?? {}),
    },
    sound: {
      ...DEFAULT_PREFERENCES.sound,
      ...(safe.sound ?? {}),
    },
  }
}

// Notification visual tones mapped to badge/accent styling.
export const NOTIFICATION_TONES = {
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  info: 'bg-primary-container text-on-primary-container',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}
