import { createClient } from '@/lib/supabaseServer'
import type { DailyCount, SlotCount, DayCount, LowStockItem, AnalyticsSummary } from '@/types/analytics'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const LOW_STOCK_THRESHOLD = 5

export async function getBookingsByDay(daysBack = 30): Promise<DailyCount[]> {
  const supabase = await createClient()
  const since = new Date()
  since.setDate(since.getDate() - daysBack)

  const { data } = await supabase
    .from('bookings')
    .select('date')
    .gte('date', since.toISOString().slice(0, 10))
    .order('date')

  if (!data) return []

  const counts: Record<string, number> = {}
  for (const row of data) {
    counts[row.date] = (counts[row.date] ?? 0) + 1
  }
  return Object.entries(counts).map(([date, count]) => ({ date, count }))
}

export async function getBookingsByTimeSlot(): Promise<SlotCount[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('bookings').select('time')
  if (!data) return []

  const counts: Record<string, number> = {}
  for (const row of data) {
    counts[row.time] = (counts[row.time] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time))
}

export async function getBookingsByDayOfWeek(): Promise<DayCount[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('bookings').select('date')
  if (!data) return []

  const counts: number[] = Array(7).fill(0)
  for (const row of data) {
    const dow = new Date(row.date + 'T12:00:00').getDay()
    counts[dow]++
  }
  return DAYS.map((day, i) => ({ day, count: counts[i] }))
}

export async function getLowStockItems(): Promise<LowStockItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ice_creams')
    .select('id, name, category, inventory_count')
    .eq('archived', false)
    .lte('inventory_count', LOW_STOCK_THRESHOLD)
    .order('inventory_count')
  return data ?? []
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = await createClient()

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [{ count: totalThisWeek }, slotData, lowStock] = await Promise.all([
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString()),
    getBookingsByTimeSlot(),
    getLowStockItems(),
  ])

  const mostPopularSlot = slotData.length
    ? slotData.reduce((a, b) => (b.count > a.count ? b : a)).time
    : null

  return {
    totalThisWeek: totalThisWeek ?? 0,
    mostPopularSlot,
    lowStockCount: lowStock.length,
  }
}
