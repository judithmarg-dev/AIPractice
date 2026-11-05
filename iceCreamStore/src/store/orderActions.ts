// Order lifecycle thunks: they validate stock, freeze totals and dispatch one action that
// moves the order and the stock together (§8.5).
import { computeTotals, findShortages, shortageMessage, stockDelta } from '@/lib/orderMath'
import { generateDemoOrders } from '@/lib/demo'
import type { Order, OrderStatus } from '@/types/models'
import type { AppDispatch, RootState } from '.'
import {
  addDemoOrders,
  cancelOrder,
  chargeDraft,
  chargeOrder,
  removeDemoOrders,
  saveEdit,
  saveToQueue,
  type Draft,
} from './slices/orderSlice'

type Thunk<R> = (dispatch: AppDispatch, getState: () => RootState) => R

export type ActionResult = { ok: true; order: Order } | { ok: false; error: string }

function orderFromDraft(
  state: RootState,
  draft: Draft,
  base: Pick<Order, 'id' | 'number' | 'createdAt'> & { status: OrderStatus; chargedAt?: string; demo?: boolean }
): Order {
  const totals = computeTotals(draft.lines, draft.mode, state.settings)
  const order: Order = {
    ...base,
    mode: draft.mode,
    lines: draft.lines.map((l) => ({ ...l })),
    subtotalCents: totals.subtotalCents,
    surchargeCents: totals.surchargeCents,
    ivaCents: totals.ivaCents,
    totalCents: totals.totalCents,
  }
  if (!base.chargedAt) delete order.chargedAt
  if (!base.demo) delete order.demo
  if (draft.customer.trim()) order.customer = draft.customer.trim()
  if (draft.note.trim()) order.note = draft.note.trim()
  if (draft.mode === 'delivery' && draft.address.trim()) order.address = draft.address.trim()
  return order
}

/** Sends the draft to the queue or charges it; when editing a queued order, saves the edit. */
export const submitDraft =
  (target: 'queue' | 'charge'): Thunk<ActionResult> =>
  (dispatch, getState) => {
    const state = getState()
    const { draft, editingId, orders, nextNumber } = state.order
    if (draft.lines.length === 0) return { ok: false, error: 'La orden no tiene productos.' }
    const now = new Date().toISOString()
    const status: OrderStatus = target === 'charge' ? 'cobrado' : 'por_cobrar'
    const chargedAt = target === 'charge' ? now : undefined

    if (editingId) {
      const original = orders.find((o) => o.id === editingId)
      if (!original || original.status !== 'por_cobrar') {
        return { ok: false, error: 'Esta orden ya no está en la cola.' }
      }
      const delta = stockDelta(original.lines, draft.lines)
      const shortages = findShortages(delta, state.inventory)
      if (shortages.length) return { ok: false, error: shortageMessage(shortages) }
      const order = orderFromDraft(state, draft, {
        id: original.id,
        number: original.number,
        createdAt: original.createdAt,
        status,
        chargedAt,
        demo: original.demo,
      })
      dispatch(saveEdit({ order, stockDelta: delta }))
      return { ok: true, order }
    }

    const delta = stockDelta([], draft.lines)
    const shortages = findShortages(delta, state.inventory)
    if (shortages.length) return { ok: false, error: shortageMessage(shortages) }
    const order = orderFromDraft(state, draft, {
      id: crypto.randomUUID(),
      number: nextNumber,
      createdAt: now,
      status,
      chargedAt,
    })
    dispatch(target === 'charge' ? chargeDraft({ order, stockDelta: delta }) : saveToQueue({ order, stockDelta: delta }))
    return { ok: true, order }
  }

/** Charges a queued order. Its stock was already taken when it was queued. */
export const chargeQueued =
  (id: string): Thunk<boolean> =>
  (dispatch, getState) => {
    const order = getState().order.orders.find((o) => o.id === id)
    if (!order || order.status !== 'por_cobrar') return false
    dispatch(chargeOrder({ id, at: new Date().toISOString() }))
    return true
  }

/** Cancels a queued order and gives its stock back. */
export const cancelQueued =
  (id: string): Thunk<boolean> =>
  (dispatch, getState) => {
    const order = getState().order.orders.find((o) => o.id === id)
    if (!order || order.status !== 'por_cobrar') return false
    dispatch(cancelOrder({ id, at: new Date().toISOString(), stockDelta: stockDelta(order.lines, []) }))
    return true
  }

export const loadDemoData = (): Thunk<number> => (dispatch, getState) => {
  const state = getState()
  const { orders, demoStock } = generateDemoOrders({
    products: state.inventory.filter((p) => !p.archived),
    categories: state.categories.filter((c) => !c.archived),
    options: state.options.filter((o) => o.available),
    settings: state.settings,
    firstNumber: state.order.nextNumber,
    now: new Date(),
  })
  const backup = Object.fromEntries(state.inventory.map((p) => [p.id, p.stock]))
  dispatch(addDemoOrders({ orders, backup, demoStock }))
  return orders.length
}

export const clearDemoData = (): Thunk<void> => (dispatch, getState) => {
  dispatch(removeDemoOrders({ restoreStock: getState().order.demoStockBackup ?? {} }))
}
