// Cross-slice selectors.
import { createSelector } from '@reduxjs/toolkit'
import { computeTotals, stockUsage } from '@/lib/orderMath'
import type { RootState } from '.'
import { selectEditingOrder } from './slices/orderSlice'

/**
 * Units of each product still free for the draft: current stock, plus what the order being
 * edited already holds, minus what other draft lines use. `excludeLineId` is the line being edited.
 */
export const selectAvailableStock = createSelector(
  [
    (s: RootState) => s.inventory,
    (s: RootState) => s.order.draft.lines,
    selectEditingOrder,
    (_: RootState, excludeLineId: string | null) => excludeLineId,
  ],
  (products, lines, editing, excludeLineId) => {
    const available: Record<string, number> = Object.fromEntries(products.map((p) => [p.id, p.stock]))
    if (editing) {
      for (const [id, n] of Object.entries(stockUsage(editing.lines))) available[id] = (available[id] ?? 0) + n
    }
    const others = lines.filter((l) => l.lineId !== excludeLineId)
    for (const [id, n] of Object.entries(stockUsage(others))) available[id] = (available[id] ?? 0) - n
    return available
  }
)

export const selectDraftTotals = createSelector(
  [(s: RootState) => s.order.draft, (s: RootState) => s.settings],
  (draft, settings) => computeTotals(draft.lines, draft.mode, settings)
)
