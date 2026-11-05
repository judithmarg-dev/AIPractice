import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearDraft,
  discardEdit,
  removeLine,
  selectDraft,
  selectDraftNumber,
  selectEditingId,
  setLineQty,
  setMeta,
  setMode,
} from '@/store/slices/orderSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { selectDraftTotals } from '@/store/selectors'
import { submitDraft } from '@/store/orderActions'
import { useConfirm } from '@/components/ui/ConfirmProvider'
import { Stepper } from '@/components/ui/Stepper'
import { Icon } from '@/components/icons'
import { formatMoney } from '@/lib/money'
import { describeLine, lineSubtotal } from '@/lib/orderMath'
import { MODE_LABEL, T, plural } from '@/lib/texts'
import type { OrderLine, ServiceMode } from '@/types/models'

const MODES: { id: ServiceMode; icon: 'store' | 'bike' }[] = [
  { id: 'presencial', icon: 'store' },
  { id: 'delivery', icon: 'bike' },
]

export function OrderPanel({ onEditLine }: { onEditLine: (line: OrderLine) => void }) {
  const dispatch = useAppDispatch()
  const confirm = useConfirm()
  const draft = useAppSelector(selectDraft)
  const number = useAppSelector(selectDraftNumber)
  const editing = useAppSelector(selectEditingId) !== null
  const settings = useAppSelector((s) => s.settings)
  const totals = useAppSelector(selectDraftTotals)
  const [error, setError] = useState<string | null>(null)
  const empty = draft.lines.length === 0
  const hasMeta = Boolean(draft.customer || draft.note || draft.address)

  async function handleCharge() {
    setError(null)
    const ok = await confirm({
      title: `¿Cobrar ${formatMoney(totals.totalCents)}?`,
      message: `Orden #${number} · ${plural(totals.itemCount, 'artículo', 'artículos')} · ${MODE_LABEL[draft.mode]}`,
      confirmLabel: `Cobrar ${formatMoney(totals.totalCents)}`,
    })
    if (!ok) return
    const result = dispatch(submitDraft('charge'))
    if (!result.ok) return setError(result.error)
    dispatch(pushToast({ message: `Orden #${result.order.number} cobrada · ${formatMoney(result.order.totalCents)}` }))
  }

  function handleHold() {
    setError(null)
    const result = dispatch(submitDraft('queue'))
    if (!result.ok) return setError(result.error)
    dispatch(
      pushToast({
        message: editing
          ? `Orden #${result.order.number} actualizada en la cola`
          : `Orden #${result.order.number} guardada en la cola`,
        link: { to: '/staff/cola', label: 'Ver cola' },
      })
    )
  }

  async function handleClear() {
    setError(null)
    if (editing) {
      const ok = await confirm({
        title: `¿Descartar los cambios de la Orden #${number}?`,
        message: 'La orden vuelve a la cola tal como estaba.',
        confirmLabel: 'Descartar cambios',
        tone: 'warning',
      })
      if (ok) dispatch(discardEdit())
      return
    }
    if (!empty) {
      const ok = await confirm({
        title: '¿Vaciar la orden?',
        message: `Se quitarán ${plural(totals.itemCount, 'artículo', 'artículos')} de la Orden #${number}.`,
        confirmLabel: 'Vaciar orden',
        tone: 'warning',
      })
      if (!ok) return
    }
    dispatch(clearDraft())
  }

  return (
    <section className="order" aria-labelledby="order-heading">
      {editing && (
        <p className="order__editing" role="status">
          <Icon name="edit" size={16} /> Editando Orden #{number}
        </p>
      )}
      <h2 id="order-heading" className="order__heading">
        <span className="order__dot" aria-hidden="true" />
        Orden #{number}
      </h2>

      <div className="order__mode" role="group" aria-label="Tipo de servicio">
        {MODES.map(({ id, icon }) => (
          <button
            key={id}
            type="button"
            className={`order__mode-btn${draft.mode === id ? ' order__mode-btn--active' : ''}`}
            onClick={() => dispatch(setMode(id))}
            aria-pressed={draft.mode === id}
          >
            <Icon name={icon} size={16} /> {MODE_LABEL[id]}
            {id === 'delivery' && (
              <span className="order__mode-note"> (+{formatMoney(settings.deliverySurchargeCents)})</span>
            )}
          </button>
        ))}
      </div>

      {empty ? (
        <p className="order__empty">Aún no hay productos en la orden.</p>
      ) : (
        <ul className="order__lines">
          {draft.lines.map((line) => {
            const { title, detail } = describeLine(line)
            return (
              <li key={line.lineId} className="order__line">
                <div className="order__line-head">
                  <div>
                    <p className="order__line-name">{title}</p>
                    {detail && <p className="order__line-details">{detail}</p>}
                  </div>
                  <span className="order__line-price">{formatMoney(lineSubtotal(line))}</span>
                </div>
                <div className="order__line-foot">
                  <Stepper
                    size="sm"
                    value={line.qty}
                    min={0}
                    onChange={(qty) => dispatch(setLineQty({ lineId: line.lineId, qty }))}
                    label={`Cantidad de ${title}`}
                  />
                  <div className="order__line-tools">
                    {line.build && (
                      <button
                        type="button"
                        className="order__tool"
                        onClick={() => onEditLine(line)}
                        aria-label={`${T.edit} ${title}`}
                      >
                        <Icon name="edit" size={18} />
                        <span className="order__tool-text">{T.edit}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="order__remove"
                      onClick={() => dispatch(removeLine(line.lineId))}
                      aria-label={`${T.delete} ${title}`}
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <details className="order__meta" open={hasMeta || undefined}>
        <summary className="order__meta-summary">
          Datos del pedido <span className="order__meta-hint">(opcional)</span>
          <Icon name="chevron-down" size={16} className="order__meta-chevron" />
        </summary>
        <div className="order__meta-fields">
          <label className="field">
            <span className="field__label">Cliente</span>
            <input
              className="field__input"
              value={draft.customer}
              maxLength={60}
              onChange={(e) => dispatch(setMeta({ customer: e.target.value }))}
              placeholder="Nombre del cliente"
            />
          </label>
          <label className="field">
            <span className="field__label">Nota</span>
            <textarea
              className="field__input"
              rows={2}
              value={draft.note}
              maxLength={200}
              onChange={(e) => dispatch(setMeta({ note: e.target.value }))}
              placeholder="Sin azúcar, alergias…"
            />
          </label>
          {draft.mode === 'delivery' && (
            <label className="field">
              <span className="field__label">Dirección de entrega</span>
              <input
                className="field__input"
                value={draft.address}
                maxLength={120}
                onChange={(e) => dispatch(setMeta({ address: e.target.value }))}
                placeholder="Calle, número, referencia"
              />
            </label>
          )}
        </div>
      </details>

      <dl className="order__totals">
        <div className="order__row">
          <dt>Subtotal ({plural(totals.itemCount, 'artículo', 'artículos')})</dt>
          <dd>{formatMoney(totals.subtotalCents)}</dd>
        </div>
        {draft.mode === 'delivery' && (
          <div className="order__row">
            <dt>Recargo delivery</dt>
            <dd>{formatMoney(totals.surchargeCents)}</dd>
          </div>
        )}
        <div className="order__row">
          <dt>IVA ({settings.ivaPercent} %)</dt>
          <dd>{formatMoney(totals.ivaCents)}</dd>
        </div>
        <div className="order__row order__row--total">
          <dt>Total a pagar</dt>
          <dd>{formatMoney(totals.totalCents)}</dd>
        </div>
      </dl>

      {error && (
        <p className="order__error" role="alert">
          <Icon name="alert" size={18} /> {error}
        </p>
      )}

      <div className="order__actions">
        <button type="button" className="order__btn order__btn--primary" disabled={empty} onClick={handleCharge}>
          <Icon name="money" />
          Proceder al pago / Cobrar ({formatMoney(totals.totalCents)})
        </button>
        <div className="order__actions-row">
          <button type="button" className="order__btn order__btn--secondary" disabled={empty} onClick={handleHold}>
            <Icon name="pause" size={18} />
            {editing ? T.saveChanges : 'Guardar en espera'}
          </button>
          <button
            type="button"
            className="order__btn order__btn--warning"
            disabled={empty && !editing}
            onClick={handleClear}
          >
            <Icon name="cart" size={18} />
            {editing ? 'Descartar cambios' : 'Vaciar orden'}
          </button>
        </div>
      </div>
    </section>
  )
}
