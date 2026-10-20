import { addDays, diffInDays, todayKey } from './dateUtils'

// Streak algorithm.
// Receives a list of "YYYY-MM-DD" check-in keys and computes:
//   - currentStreak: consecutive days ending today (or yesterday, so a streak
//     stays alive until the current day is missed).
//   - bestStreak: the longest consecutive run in the whole history.
export function calculateStreaks(logDates = [], referenceKey = todayKey()) {
  if (!logDates || logDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 }
  }

  // De-duplicate and sort ascending.
  const uniqueDates = [...new Set(logDates)].sort()

  // Longest consecutive run (best streak).
  let bestStreak = 1
  let run = 1
  for (let i = 1; i < uniqueDates.length; i += 1) {
    if (diffInDays(uniqueDates[i], uniqueDates[i - 1]) === 1) {
      run += 1
    } else {
      run = 1
    }
    if (run > bestStreak) bestStreak = run
  }

  // Current streak: count backwards from today.
  const dateSet = new Set(uniqueDates)
  let cursor = referenceKey

  // If today is not checked in yet, the streak can still be alive if the last
  // check-in was yesterday. Otherwise the current streak is broken.
  if (!dateSet.has(cursor)) {
    cursor = addDays(referenceKey, -1)
    if (!dateSet.has(cursor)) {
      return { currentStreak: 0, bestStreak }
    }
  }

  let currentStreak = 0
  while (dateSet.has(cursor)) {
    currentStreak += 1
    cursor = addDays(cursor, -1)
  }

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) }
}
