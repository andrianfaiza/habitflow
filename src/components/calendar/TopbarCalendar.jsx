import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import {
  addDays,
  addMonths,
  buildDateRange,
  formatDisplayDate,
  fromDateKey,
  getMonthName,
  getWeekdayShort,
  getYear,
  getWeekday,
  todayKey,
} from '../../utils/dateUtils'
import { useTranslation } from '../../i18n'
import {
  DEFAULT_HABIT_COLOR,
  DEFAULT_TASK_COLOR,
  getColorTag,
} from '../../utils/constants'

// Fixed card geometry so the centered date can be derived from scrollLeft.
const CARD_WIDTH = 56
const CARD_GAP = 8
const STEP = CARD_WIDTH + CARD_GAP

// Amount of days added when the user scrolls near either edge.
const EXTEND_DAYS = 92
const EDGE_THRESHOLD = STEP * 10

// Initial window: six months in the past and six months in the future.
function buildInitialRange() {
  const today = todayKey()
  return buildDateRange(addMonths(today, -6), addMonths(today, 6))
}

// Expandable topbar calendar with a continuously scrollable date strip.
// The visible month/year header follows the card at the center of the viewport.
export function TopbarCalendar({ selectedDate, onSelect, tasks = [], habits = [] }) {
  const { t, locale } = useTranslation()
  const [dateKeys, setDateKeys] = useState(buildInitialRange)
  const [centerDate, setCenterDate] = useState(selectedDate || todayKey())
  const [expanded, setExpanded] = useState(false)

  const scrollRef = useRef(null)
  const dateKeysRef = useRef(dateKeys)
  const centerDateRef = useRef(centerDate)
  const pendingAdjustRef = useRef(0)
  const frameRef = useRef(0)
  const extendingRef = useRef(false)
  const hasCenteredRef = useRef(false)
  const prevExpandedRef = useRef(false)

  // Keep refs in sync so the rAF scroll handler never reads stale values.
  useEffect(() => {
    dateKeysRef.current = dateKeys
  }, [dateKeys])

  useEffect(() => {
    centerDateRef.current = centerDate
  }, [centerDate])

  // Color dots per date. Tasks are tied to their due date, while habits are
  // daily and therefore contribute to every visible date. Colors are deduped
  // because the strip communicates which tags are present, not item counts.
  const dateDots = useMemo(() => {
    const map = new Map()

    const add = (key, colorId, fallback) => {
      if (!key) return
      const color = getColorTag(colorId, fallback)
      const entry = map.get(key) ?? { colors: [], seen: new Set() }
      if (!entry.seen.has(color.id)) {
        entry.seen.add(color.id)
        entry.colors.push(color.hex)
      }
      map.set(key, entry)
    }

    tasks.forEach((task) => add(task.due_date, task.color, DEFAULT_TASK_COLOR))
    habits.forEach((habit) => {
      dateKeys.forEach((key) => add(key, habit.color, DEFAULT_HABIT_COLOR))
    })

    return map
  }, [tasks, habits, dateKeys])

  const scrollToIndex = useCallback((index, behavior = 'smooth') => {
    const el = scrollRef.current
    if (!el || index < 0) return
    const left = index * STEP + CARD_WIDTH / 2 - el.clientWidth / 2
    el.scrollTo({ left: Math.max(0, left), behavior })
  }, [])

  // Center the selected date on first mount and whenever the strip re-opens.
  useLayoutEffect(() => {
    if (!expanded) {
      prevExpandedRef.current = false
      return
    }

    const wasExpanded = prevExpandedRef.current
    prevExpandedRef.current = true
    if (hasCenteredRef.current && wasExpanded) return

    const index = dateKeysRef.current.indexOf(selectedDate)
    if (index >= 0) {
      scrollToIndex(index, 'auto')
      // Reflect the selected date immediately in the header.
      setCenterDate(selectedDate)
      hasCenteredRef.current = true
    }
  }, [expanded, selectedDate, scrollToIndex])

  // Detect the centered date and grow the list at the edges.
  const handleScroll = useCallback(() => {
    if (frameRef.current) return

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      const el = scrollRef.current
      if (!el) return

      const keys = dateKeysRef.current

      if (!extendingRef.current) {
        if (el.scrollLeft < EDGE_THRESHOLD) {
          // Prepend past dates and remember how far to shift the scroll.
          const first = keys[0]
          const extra = buildDateRange(addDays(first, -EXTEND_DAYS), addDays(first, -1))
          if (extra.length > 0) {
            extendingRef.current = true
            pendingAdjustRef.current = extra.length * STEP
            setDateKeys((prev) => [...extra, ...prev])
          }
        } else if (el.scrollLeft + el.clientWidth > el.scrollWidth - EDGE_THRESHOLD) {
          // Append future dates.
          const last = keys[keys.length - 1]
          const extra = buildDateRange(addDays(last, 1), addDays(last, EXTEND_DAYS))
          if (extra.length > 0) {
            extendingRef.current = true
            setDateKeys((prev) => [...prev, ...extra])
          }
        }
      }

      // The card closest to the horizontal center of the viewport.
      const rawIndex = Math.round(
        (el.scrollLeft + el.clientWidth / 2 - CARD_WIDTH / 2) / STEP,
      )
      const index = Math.min(Math.max(rawIndex, 0), keys.length - 1)
      const key = keys[index]
      if (key && key !== centerDateRef.current) {
        centerDateRef.current = key
        setCenterDate(key)
      }
    })
  }, [])

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        // Reset the id: a cancelled frame must not block future scroll events.
        frameRef.current = 0
      }
    }
  }, [])

  // Preserve the visual position after prepending dates.
  useLayoutEffect(() => {
    // Keep the scroll handler in sync before the next paint.
    dateKeysRef.current = dateKeys
    const el = scrollRef.current
    if (el && pendingAdjustRef.current > 0) {
      el.scrollLeft += pendingAdjustRef.current
    }
    pendingAdjustRef.current = 0
    extendingRef.current = false
  }, [dateKeys])

  const handleSelect = useCallback(
    (key) => {
      onSelect(key)
      setCenterDate(key)
      centerDateRef.current = key
      const index = dateKeysRef.current.indexOf(key)
      if (index >= 0) scrollToIndex(index, 'smooth')
    },
    [onSelect, scrollToIndex],
  )

  function handleToday() {
    handleSelect(todayKey())
  }

  // Move the strip by a number of days while keeping the header in sync.
  function nudge(days) {
    const currentIndex = dateKeysRef.current.indexOf(centerDateRef.current)
    if (currentIndex < 0) return
    const targetIndex = Math.min(
      Math.max(currentIndex + days, 0),
      dateKeysRef.current.length - 1,
    )
    const key = dateKeysRef.current[targetIndex]
    if (!key) return
    setCenterDate(key)
    centerDateRef.current = key
    scrollToIndex(targetIndex, 'smooth')
  }

  const center = fromDateKey(centerDate)
  const today = todayKey()

  return (
    <section className="m3-card overflow-hidden rounded-3xl shadow-m3-1">
      {/* Header: year, month, Date and controls */}
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            {getYear(center)}
          </p>
          <h3 className="truncate text-xl font-semibold text-on-surface sm:text-2xl">
            {getMonthName(center, locale)}
            {!expanded
              ? t('calendar.headerDetail', {
                  day: center.getDate(),
                  weekday: getWeekday(center, locale),
                })
              : null}
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {expanded ? (
            <>
          <button
            type="button"
            onClick={handleToday}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-2 text-xs font-semibold text-on-primary-container transition-colors hover:bg-primary-container/80"
            >
            <CalendarDays size={14} />
            <span className="hidden sm:inline">{t('calendar.today')}</span>
          </button>
          <IconButton label={t('calendar.previousWeek')} onClick={() => nudge(-7)}>
            <ChevronLeft size={16} />
          </IconButton>
          <IconButton label={t('calendar.nextWeek')} onClick={() => nudge(7)}>
            <ChevronRight size={16} />
          </IconButton>
            </>
          ) : null}
          <IconButton
            label={expanded ? t('calendar.hide') : t('calendar.show')}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </div>
      </div>

      {/* Horizontal, continuously scrollable date strip */}
      {expanded ? (
        <DateStrip
          dateKeys={dateKeys}
          selectedDate={selectedDate}
          today={today}
          dateDots={dateDots}
          onSelect={handleSelect}
          scrollRef={scrollRef}
          onScroll={handleScroll}
        />
      ) : null}
    </section>
  )
}

