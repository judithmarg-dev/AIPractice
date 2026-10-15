export type FlavorCategory = 'artesanal' | 'paleta' | 'milkshake' | 'bebida'

export const CATEGORIES: { id: FlavorCategory; label: string }[] = [
  { id: 'artesanal', label: 'Artesanales' },
  { id: 'paleta', label: 'Paletas' },
  { id: 'milkshake', label: 'Milkshakes' },
  { id: 'bebida', label: 'Bebidas' },
]

export function isFlavorCategory(value: string): value is FlavorCategory {
  return CATEGORIES.some((c) => c.id === value)
}

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.id === value)?.label ?? 'Otros'
}

/** Number of scoops for an artesanal ice cream. */
export type Scoops = 1 | 2 | 3

export interface Flavor {
  id: string
  name: string
  description: string
  category: FlavorCategory
  imagePlaceholder: string
  /** Price in USD. For `artesanal` items this is the price per scoop. */
  price: number
  /** Optional uploaded image (data URL). */
  image?: string
  /** Optional "envase de presentación", e.g. "Barquillo Dulce". */
  container?: string
}
