import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  chargeOrder,
  clearOrder,
  computeTotals,
  holdOrder,
  removeLine,
  selectCurrentOrder,
  setLineQty,
  setMode,
  DELIVERY_SURCHARGE,
  type OrderMode,
} from '@/store/slices/orderSlice'

const money = (n: number) => `$${n.toFixed(2)}`

const MODES: { id: OrderMode; label: string; icon: string; note?: string }[] = [
  { id: 'presencial', label: 'Presencial', icon: '🍽️' },
  { id: 'delivery', label: 'Delivery', icon: '🛍️', note: `(+${money(DELIVERY_SURCHARGE)})` },
]

export function OrderPanel() {
  const dispatch = useAppDispatch()
  const order = useAppSelector(selectCurrentOrder)
  const totals = computeTotals(order)
  const empty = order.lines.length === 0

  return (
    <section className="order" aria-labelledby="order-heading">
      <h2 id="order-heading" className="order__heading">
        <span className="order__dot" aria-hidden="true" />
        Orden #{order.number}
      </h2>

      <div className="order__mode" role="group" aria-label="Tipo de pedido">
        {MODES.map(({ id, label, icon, note }) => (
          <button
            key={id}
            type="button"
            className={`order__mode-btn${order.mode === id ? ' order__mode-btn--active' : ''}`}
            onClick={() => dispatch(setMode(id))}
            aria-pressed={order.mode === id}
          >
            <span aria-hidden="true">{icon}</span> {label}
            {note && <span className="order__mode-note"> {note}</span>}
          </button>
        ))}
      </div>

      {empty ? (
        <p className="order__empty">Aún no hay productos en la orden.</p>
      ) : (
        <ul className="order__lines">
          {order.lines.map((line) => (
            <li key={line.lineId} className="order__line">
              <div className="order__line-head">
                <div>
                  <p className="order__line-name">{line.name}</p>
                  {line.details.length > 0 && (
                    <p className="order__line-details">{line.details.join(' • ')}</p>
                  )}
                </div>
                <span className="order__line-price">{money(line.unitPrice * line.qty)}</span>
              </div>
              <div className="order__line-foot">
                <div className="order__stepper" role="group" aria-label={`Cantidad de ${line.name}`}>
                  <button
                    type="button"
                    className="order__step"
                    onClick={() => dispatch(setLineQty({ lineId: line.lineId, qty: line.qty - 1 }))}
                    aria-label="Quitar uno"
                  >
                    −
                  </button>
                  <span className="order__qty" aria-live="polite">{line.qty}</span>
                  <button
                    type="button"
                    className="order__step"
                    onClick={() => dispatch(setLineQty({ lineId: line.lineId, qty: line.qty + 1 }))}
                    aria-label="Añadir uno"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="order__remove"
                  onClick={() => dispatch(removeLine(line.lineId))}
                  aria-label={`Eliminar ${line.name}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <dl className="order__totals">
        <div className="order__row">
          <dt>Subtotal ({totals.itemCount} {totals.itemCount === 1 ? 'artículo' : 'artículos'})</dt>
          <dd>{money(totals.subtotal)}</dd>
        </div>
        {order.mode === 'delivery' && (
          <div className="order__row">
            <dt>Recargo para llevar</dt>
            <dd>{money(totals.surcharge)}</dd>
          </div>
        )}
        <div className="order__row">
          <dt>IVA estimado (10%)</dt>
          <dd>{money(totals.iva)}</dd>
        </div>
        <div className="order__row order__row--total">
          <dt>Total a pagar</dt>
          <dd>{money(totals.total)}</dd>
        </div>
      </dl>

      <div className="order__actions">
        <button
          type="button"
          className="order__btn order__btn--primary"
          disabled={empty}
          onClick={() => dispatch(chargeOrder())}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2.5" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
          Proceder al pago / Cobrar ({money(totals.total)})
        </button>
        <div className="order__actions-row">
          <button
            type="button"
            className="order__btn order__btn--secondary"
            disabled={empty}
            onClick={() => dispatch(holdOrder())}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M10 9v6M14 9v6" />
            </svg>
            Guardar en espera
          </button>
          <button
            type="button"
            className="order__btn order__btn--warning"
            disabled={empty}
            onClick={() => dispatch(clearOrder())}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
              <path d="M2 3h3l2.5 12h11L21 7H7" />
            </svg>
            Vaciar orden
          </button>
        </div>
      </div>
    </section>
  )
}