// Memoized strip: scrolling updates the header every few pixels, but the cards
// only need to re-render when the selection, range or task markers change.
const DateStrip = memo(function DateStrip({
  dateKeys,
  selectedDate,
  today,
  dateDots,
  onSelect,
  scrollRef,
  onScroll,
}) {
  const { t, locale } = useTranslation()

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="m3-scrollbar flex gap-2 overflow-x-auto pb-5 pt-1"
      role="listbox"
      aria-label={t('calendar.selectDate')}
    >
      {dateKeys.map((key) => {
        const date = fromDateKey(key)
        const isSelected = key === selectedDate
        const isToday = key === today
        const colors = dateDots.get(key)?.colors ?? []
        const extra = Math.max(0, colors.length - 3)

        return (
          <button
            key={key}
            type="button"
            role="option"
            aria-selected={isSelected}
            aria-label={t('calendar.selectDateLabel', {
              date: formatDisplayDate(date, { locale }),
            })}
            onClick={() => onSelect(key)}
            style={{ width: CARD_WIDTH }}
            className={`flex h-[68px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border transition-all duration-200 ${
              isSelected
                ? 'scale-105 border-transparent bg-primary text-on-primary shadow-[0_0_22px_rgba(103,80,164,0.45)] ring-2 ring-primary/30'
                : isToday
                  ? 'border-primary/50 bg-primary-container/50 text-on-primary-container hover:bg-primary-container'
                  : 'border-outline-variant bg-surface text-on-surface hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-variant'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
              {getWeekdayShort(date, locale)}
            </span>
            <span className="text-base font-semibold leading-none">{date.getDate()}</span>
            <span
              aria-hidden="true"
              className="flex h-2 items-center justify-center gap-1"
            >
              {colors.slice(0, 3).map((hex) => (
                <span
                  key={hex}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: hex,
                    boxShadow: isSelected ? '0 0 0 1px rgba(255,255,255,0.55)' : undefined,
                  }}
                />
              ))}
              {extra > 0 ? (
                <span
                  className={`text-[8px] font-semibold leading-none ${
                    isSelected ? 'text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  +{extra}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
})

function IconButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant"
    >
      {children}
    </button>
  )
}
