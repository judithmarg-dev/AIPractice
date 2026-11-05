// Dashboard CSV exports (RF-7.8).
import { CsvNumber, toCsv, type CsvCell } from '@/lib/csv'
import { centsToDecimal } from '@/lib/money'
import { describeLine, lineCost, lineSubtotal } from '@/lib/orderMath'
import { isoDate, type Period } from '@/lib/period'
import { MODE_LABEL, STATUS_LABEL, formatTime } from '@/lib/texts'
import type { DashboardData, IndexedOrder } from '@/lib/dashboard'
import type { Category } from '@/types/models'

const money = (cents: number) => new CsvNumber(centsToDecimal(cents))

/** "semana-2026-10-12": the period kind and its first day. */
export function periodSlug(period: Period): string {
  return `${period.kind}-${isoDate(period.start)}`
}

export function summaryCsv(data: DashboardData): string {
  const headers = ['fecha', 'hora', 'ordenes', 'ingresos', 'ganancia', 'ordenes_presencial', 'ordenes_delivery']
  const { current } = data
  const rows: CsvCell[][] = data.buckets.map((b, i) => [
    b.date,
    b.hour,
    current.bucketOrders[i],
    money(current.bucketRevenue[i]),
    money(current.bucketProfit[i]),
    current.bucketPresencial[i],
    current.bucketDelivery[i],
  ])
  return toCsv(headers, rows)
}

/** One row per line of every order created in the period, cancelled ones included. */
export function detailCsv(index: IndexedOrder[], period: Period, categories: Record<string, Category>): string {
  const headers = [
    'orden', 'estado', 'fecha', 'hora', 'servicio', 'producto', 'categoria', 'bolas', 'sabores', 'envase', 'extras',
    'toppings', 'cantidad', 'precio_unitario', 'costo_unitario', 'subtotal_linea', 'recargo_orden', 'iva_orden', 'total_orden',
  ]
  const start = period.start.getTime()
  const end = period.end.getTime()
  const rows: CsvCell[][] = []
  const orders = index.filter((e) => e.created >= start && e.created < end).sort((a, b) => a.created - b.created)
  for (const { order, created } of orders) {
    for (const line of order.lines) {
      const cost = lineCost(line)
      rows.push([
        order.number,
        STATUS_LABEL[order.status],
        isoDate(new Date(created)),
        formatTime(order.createdAt),
        MODE_LABEL[order.mode],
        describeLine(line).title,
        categories[line.categoryId]?.name ?? '',
        line.build ? line.build.scoops.length : '',
        line.build ? line.build.scoops.map((s) => s.name).join(' + ') : '',
        line.build?.container?.name ?? line.note ?? '',
        line.build ? line.build.extras.map((o) => o.name).join(' + ') : '',
        line.build ? line.build.toppings.map((o) => o.name).join(' + ') : '',
        line.qty,
        money(line.unitPriceCents),
        cost.incomplete && cost.cents === 0 ? '' : money(cost.cents / line.qty),
        money(lineSubtotal(line)),
        money(order.surchargeCents),
        money(order.ivaCents),
        money(order.totalCents),
      ])
    }
  }
  return toCsv(headers, rows)
}
