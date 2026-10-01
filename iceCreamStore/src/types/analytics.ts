export interface DailyCount {
  date: string
  count: number
}

export interface SlotCount {
  time: string
  count: number
}

export interface DayCount {
  day: string
  count: number
}

export interface LowStockItem {
  id: string
  name: string
  category: string
  inventory_count: number
}

export interface AnalyticsSummary {
  totalThisWeek: number
  mostPopularSlot: string | null
  lowStockCount: number
}
