// Date helpers.
// Habit log dates are always handled as local "YYYY-MM-DD" strings so the
// value never shifts between the user's device and the Supabase server.

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Converts a Date (or date-like value) into a local "YYYY-MM-DD" key.
export function toDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Returns today's local date key.
export function todayKey() {
  return toDateKey(new Date())
}

// Parses a "YYYY-MM-DD" key into a local Date at midnight.
export function fromDateKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Adds (or subtracts) a number of days to a date key and returns a new key.
export function addDays(dateKey, amount) {
  const date = fromDateKey(dateKey)
  date.setDate(date.getDate() + amount)
  return toDateKey(date)
}

// Adds (or subtracts) months to a date key. The day is clamped to the last day
// of the target month (e.g. Jan 31 + 1 month -> Feb 28).
export function addMonths(dateKey, amount) {
  const date = fromDateKey(dateKey)
  const day = date.getDate()
  date.setDate(1)
  date.setMonth(date.getMonth() + amount)
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(day, daysInMonth))
  return toDateKey(date)
}

// Inclusive list of "YYYY-MM-DD" keys between two date keys.
export function buildDateRange(startKey, endKey) {
  const keys = []
  let cursor = startKey
  // The length guard prevents an accidental endless loop.
  while (diffInDays(cursor, endKey) <= 0 && keys.length < 5000) {
    keys.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return keys
}

// Difference in whole days between two keys (a - b).
export function diffInDays(aKey, bKey) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const a = fromDateKey(aKey).getTime()
  const b = fromDateKey(bKey).getTime()
  return Math.round((a - b) / MS_PER_DAY)
}

// Human friendly English date, e.g. "18 October 2026".
export function formatDisplayDate(date = new Date(), { withWeekday = false } = {}) {
  const d = date instanceof Date ? date : new Date(date)
  const day = d.getDate()
  const month = MONTH_NAMES[d.getMonth()]
  const year = d.getFullYear()
  const base = `${day} ${month} ${year}`
  return withWeekday ? `${WEEKDAY_NAMES[d.getDay()]}, ${base}` : base
}

// Formats a "HH:MM:SS" time string into "HH:MM".
export function formatTime(time) {
  if (!time) return null
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

// Greeting based on the current hour of the day.
export function getGreeting(date = new Date()) {
  const hour = (date instanceof Date ? date : new Date(date)).getHours()
  if (hour < 11) return 'Good morning'
  if (hour < 15) return 'Good afternoon'
  if (hour < 19) return 'Good evening'
  return 'Good night'
}

// English day for a Date or a "YYYY-MM-DD" key.
export function getDay(date = new Date()) {
  const d = date instanceof Date ? date : fromDateKey(date)
  return [d.getDate()]
}
// English date for a Date or a "YYYY-MM-DD" key.
export function getDate(date = new Date()) {
  const d = date instanceof Date ? date : fromDateKey(date)
  return [d.getDate()]
}
// English month name for a Date or a "YYYY-MM-DD" key.
export function getMonthName(date = new Date()) {
  const d = date instanceof Date ? date : fromDateKey(date)
  return MONTH_NAMES[d.getMonth()]
}

// Calendar year for a Date or a "YYYY-MM-DD" key.
export function getYear(date = new Date()) {
  const d = date instanceof Date ? date : fromDateKey(date)
  return d.getFullYear()
}

// Short English weekday, e.g. "Monday".
export function getWeekday(date = new Date()) {
  const d = date instanceof Date ? date : fromDateKey(date)
  return WEEKDAY_NAMES[d.getDay()]
}
// Short English weekday, e.g. "Mon".
export function getWeekdayShort(date = new Date()) {
  const d = date instanceof Date ? date : fromDateKey(date)
  return WEEKDAY_NAMES[d.getDay()].slice(0, 3)
}

// Checks whether a due date is in the past (and not today).
export function isOverdue(dateKey) {
  if (!dateKey) return false
  return diffInDays(dateKey, todayKey()) < 0
}

// Checks whether a due date is today.
export function isToday(dateKey) {
  if (!dateKey) return false
  return dateKey === todayKey()
}

// Checks whether a due date is tomorrow.
export function isTomorrow(dateKey) {
  if (!dateKey) return false
  return dateKey === addDays(todayKey(), 1)
}

// Short English date, e.g. "18 Oct 2026".
export function formatShortDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  const day = d.getDate()
  const month = MONTH_NAMES[d.getMonth()].slice(0, 3)
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

// Friendly label for a due date: "Today", "Tomorrow" or the short date.
export function formatDueLabel(dateKey) {
  if (!dateKey) return null
  if (isToday(dateKey)) return 'Today'
  if (isTomorrow(dateKey)) return 'Tomorrow'
  return formatShortDate(fromDateKey(dateKey))
}
