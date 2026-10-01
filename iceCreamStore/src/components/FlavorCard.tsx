'use client'
import type { Flavor, Size } from '../types/flavor'

interface FlavorCardProps {
  flavor: Flavor
  selectedSize: Size
  index: number
}

function ScoopIcon() {
  return (
    <svg
      className="flavor-card__scoop"
      width="52"
      height="72"
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

export function FlavorCard({ flavor, selectedSize, index }: FlavorCardProps) {
  const sizeLabel: Record<Size, string> = {
    small: 'Small · 1 scoop',
    medium: 'Medium · 2 scoops',
    large: 'Large · 3 scoops',
  }

  return (
    <article
      className="flavor-card"
      style={
        {
          '--flavor-color': flavor.imagePlaceholder,
          '--i': index,
        } as React.CSSProperties
      }
    >
      <div className="flavor-card__image" aria-hidden="true">
        <ScoopIcon />
      </div>
      <div className="flavor-card__body">
        <span className="flavor-card__category">{flavor.category}</span>
        <h3 className="flavor-card__name">{flavor.name}</h3>
        <p className="flavor-card__description">{flavor.description}</p>
        <span key={selectedSize} className="flavor-card__size-badge">
          {sizeLabel[selectedSize]}
        </span>
      </div>
    </article>
  )
}
