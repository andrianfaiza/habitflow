// Date helpers.
// Habit log dates are always handled as local "YYYY-MM-DD" strings so the
// value never shifts between the user's device and the Supabase server.
//
// Every formatting helper accepts an optional locale ("en" or "id") so the
// calendar, task labels and profile dates follow the language picked in
// Settings. English stays the default.

const LOCALE_DATA = {
  en: {
    months: [
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
    ],
    monthsShort: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    greetings: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      night: 'Good night',
    },
    today: 'Today',
    tomorrow: 'Tomorrow',
  },
  id: {
    months: [
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
    ],
    monthsShort: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ],
    weekdays: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    weekdaysShort: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    greetings: {
      morning: 'Selamat pagi',
      afternoon: 'Selamat siang',
      evening: 'Selamat sore',
      night: 'Selamat malam',
    },
    today: 'Hari ini',
    tomorrow: 'Besok',
  },
}

// Falls back to English for unknown locales so formatting never breaks.
function getLocaleData(locale = 'en') {
  return LOCALE_DATA[locale] ?? LOCALE_DATA.en
}

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

// Human friendly date, e.g. "18 October 2026" / "18 Oktober 2026".
export function formatDisplayDate(
  date = new Date(),
  { withWeekday = false, locale = 'en' } = {},
) {
  const d = date instanceof Date ? date : new Date(date)
  const data = getLocaleData(locale)
  const day = d.getDate()
  const month = data.months[d.getMonth()]
  const year = d.getFullYear()
  const base = `${day} ${month} ${year}`
  return withWeekday ? `${data.weekdays[d.getDay()]}, ${base}` : base
}

// Formats a "HH:MM:SS" time string into "HH:MM".
export function formatTime(time) {
  if (!time) return null
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

// Greeting based on the current hour of the day.
export function getGreeting(date = new Date(), locale = 'en') {
  const hour = (date instanceof Date ? date : new Date(date)).getHours()
  const { greetings } = getLocaleData(locale)
  if (hour < 11) return greetings.morning
  if (hour < 15) return greetings.afternoon
  if (hour < 19) return greetings.evening
  return greetings.night
}

// Day of the month for a Date or a "YYYY-MM-DD" key.
export function getDate(date = new Date()) {
  const d = date instanceof Date ? date : fromDateKey(date)
  return d.getDate()
}
// Localized month name for a Date or a "YYYY-MM-DD" key.
export function getMonthName(date = new Date(), locale = 'en') {
  const d = date instanceof Date ? date : fromDateKey(date)
  return getLocaleData(locale).months[d.getMonth()]
}

// Calendar year for a Date or a "YYYY-MM-DD" key.
export function getYear(date = new Date()) {
  const d = date instanceof Date ? date : fromDateKey(date)
  return d.getFullYear()
}

// Localized weekday name, e.g. "Monday" / "Senin".
export function getWeekday(date = new Date(), locale = 'en') {
  const d = date instanceof Date ? date : fromDateKey(date)
  return getLocaleData(locale).weekdays[d.getDay()]
}
// Localized short weekday, e.g. "Mon" / "Sen".
export function getWeekdayShort(date = new Date(), locale = 'en') {
  const d = date instanceof Date ? date : fromDateKey(date)
  return getLocaleData(locale).weekdaysShort[d.getDay()]
}

// Full month names for chart labels (e.g. the heatmap).
export function getMonthNames(locale = 'en', { short = false } = {}) {
  const data = getLocaleData(locale)
  return [...(short ? data.monthsShort : data.months)]
}

// Weekday names for chart labels. `start` is the index of the first day
// (0 = Sunday, 1 = Monday).
export function getWeekdayNames(locale = 'en', { short = false, start = 0 } = {}) {
  const data = getLocaleData(locale)
  const names = short ? data.weekdaysShort : data.weekdays
  return [...names.slice(start), ...names.slice(0, start)]
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

// Short localized date, e.g. "18 Oct 2026" / "18 Okt 2026".
export function formatShortDate(date, locale = 'en') {
  const d = date instanceof Date ? date : new Date(date)
  const data = getLocaleData(locale)
  const day = d.getDate()
  const month = data.monthsShort[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

// Friendly label for a due date: "Today", "Tomorrow" or the short date.
export function formatDueLabel(dateKey, locale = 'en') {
  if (!dateKey) return null
  const data = getLocaleData(locale)
  if (isToday(dateKey)) return data.today
  if (isTomorrow(dateKey)) return data.tomorrow
  return formatShortDate(fromDateKey(dateKey), locale)
}
