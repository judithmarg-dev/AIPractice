// Artesanales is sold in two presentations (tabs on the menu). Both use the same flavor catalog.
// The limits below are enforced only in the front end (see components/PackBuilder.tsx).
export const ARTISAN_CATEGORY_ID = 'artesanal'

export type PresentationId = 'porciones' | 'peso'

export interface Presentation {
  id: PresentationId
  name: string
}

const PRESENTATIONS: Record<string, Presentation[]> = {
  [ARTISAN_CATEGORY_ID]: [
    { id: 'porciones', name: 'Porciones' },
    { id: 'peso', name: 'Por peso' },
  ],
}

export function presentationsOf(categoryId: string): Presentation[] {
  return PRESENTATIONS[categoryId] ?? []
}

/** What the customer takes home: a cone with 1–3 scoops, or a kilo / half kilo tub. */
export type PackKind = 'porcion' | 'kilo' | 'medio'
export type Weight = 'kilo' | 'medio'

export interface PackRule {
  kind: PackKind
  label: string
  min: number
  max: number
}

export const PACK_RULES: Record<PackKind, PackRule> = {
  porcion: { kind: 'porcion', label: 'Porción', min: 1, max: 3 },
  kilo: { kind: 'kilo', label: '1 kilo', min: 3, max: 6 },
  medio: { kind: 'medio', label: '½ kilo', min: 2, max: 3 },
}

export const WEIGHTS: Weight[] = ['kilo', 'medio']

export const packKindOf = (mode: 'porcion' | 'peso', weight: Weight): PackKind => (mode === 'porcion' ? 'porcion' : weight)

/** "de 3 a 6 sabores", "hasta 3 sabores". */
export function limitText(rule: PackRule): string {
  if (rule.min === 1) return `hasta ${rule.max} ${rule.max === 1 ? 'sabor' : 'sabores'}`
  return `de ${rule.min} a ${rule.max} sabores`
}
