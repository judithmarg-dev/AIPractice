'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import type { SlotCount } from '@/types/analytics'
import { EmptyState, ChartWrapper } from './BookingTrendChart'

export function TimeSlotChart({ data }: { data: SlotCount[] }) {
  if (!data.length) return <EmptyState label="No time slot data yet." />
  return (
    <ChartWrapper title="Bookings by time slot">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text)' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text)' }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}
