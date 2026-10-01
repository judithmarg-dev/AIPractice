import type { Flavor, Size } from '../types/flavor'

interface FlavorCardProps {
  flavor: Flavor
  selectedSize: Size
}

export function FlavorCard({ flavor, selectedSize }: FlavorCardProps) {
  const sizeLabel: Record<Size, string> = {
    small: 'Small · 1 scoop',
    medium: 'Medium · 2 scoops',
    large: 'Large · 3 scoops',
  }

  return (
    <article className="flavor-card">
      <div
        className="flavor-card__image"
        style={{ backgroundColor: flavor.imagePlaceholder }}
        aria-hidden="true"
      />
      <div className="flavor-card__body">
        <span className="flavor-card__category">{flavor.category}</span>
        <h3 className="flavor-card__name">{flavor.name}</h3>
        <p className="flavor-card__description">{flavor.description}</p>
        <span className="flavor-card__size-badge">{sizeLabel[selectedSize]}</span>
      </div>
    </article>
  )
}
