export type FlavorCategory = 'fruit' | 'chocolate' | 'classic'

export type Size = 'small' | 'medium' | 'large'

export interface Flavor {
  id: string
  name: string
  description: string
  category: FlavorCategory
  imagePlaceholder: string
}
