import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addLine } from '@/store/slices/orderSlice'
import { selectCategoryMap } from '@/store/slices/categoriesSlice'
import { selectAllOptions } from '@/store/slices/optionsSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { selectAvailableStock } from '@/store/selectors'
import { formatMoney } from '@/lib/money'
import { makeProductLine } from '@/lib/orderMath'
import { T } from '@/lib/texts'
import type { OrderLine, Product } from '@/types/models'
import { Icon } from './icons'
import { Stepper } from './ui/Stepper'
import { ScoopIcon } from './FlavorTile'
import { OrderPanel } from './OrderPanel'

interface FlavorDetailPanelProps {
  /** Non-buildable product being added, or null when the panel only shows the order. */
  product: Product | null
  /** Whether to show the order block under the item. */
  showOrder: boolean
  onClose: () => void
  onEditLine: (line: OrderLine) => void
}

const DESKTOP_QUERY = '(min-width: 1024px)'

export function FlavorDetailPanel({ product, showOrder, onClose, onEditLine }: FlavorDetailPanelProps) {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectCategoryMap)
  const options = useAppSelector(selectAllOptions)
  const available = useAppSelector((s) => selectAvailableStock(s, null))
  const [qty, setQty] = useState(1)
  const panelRef = useRef<HTMLElement>(null)

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  // Escape closes the panel whenever it is open, at every breakpoint (dialogs above it stop the event).
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Below desktop the panel is an overlay drawer: move focus in and trap it.
  useEffect(() => {
    if (window.matchMedia(DESKTOP_QUERY).matches) return
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLElement>('button')?.focus()
    document.addEventListener('keydown', trapFocus)
    return () => {
      document.removeEventListener('keydown', trapFocus)
      if (previous && document.contains(previous)) previous.focus()
    }
  }, [product?.id, trapFocus])

  useEffect(() => {
    setQty(1)
  }, [product?.id])

  const free = product ? Math.max(0, available[product.id] ?? 0) : 0
  const soldOut = product !== null && free === 0
  const container = product?.defaultContainerId ? options.find((o) => o.id === product.defaultContainerId) : undefined

  const handleAdd = () => {
    if (!product || soldOut) return
    const amount = Math.min(qty, free)
    dispatch(addLine(makeProductLine({ lineId: crypto.randomUUID(), product, qty: amount, note: container?.name })))
    dispatch(pushToast({ message: `${product.name} agregado al pedido` }))
    onClose()
  }

  return (
    <aside className="flavor-detail-panel" aria-label={product ? 'Detalle del producto' : 'Orden actual'} ref={panelRef}>
      <div className="flavor-detail-panel__overlay" onClick={onClose} aria-hidden="true" />
      <div className="flavor-detail-panel__content">
        <button
          className={`flavor-detail-panel__close-btn${product ? '' : ' flavor-detail-panel__close-btn--plain'}`}
          onClick={onClose}
          aria-label={product ? 'Cerrar detalle' : 'Cerrar orden'}
          type="button"
        >
          <Icon name="close" />
        </button>

        {product && (
          <>
            <div
              className="flavor-detail-panel__hero"
              style={{ '--flavor-color': product.color } as React.CSSProperties}
              aria-hidden="true"
            >
              {product.image ? <img src={product.image} alt="" /> : <ScoopIcon size={88} />}
            </div>

            <div className="flavor-detail-panel__body">
              <span className="flavor-detail-panel__category">{categories[product.categoryId]?.name ?? 'Otros'}</span>
              <h2 className="flavor-detail-panel__title">{product.name}</h2>
              {container && <p className="flavor-detail-panel__container">{container.name}</p>}
              <p className="flavor-detail-panel__description">{product.description}</p>

              <div className="flavor-detail-panel__actions">
                {soldOut ? (
                  <p className="flavor-detail-panel__soldout">
                    <span className="chip chip--danger">{T.soldOut}</span> No se puede agregar al pedido.
                  </p>
                ) : (
                  <div className="flavor-detail-panel__qty">
                    <span className="flavor-detail-panel__qty-label">Cantidad</span>
                    <Stepper value={qty} onChange={setQty} min={1} max={Math.min(20, free)} label={`Cantidad de ${product.name}`} />
                  </div>
                )}
                <button type="button" className="flavor-detail-panel__action-btn" onClick={handleAdd} disabled={soldOut}>
                  <span>{T.addToOrder}</span>
                  <span className="flavor-detail-panel__action-price" aria-live="polite">
                    {formatMoney(product.priceCents * qty)}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {showOrder && <OrderPanel onEditLine={onEditLine} />}
      </div>
    </aside>
  )
}
