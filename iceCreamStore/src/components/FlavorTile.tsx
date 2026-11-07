import type { Product } from '@/types/models'
import { formatMoney } from '@/lib/money'
import { T } from '@/lib/texts'
import { spriteOf } from '@/lib/scoopSprites'
import { ScoopSprite } from '@/components/ScoopSprite'
import { Icon } from '@/components/icons'

interface FlavorTileProps {
  product: Product
  /** Buildable products open the build modal and are priced per scoop. */
  buildable: boolean
  index: number
  isSelected?: boolean
  /** Pack flavors toggle on and off: the tile becomes a toggle button. `checked` draws the check mark. */
  toggle?: { checked: boolean; disabled?: boolean; showCheck: boolean }
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

export function FlavorTile({ product, buildable, index, isSelected = false, toggle, onClick }: FlavorTileProps) {
  const soldOut = product.stock <= 0
  const sprite = spriteOf(product)
  const checked = toggle?.checked ?? false
  const priceLabel = buildable ? `${formatMoney(product.priceCents)} / bola` : formatMoney(product.priceCents)

  return (
    <article
      className={`flavor-tile${isSelected || checked ? ' flavor-tile--selected' : ''}${soldOut ? ' flavor-tile--sold-out' : ''}${toggle?.disabled ? ' flavor-tile--disabled' : ''}`}
      style={{ '--flavor-color': product.color, '--i': index } as React.CSSProperties}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-haspopup={buildable && !toggle ? 'dialog' : undefined}
      aria-expanded={buildable || toggle ? undefined : isSelected}
      aria-pressed={toggle ? checked : undefined}
      aria-disabled={toggle?.disabled || undefined}
      aria-label={`${product.name}, ${priceLabel}${soldOut ? `, ${T.soldOut.toLowerCase()}` : ''}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="flavor-tile__media" aria-hidden="true">
        <div className={`flavor-tile__image${sprite ? ' flavor-tile__image--sprite' : ''}`}>
          {sprite ? (
            <ScoopSprite sprite={sprite} className="flavor-tile__sprite" />
          ) : product.image ? (
            <img src={product.image} alt="" />
          ) : (
            <ScoopIcon />
          )}
        </div>
        {toggle?.showCheck && checked && (
          <span className="flavor-tile__check">
            <Icon name="check" size={16} />
          </span>
        )}
      </div>
      <h3 className="flavor-tile__name">{product.name}</h3>
      <span className="flavor-tile__price">{priceLabel}</span>
      {soldOut && <span className="chip chip--danger flavor-tile__note">{T.soldOut}</span>}
    </article>
  )
}
