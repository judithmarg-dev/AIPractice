import {
  getBookingsByDay,
  getBookingsByTimeSlot,
  getBookingsByDayOfWeek,
  getLowStockItems,
  getAnalyticsSummary,
  LOW_STOCK_THRESHOLD,
} from '@/lib/analytics'
import { StatTile } from '@/components/staff/StatTile'
import { BookingTrendChart } from '@/components/charts/BookingTrendChart'
import { TimeSlotChart } from '@/components/charts/TimeSlotChart'
import { DayOfWeekChart } from '@/components/charts/DayOfWeekChart'
import { ExportButton } from './ExportButton'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const [byDay, bySlot, byDow, lowStock, summary] = await Promise.all([
    getBookingsByDay(30),
    getBookingsByTimeSlot(),
    getBookingsByDayOfWeek(),
    getLowStockItems(),
    getAnalyticsSummary(),
  ])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>Analytics</h1>
        <ExportButton />
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-3 gap-4">
        <StatTile
          label="Bookings this week"
          value={summary.totalThisWeek}
          accent
        />
        <StatTile
          label="Most popular slot"
          value={summary.mostPopularSlot ?? '—'}
        />
        <StatTile
          label="Low stock items"
          value={summary.lowStockCount}
          sublabel={`≤ ${LOW_STOCK_THRESHOLD} units`}
          accent={summary.lowStockCount > 0}
        />
      </div>

      {/* Charts */}
      <BookingTrendChart data={byDay} />
      <div className="grid grid-cols-2 gap-4">
        <TimeSlotChart data={bySlot} />
        <DayOfWeekChart data={byDow} />
      </div>

      {/* Low stock table */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-h)' }}>
          Low stock alerts
        </h2>
        {lowStock.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text)' }}>All items are sufficiently stocked.</p>
        ) : (
          <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--accent-bg)' }}>
                  {['Item', 'Category', 'Stock'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-h)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-h)' }}>{item.name}</td>
                    <td className="px-4 py-3 capitalize" style={{ color: 'var(--text)' }}>{item.category}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#ef4444' }}>{item.inventory_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
