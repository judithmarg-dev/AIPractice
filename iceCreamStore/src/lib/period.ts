// Calendar periods in local time: a day, a Monday–Sunday week or a calendar month.

export type PeriodKind = 'dia' | 'semana' | 'mes'

export interface Period {
  kind: PeriodKind
  /** Inclusive start, local midnight. */
  start: Date
  /** Exclusive end. */
  end: Date
}

export interface Bucket {
  start: number
  end: number
  /** Axis label: "13:00", "lun 12" or "12". */
  label: string
  /** CSV columns. */
  date: string
  hour: string
}

const DAY_MS = 86400000

export const PERIOD_KIND_LABEL: Record<PeriodKind, string> = { dia: 'Día', semana: 'Semana', mes: 'Mes' }
export const CURRENT_LABEL: Record<PeriodKind, string> = { dia: 'Hoy', semana: 'Esta semana', mes: 'Este mes' }

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

export function periodContaining(kind: PeriodKind, date: Date): Period {
  const day = startOfDay(date)
  if (kind === 'dia') return { kind, start: day, end: addDays(day, 1) }
  if (kind === 'semana') {
    const start = addDays(day, -((day.getDay() + 6) % 7))
    return { kind, start, end: addDays(start, 7) }
  }
  const start = new Date(day.getFullYear(), day.getMonth(), 1)
  return { kind, start, end: new Date(day.getFullYear(), day.getMonth() + 1, 1) }
}

export function shiftPeriod(period: Period, direction: -1 | 1): Period {
  const { kind, start } = period
  if (kind === 'dia') return periodContaining(kind, addDays(start, direction))
  if (kind === 'semana') return periodContaining(kind, addDays(start, 7 * direction))
  return periodContaining(kind, new Date(start.getFullYear(), start.getMonth() + direction, 1))
}

export const previousPeriod = (period: Period) => shiftPeriod(period, -1)

export function isCurrentPeriod(period: Period, now: Date): boolean {
  return now >= period.start && now < period.end
}

/** Never move past the period that contains today. */
export function canGoNext(period: Period, now: Date): boolean {
  return period.end <= periodContaining(period.kind, now).start
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function periodLabel(period: Period): string {
  const { kind, start } = period
  if (kind === 'dia') {
    return capitalize(start.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
  }
  if (kind === 'mes') return capitalize(start.toLocaleDateString('es', { month: 'long', year: 'numeric' }))
  const last = addDays(period.end, -1)
  const month = (d: Date) => d.toLocaleDateString('es', { month: 'long' })
  if (start.getFullYear() !== last.getFullYear()) {
    return `Semana del ${start.getDate()} de ${month(start)} de ${start.getFullYear()} al ${last.getDate()} de ${month(last)} de ${last.getFullYear()}`
  }
  if (start.getMonth() !== last.getMonth()) {
    return `Semana del ${start.getDate()} de ${month(start)} al ${last.getDate()} de ${month(last)} de ${last.getFullYear()}`
  }
  return `Semana del ${start.getDate()} al ${last.getDate()} de ${month(last)} de ${last.getFullYear()}`
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const hh = (h: number) => `${String(h).padStart(2, '0')}:00`

/** Hours of the day for a day period, days otherwise. */
export function periodBuckets(period: Period): Bucket[] {
  const buckets: Bucket[] = []
  if (period.kind === 'dia') {
    const { start } = period
    for (let h = 0; h < 24; h++) {
      const s = new Date(start.getFullYear(), start.getMonth(), start.getDate(), h)
      const e = new Date(start.getFullYear(), start.getMonth(), start.getDate(), h + 1)
      buckets.push({ start: s.getTime(), end: e.getTime(), label: hh(h), date: isoDate(start), hour: hh(h) })
    }
    return buckets
  }
  for (let d = period.start; d < period.end; d = addDays(d, 1)) {
    const label =
      period.kind === 'semana'
        ? `${d.toLocaleDateString('es', { weekday: 'short' }).replace('.', '')} ${d.getDate()}`
        : String(d.getDate())
    buckets.push({ start: d.getTime(), end: addDays(d, 1).getTime(), label, date: isoDate(d), hour: '' })
  }
  return buckets
}

/** Days of the period that have started by `now` (all of them for past periods), at least 1. */
export function elapsedDays(period: Period, now: Date): number {
  const until = now < period.end ? addDays(startOfDay(now), 1) : period.end
  return Math.max(1, Math.round((until.getTime() - period.start.getTime()) / DAY_MS))
}

/** Index of the local day of `ts` counted from `start` (DST-safe). */
export function dayIndex(start: Date, ts: number): number {
  return Math.round((startOfDay(new Date(ts)).getTime() - start.getTime()) / DAY_MS)
}
