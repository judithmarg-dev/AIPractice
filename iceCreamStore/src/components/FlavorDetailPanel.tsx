import { useEffect, useRef, useCallback, useState } from 'react'
import type { Flavor, Scoops } from '../types/flavor'
import { categoryLabel } from '../types/flavor'
import { useAppDispatch } from '@/store/hooks'
import { addLine } from '@/store/slices/orderSlice'
import { ScoopIcon } from './FlavorTile'
import { ScoopPicker } from './ScoopPicker'
import { OrderPanel } from './OrderPanel'

interface FlavorDetailPanelProps {
  /** Item being configured, or null when the panel only shows the order. */
  flavor: Flavor | null
  /** Whether to show the order block under the item. */
  showOrder: boolean
  onClose: () => void
}

const OVERLAY_QUERY = '(max-width: 1023px)'
const money = (n: number) => `$${n.toFixed(2)}`

export function FlavorDetailPanel({ flavor, showOrder, onClose }: FlavorDetailPanelProps) {
  const dispatch = useAppDispatch()
  const [scoops, setScoops] = useState<Scoops>(2)
  const panelRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

  // Escape closes the panel whenever it is open, at every breakpoint.
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Below desktop the panel is an overlay drawer: move focus in and trap it.
  useEffect(() => {
    const mql = window.matchMedia(OVERLAY_QUERY)
    if (!mql.matches) return
    previousFocusRef.current = document.activeElement as HTMLElement
    panelRef.current?.querySelector<HTMLElement>('button')?.focus()
    document.addEventListener('keydown', trapFocus)
    return () => {
      document.removeEventListener('keydown', trapFocus)
      previousFocusRef.current?.focus()
    }
  }, [flavor, trapFocus])

  // Reset the scoop choice whenever a different item is opened.
  useEffect(() => {
    setScoops(2)
  }, [flavor?.id])

  const isArtesanal = flavor?.category === 'artesanal'
  const unitPrice = flavor ? (isArtesanal ? flavor.price * scoops : flavor.price) : 0

  const handleAdd = () => {
    if (!flavor) return
    const details: string[] = []
    if (flavor.container) details.push(flavor.container)
    if (isArtesanal) details.push(`${scoops} ${scoops === 1 ? 'bola' : 'bolas'}`)
    dispatch(
      addLine({
        productId: flavor.id,
        name: flavor.name,
        details,
        unitPrice,
        scoops: isArtesanal ? scoops : undefined,
      })
    )
    onClose()
  }

  return (
    <aside className="flavor-detail-panel" aria-label={flavor ? 'Detalle del producto' : 'Orden actual'} ref={panelRef}>
      <div className="flavor-detail-panel__overlay" onClick={onClose} aria-hidden="true" />
      <div className="flavor-detail-panel__content">
        <button
          className={`flavor-detail-panel__close-btn${flavor ? '' : ' flavor-detail-panel__close-btn--plain'}`}
          onClick={onClose}
          aria-label={flavor ? 'Cerrar detalle' : 'Cerrar orden'}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {flavor && (
          <>
            <div
              className="flavor-detail-panel__hero"
              style={{ '--flavor-color': flavor.imagePlaceholder } as React.CSSProperties}
              aria-hidden="true"
            >
              {flavor.image ? <img src={flavor.image} alt="" /> : <ScoopIcon size={88} />}
            </div>

            <div className="flavor-detail-panel__body">
              <span className="flavor-detail-panel__category">{categoryLabel(flavor.category)}</span>
              <h2 className="flavor-detail-panel__title">{flavor.name}</h2>
              {flavor.container && (
                <p className="flavor-detail-panel__container">{flavor.container}</p>
              )}
              <p className="flavor-detail-panel__description">{flavor.description}</p>

              {isArtesanal && (
                <ScoopPicker selected={scoops} pricePerScoop={flavor.price} onChange={setScoops} />
              )}

              <div className="flavor-detail-panel__actions">
                <button type="button" className="flavor-detail-panel__action-btn" onClick={handleAdd}>
                  <span>Agregar a la orden</span>
                  <span className="flavor-detail-panel__action-price">{money(unitPrice)}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {showOrder && <OrderPanel />}
      </div>
    </aside>
  )
}
