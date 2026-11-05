import { Area, CartesianGrid, ComposedChart, Line, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Icon } from '@/components/icons'
import type { DashboardData } from '@/lib/dashboard'
import { CHART, ChartCard } from './ChartCard'

const hh = (h: number) => `${String(h).padStart(2, '0')}:00`
const round1 = (n: number) => Math.round(n * 10) / 10

/** RF-7.4.b — orders per hour of day; daily average for weeks and months; peak marked. */
export function HourlyChart({ data, compare }: { data: DashboardData; compare: boolean }) {
  const { hourlyAverage, prevHourlyAverage, peak, hourlyIsAverage } = data
  const rows = hourlyAverage.map((v, h) => ({ hour: hh(h), current: round1(v), previous: round1(prevHourlyAverage[h]) }))
  const peakValue = peak ? round1(hourlyAverage[peak.hour]) : 0
  const unit = (v: number) => `${v} ${v === 1 ? 'orden' : 'órdenes'}${hourlyIsAverage ? ' por día' : ''}`

  return (
    <ChartCard
      wide
      title="Tendencia horaria y comparativa"
      subtitle={hourlyIsAverage ? 'Promedio de órdenes por día en cada hora' : 'Órdenes por hora del día'}
      summary={peak ? `Hora pico: ${hh(peak.hour)}, ${unit(peakValue)}` : 'Sin órdenes en el período'}
      values={rows.filter((r) => r.current > 0).map((r) => `${r.hour}: ${unit(r.current)}`)}
      empty={peak ? null : 'No hay órdenes registradas en este período.'}
      actions={
        <p className="legend legend--inline">
          <span className="legend__item"><span className="legend__swatch legend__swatch--current" /> Actual</span>
          {compare && <span className="legend__item"><span className="legend__swatch legend__swatch--previous" /> Anterior</span>}
        </p>
      }
    >
      {peak && (
        <p className="callout callout--warning">
          <span>
            <Icon name="clock" size={16} /> <strong>Hora pico registrada:</strong> {hh(peak.hour)} – {hh((peak.hour + 1) % 24)}
          </span>
          <strong>Pico: {unit(peakValue)}</strong>
        </p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={rows} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
          <defs>
            <linearGradient id="hourly-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.current} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART.current} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="hour" tick={CHART.axis} tickLine={false} axisLine={false} interval={2} />
          <YAxis tick={CHART.axis} tickLine={false} axisLine={false} width={32} allowDecimals={hourlyIsAverage} />
          <Tooltip {...CHART.tooltip} formatter={(v, name) => [unit(Number(v)), name === 'current' ? 'Período actual' : 'Período anterior']} />
          <Area type="monotone" dataKey="current" stroke={CHART.current} strokeWidth={2.5} fill="url(#hourly-fill)" isAnimationActive={false} />
          {compare && (
            <Line type="monotone" dataKey="previous" stroke={CHART.previous} strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
          )}
          {peak && (
            <ReferenceDot
              x={hh(peak.hour)}
              y={peakValue}
              r={6}
              fill="var(--warning)"
              stroke="var(--warning-text)"
              strokeWidth={2}
              label={{ value: 'Pico', position: 'top', fill: 'var(--text-h)', fontSize: 11, fontWeight: 700 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
