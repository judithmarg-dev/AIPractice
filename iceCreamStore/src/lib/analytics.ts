import type { Booking } from '@/types/booking'
import type { IceCream } from '@/types/iceCream'
import type { DailyCount, SlotCount, DayCount, LowStockItem, AnalyticsSummary } from '@/types/analytics'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const LOW_STOCK_THRESHOLD = 5

export function getBookingsByDay(bookings: Booking[], daysBack = 30): DailyCount[] {
  const since = new Date()
  since.setDate(since.getDate() - daysBack)
  const sinceStr = since.toISOString().slice(0, 10)

  const filtered = bookings.filter((b) => b.date >= sinceStr)
  const counts: Record<string, number> = {}
  for (const row of filtered) {
    counts[row.date] = (counts[row.date] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getBookingsByTimeSlot(bookings: Booking[]): SlotCount[] {
  const counts: Record<string, number> = {}
  for (const row of bookings) {
    counts[row.time] = (counts[row.time] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time))
}

export function getBookingsByDayOfWeek(bookings: Booking[]): DayCount[] {
  const counts: number[] = Array(7).fill(0)
  for (const row of bookings) {
    const dow = new Date(row.date + 'T12:00:00').getDay()
    counts[dow]++
  }
  return DAYS.map((day, i) => ({ day, count: counts[i] }))
}

export function getLowStockItems(items: IceCream[]): LowStockItem[] {
  return items
    .filter((i) => i.inventory_count <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.inventory_count - b.inventory_count)
    .map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      inventory_count: i.inventory_count,
    }))
}

export function getAnalyticsSummary(bookings: Booking[], items: IceCream[]): AnalyticsSummary {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString()

  const totalThisWeek = bookings.filter((b) => b.created_at >= weekAgoStr).length
  const slotData = getBookingsByTimeSlot(bookings)
  const lowStock = getLowStockItems(items)

  const mostPopularSlot = slotData.length
    ? slotData.reduce((a, b) => (b.count > a.count ? b : a)).time
    : null

  return {
    totalThisWeek,
    mostPopularSlot,
    lowStockCount: lowStock.length,
  }
}
