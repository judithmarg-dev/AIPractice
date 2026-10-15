import { useEffect, useRef, useCallback } from 'react'
import type { Flavor, Size } from '../types/flavor'

interface FlavorDetailPanelProps {
  flavor: Flavor | null
  onClose: () => void
  selectedSize: Size
}

const OVERLAY_QUERY = '(max-width: 1023px)'

export function FlavorDetailPanel({ flavor, onClose, selectedSize }: FlavorDetailPanelProps) {
  const panelRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
    if (!flavor) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [flavor, onClose])

  // Below desktop the panel is an overlay drawer: move focus in and trap it.
  useEffect(() => {
    if (!flavor) return
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

  if (!flavor) return null

  const sizeLabel: Record<Size, string> = {
    small: 'Small · 1 scoop',
    medium: 'Medium · 2 scoops',
    large: 'Large · 3 scoops',
  }

  return (
    <aside className="flavor-detail-panel" aria-label="Flavor details" ref={panelRef}>
      <div className="flavor-detail-panel__overlay" onClick={onClose} aria-hidden="true" />
      <div className="flavor-detail-panel__content">
        <header className="flavor-detail-panel__header">
          <h2 className="flavor-detail-panel__title">{flavor.name}</h2>
          <button
            className="flavor-detail-panel__close-btn"
            onClick={onClose}
            aria-label="Close flavor details"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="flavor-detail-panel__body">
          <div
            className="flavor-detail-panel__image"
            style={{ backgroundColor: flavor.imagePlaceholder }}
            aria-hidden="true"
          />

          <div className="flavor-detail-panel__info">
            <span className="flavor-detail-panel__category">{flavor.category}</span>
            <p className="flavor-detail-panel__description">{flavor.description}</p>
            <span className="flavor-detail-panel__size-badge">{sizeLabel[selectedSize]}</span>
          </div>

          <div className="flavor-detail-panel__actions">
            <button className="flavor-detail-panel__action-btn" type="button">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
