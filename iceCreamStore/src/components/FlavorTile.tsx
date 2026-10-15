import type { Flavor } from '../types/flavor'

interface FlavorTileProps {
  flavor: Flavor
  index: number
  isSelected?: boolean
  soldOut?: boolean
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

export function FlavorTile({ flavor, index, isSelected = false, soldOut = false, onClick }: FlavorTileProps) {
  const priceLabel =
    flavor.category === 'artesanal'
      ? `$${flavor.price.toFixed(2)} / bola`
      : `$${flavor.price.toFixed(2)}`

  return (
    <article
      className={`flavor-tile${isSelected ? ' flavor-tile--selected' : ''}`}
      style={{ '--flavor-color': flavor.imagePlaceholder, '--i': index } as React.CSSProperties}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-expanded={isSelected}
      aria-label={`${flavor.name}, ${priceLabel}${soldOut ? ', agotado' : ''}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="flavor-tile__image" aria-hidden="true">
        {flavor.image ? <img src={flavor.image} alt="" /> : <ScoopIcon />}
      </div>
      <h3 className="flavor-tile__name">{flavor.name}</h3>
      <span className="flavor-tile__price">{priceLabel}</span>
      {soldOut && <span className="flavor-tile__note">Agotado</span>}
    </article>
  )
}
