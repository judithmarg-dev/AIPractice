// Sub-tabs shown inside a category on the menu. Only Artesanales has them for now; products are
// assigned to one from the product form. Rename the labels here.
import type { Product } from '@/types/models'

export interface Subgroup {
  id: string
  name: string
}

const SUBGROUPS: Record<string, Subgroup[]> = {
  artesanal: [
    { id: 'opcion-1', name: 'Opción 1' },
    { id: 'opcion-2', name: 'Opción 2' },
  ],
}

export function subgroupsOf(categoryId: string): Subgroup[] {
  return SUBGROUPS[categoryId] ?? []
}

/** The product's sub-tab; products saved before sub-tabs existed fall into the first one. */
export function subgroupOf(product: Product): string | undefined {
  const list = subgroupsOf(product.categoryId)
  if (list.length === 0) return undefined
  return list.some((s) => s.id === product.subgroupId) ? product.subgroupId : list[0].id
}
