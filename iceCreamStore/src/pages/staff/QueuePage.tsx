import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectEditingId, selectQueue } from '@/store/slices/orderSlice'
import { selectSettings } from '@/store/slices/settingsSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { cancelQueued, chargeQueued } from '@/store/orderActions'
import { useConfirm } from '@/components/ui/ConfirmProvider'
import { QueueCard } from '@/components/queue/QueueCard'
import { Icon } from '@/components/icons'
import { useNow } from '@/hooks/useNow'
import { useEditOrder } from '@/hooks/useEditOrder'
import { formatMoney } from '@/lib/money'
import { MODE_LABEL } from '@/lib/texts'
import type { Order, ServiceMode } from '@/types/models'

type Filter = 'todos' | ServiceMode

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'presencial', label: MODE_LABEL.presencial },
  { id: 'delivery', label: MODE_LABEL.delivery },
]

export default function QueuePage() {
  const dispatch = useAppDispatch()
  const confirm = useConfirm()
  const editOrder = useEditOrder()
  const queue = useAppSelector(selectQueue)
  const editingId = useAppSelector(selectEditingId)
  const settings = useAppSelector(selectSettings)
  const now = useNow(30000)
  const [filter, setFilter] = useState<Filter>('todos')

  const visible = filter === 'todos' ? queue : queue.filter((o) => o.mode === filter)
  const pendingTotal = queue.reduce((s, o) => s + o.totalCents, 0)

  async function handleCharge(order: Order) {
    const ok = await confirm({
      title: `¿Cobrar ${formatMoney(order.totalCents)}?`,
      message:
        order.id === editingId
          ? `La Orden #${order.number} se está editando en el menú; los cambios sin guardar se perderán.`
          : `Orden #${order.number} · ${MODE_LABEL[order.mode]}`,
      confirmLabel: `Cobrar ${formatMoney(order.totalCents)}`,
    })
    if (ok && dispatch(chargeQueued(order.id))) {
      dispatch(pushToast({ message: `Orden #${order.number} cobrada · ${formatMoney(order.totalCents)}` }))
    }
  }

  async function handleCancel(order: Order) {
    const ok = await confirm({
      title: `¿Cancelar la Orden #${order.number}?`,
      message: 'El pedido sale de la cola y su stock vuelve al inventario. No se puede deshacer.',
      confirmLabel: 'Cancelar pedido',
      tone: 'warning',
    })
    if (ok && dispatch(cancelQueued(order.id))) {
      dispatch(pushToast({ message: `Orden #${order.number} cancelada; el stock se devolvió` }))
    }
  }

  return (
    <div className="staff-page">
      <header className="staff-page__head">
        <div>
          <h1 className="staff-page__title">Cola del mostrador</h1>
          <p className="staff-page__subtitle">Pedidos guardados en espera, del más antiguo al más nuevo.</p>
        </div>
      </header>

      <div className="queue-strip" role="status">
        <p className="queue-strip__item">
          <Icon name="receipt" size={20} />
          <span>Pedidos por cobrar: <strong>{queue.length}</strong></span>
        </p>
        <p className="queue-strip__item">
          <Icon name="money" size={20} />
          <span>Total por cobrar: <strong>{formatMoney(pendingTotal)}</strong></span>
        </p>
      </div>

      {queue.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon"><Icon name="queue" size={32} /></span>
          <p className="empty-state__title">No hay pedidos por cobrar</p>
          <p className="empty-state__text">Los pedidos que guardes en espera desde el menú aparecerán aquí.</p>
          <Link to="/" className="btn btn--primary">Ir al menú</Link>
        </div>
      ) : (
        <>
          <div className="segmented" role="group" aria-label="Filtrar por servicio">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`segmented__btn${filter === f.id ? ' segmented__btn--active' : ''}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                {f.id !== 'todos' && <span className="segmented__count">{queue.filter((o) => o.mode === f.id).length}</span>}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="staff-page__empty">No hay pedidos de {MODE_LABEL[filter as ServiceMode].toLowerCase()} por cobrar.</p>
          ) : (
            <div className="queue-grid">
              {visible.map((order) => (
                <QueueCard
                  key={order.id}
                  order={order}
                  now={now}
                  settings={settings}
                  editing={order.id === editingId}
                  onCharge={() => handleCharge(order)}
                  onEdit={() => editOrder(order.id)}
                  onCancel={() => handleCancel(order)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
