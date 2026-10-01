'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import type { DailyCount } from '@/types/analytics'

export function BookingTrendChart({ data }: { data: DailyCount[] }) {
  if (!data.length) {
    return <EmptyState label="No booking data yet." />
  }
  return (
    <ChartWrapper title="Bookings over time (last 30 days)">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text)' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text)' }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
          <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

function ChartWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
      <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-h)' }}>{title}</p>
      {children}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border p-8 flex items-center justify-center" style={{ borderColor: 'var(--border)' }}>
      <p className="text-sm" style={{ color: 'var(--text)' }}>{label}</p>
    </div>
  )
}

export { ChartWrapper, EmptyState }
