// Date helpers.
// Habit log dates are always handled as local "YYYY-MM-DD" strings so the
// value never shifts between the user's device and the Supabase server.

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const WEEKDAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

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

// Difference in whole days between two keys (a - b).
export function diffInDays(aKey, bKey) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const a = fromDateKey(aKey).getTime()
  const b = fromDateKey(bKey).getTime()
  return Math.round((a - b) / MS_PER_DAY)
}

// Human friendly Indonesian date, e.g. "18 Oktober 2026".
export function formatDisplayDate(date = new Date(), { withWeekday = false } = {}) {
  const d = date instanceof Date ? date : new Date(date)
  const day = d.getDate()
  const month = MONTH_NAMES_ID[d.getMonth()]
  const year = d.getFullYear()
  const base = `${day} ${month} ${year}`
  return withWeekday ? `${WEEKDAY_NAMES_ID[d.getDay()]}, ${base}` : base
}

// Formats a "HH:MM:SS" time string into "HH:MM WIB".
export function formatTime(time) {
  if (!time) return null
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes} WIB`
}

// Greeting based on the current hour of the day.
export function getGreeting(date = new Date()) {
  const hour = (date instanceof Date ? date : new Date(date)).getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 19) return 'Selamat sore'
  return 'Selamat malam'
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

// Short Indonesian date, e.g. "18 Okt 2026".
export function formatShortDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  const day = d.getDate()
  const month = MONTH_NAMES_ID[d.getMonth()].slice(0, 3)
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

// Friendly label for a due date: "Hari ini", "Besok" or the short date.
export function formatDueLabel(dateKey) {
  if (!dateKey) return null
  if (isToday(dateKey)) return 'Hari ini'
  if (isTomorrow(dateKey)) return 'Besok'
  return formatShortDate(fromDateKey(dateKey))
}
