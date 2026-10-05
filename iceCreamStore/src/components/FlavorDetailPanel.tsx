import type { Flavor, Size } from '../types/flavor'

interface FlavorDetailPanelProps {
  flavor: Flavor | null
  onClose: () => void
  selectedSize: Size
}

export function FlavorDetailPanel({ flavor, onClose, selectedSize }: FlavorDetailPanelProps) {
  if (!flavor) {
    return <aside className="flavor-detail-panel" />
  }

  const sizeLabel: Record<Size, string> = {
    small: 'Small · 1 scoop',
    medium: 'Medium · 2 scoops',
    large: 'Large · 3 scoops',
  }

  return (
    <aside className="flavor-detail-panel" aria-label="Flavor details" data-visible>
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
