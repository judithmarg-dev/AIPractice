import { Icon } from '@/components/icons'
import { formatMoney } from '@/lib/money'
import { describeLine, lineSubtotal } from '@/lib/orderMath'
import { MODE_LABEL, formatAge, formatTime } from '@/lib/texts'
import type { Order, OrderLine, Settings } from '@/types/models'

export type Urgency = 'ok' | 'amber' | 'red'

export function urgencyOf(createdAt: string, now: number, settings: Pick<Settings, 'queueAmberMinutes' | 'queueRedMinutes'>): Urgency {
  const minutes = (now - new Date(createdAt).getTime()) / 60000
  if (minutes >= settings.queueRedMinutes) return 'red'
  if (minutes >= settings.queueAmberMinutes) return 'amber'
  return 'ok'
}

const URGENCY_TEXT: Record<Urgency, string> = { ok: 'A tiempo', amber: 'Demorado', red: 'Urgente' }

function LineDetail({ line }: { line: OrderLine }) {
  const { title } = describeLine(line)
  const rows: [string, string][] = []
  if (line.build) {
    rows.push(['Bolas', line.build.scoops.map((s) => s.name).join(' + ')])
    if (line.build.container) rows.push(['Envase', line.build.container.name])
    if (line.build.extras.length) rows.push(['Extras', line.build.extras.map((o) => o.name).join(', ')])
    if (line.build.toppings.length) rows.push(['Toppings', line.build.toppings.map((o) => o.name).join(', ')])
  } else if (line.note) {
    rows.push(['Envase', line.note])
  }
  return (
    <li className="queue-card__line">
      <div className="queue-card__line-head">
        <span className="queue-card__line-name">
          <span className="queue-card__qty">{line.qty} ×</span> {title}
        </span>
        <span className="queue-card__line-price">{formatMoney(lineSubtotal(line))}</span>
      </div>
      {rows.length > 0 && (
        <dl className="queue-card__line-detail">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}:</dt> <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  )
}

interface QueueCardProps {
  order: Order
  now: number
  settings: Settings
  editing: boolean
  onCharge: () => void
  onEdit: () => void
  onCancel: () => void
}

export function QueueCard({ order, now, settings, editing, onCharge, onEdit, onCancel }: QueueCardProps) {
  const urgency = urgencyOf(order.createdAt, now, settings)
  const titleId = `queue-${order.id}`
  return (
    <article className={`queue-card queue-card--${urgency}`} aria-labelledby={titleId}>
      <header className="queue-card__head">
        <div>
          <h2 id={titleId} className="queue-card__number">Orden #{order.number}</h2>
          <p className="queue-card__time">
            <time dateTime={order.createdAt}>{formatTime(order.createdAt)}</time>
          </p>
        </div>
        <span className="chip chip--neutral queue-card__mode">
          <Icon name={order.mode === 'delivery' ? 'bike' : 'store'} size={16} />
          {MODE_LABEL[order.mode]}
        </span>
      </header>

      <p className={`queue-card__age queue-card__age--${urgency}`}>
        <Icon name={urgency === 'ok' ? 'clock' : 'alert'} size={16} />
        <span>{formatAge(order.createdAt, now)}</span>
        <span className="queue-card__age-label">· {URGENCY_TEXT[urgency]}</span>
      </p>

      {editing && (
        <p className="chip chip--accent queue-card__editing">
          <Icon name="edit" size={14} /> Se está editando en el menú
        </p>
      )}

      {(order.customer || order.note || order.address) && (
        <ul className="queue-card__meta">
          {order.customer && (
            <li><Icon name="user" size={16} /><span className="sr-only">Cliente:</span> {order.customer}</li>
          )}
          {order.note && (
            <li><Icon name="note" size={16} /><span className="sr-only">Nota:</span> {order.note}</li>
          )}
          {order.address && (
            <li><Icon name="pin" size={16} /><span className="sr-only">Dirección:</span> {order.address}</li>
          )}
        </ul>
      )}

      <ul className="queue-card__lines">
        {order.lines.map((line) => (
          <LineDetail key={line.lineId} line={line} />
        ))}
      </ul>

      <dl className="queue-card__totals">
        <div><dt>Subtotal</dt><dd>{formatMoney(order.subtotalCents)}</dd></div>
        {order.surchargeCents > 0 && (
          <div><dt>Recargo delivery</dt><dd>{formatMoney(order.surchargeCents)}</dd></div>
        )}
        <div><dt>IVA</dt><dd>{formatMoney(order.ivaCents)}</dd></div>
        <div className="queue-card__total"><dt>Total</dt><dd>{formatMoney(order.totalCents)}</dd></div>
      </dl>

      <div className="queue-card__actions">
        <button type="button" className="btn btn--primary btn--block" onClick={onCharge}>
          <Icon name="money" size={18} /> Cobrar {formatMoney(order.totalCents)}
        </button>
        <div className="queue-card__actions-row">
          <button type="button" className="btn btn--secondary" onClick={onEdit}>
            <Icon name="edit" size={18} /> Editar
          </button>
          <button type="button" className="btn btn--warning" onClick={onCancel}>
            <Icon name="close" size={18} /> Cancelar pedido
          </button>
        </div>
      </div>
    </article>
  )
}
