import type { Product } from '@/types/models'
import { formatMoney } from '@/lib/money'
import { T } from '@/lib/texts'

interface FlavorTileProps {
  product: Product
  /** Buildable products open the build modal and are priced per scoop. */
  buildable: boolean
  index: number
  isSelected?: boolean
  onClick?: () => void
}

export function ScoopIcon({ size = 52 }: { size?: number }) {
  return (
    <svg
      className="flavor-tile__scoop"
      width={size}
      height={(size * 72) / 52}
      viewBox="0 0 52 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="26" cy="22" r="18" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <circle cx="19" cy="16" r="5" fill="rgba(255,255,255,0.18)" />
      <path d="M10 38 L26 70 L42 38Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="26" y1="38" x2="26" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <path d="M36 39 Q42 46 38 53" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function FlavorTile({ product, buildable, index, isSelected = false, onClick }: FlavorTileProps) {
  const soldOut = product.stock <= 0
  const priceLabel = buildable ? `${formatMoney(product.priceCents)} / bola` : formatMoney(product.priceCents)

  return (
    <article
      className={`flavor-tile${isSelected ? ' flavor-tile--selected' : ''}${soldOut ? ' flavor-tile--sold-out' : ''}`}
      style={{ '--flavor-color': product.color, '--i': index } as React.CSSProperties}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-haspopup={buildable ? 'dialog' : undefined}
      aria-expanded={buildable ? undefined : isSelected}
      aria-label={`${product.name}, ${priceLabel}${soldOut ? `, ${T.soldOut.toLowerCase()}` : ''}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="flavor-tile__image" aria-hidden="true">
        {product.image ? <img src={product.image} alt="" /> : <ScoopIcon />}
      </div>
      <h3 className="flavor-tile__name">{product.name}</h3>
      <span className="flavor-tile__price">{priceLabel}</span>
      {soldOut && <span className="chip chip--danger flavor-tile__note">{T.soldOut}</span>}
    </article>
  )
}
