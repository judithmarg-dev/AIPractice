import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Order, OrderLine, ServiceMode } from '@/types/models'

/** The order being built in the panel. Not an `Order` until it leaves the draft. */
export interface Draft {
  mode: ServiceMode
  lines: OrderLine[]
  customer: string
  note: string
  address: string
}

export interface OrderState {
  draft: Draft
  /** Id of the queued order loaded into the draft for editing, if any. */
  editingId: string | null
  orders: Order[]
  nextNumber: number
  /** Stock as it was before demo data was loaded; restored when demo data is cleared. */
  demoStockBackup: Record<string, number> | null
}

/** Payload for every action that also moves stock (handled by the inventory slice). */
export interface StockMove {
  stockDelta: Record<string, number>
}

export const FIRST_ORDER_NUMBER = 1044

export const emptyDraft = (): Draft => ({ mode: 'presencial', lines: [], customer: '', note: '', address: '' })

export const initialOrderState: OrderState = {
  draft: emptyDraft(),
  editingId: null,
  orders: [],
  nextNumber: FIRST_ORDER_NUMBER,
  demoStockBackup: null,
}

const orderSlice = createSlice({
  name: 'order',
  initialState: initialOrderState,
  reducers: {
    addLine(state, action: PayloadAction<OrderLine>) {
      const line = action.payload
      // Plain products merge into one line; built ice creams stay separate so each can be edited.
      const existing = line.build
        ? undefined
        : state.draft.lines.find((l) => !l.build && l.productId === line.productId)
      if (existing) existing.qty += line.qty
      else state.draft.lines.push(line)
    },
    updateLine(state, action: PayloadAction<OrderLine>) {
      const index = state.draft.lines.findIndex((l) => l.lineId === action.payload.lineId)
      if (index !== -1) state.draft.lines[index] = action.payload
    },
    setLineQty(state, action: PayloadAction<{ lineId: string; qty: number }>) {
      const line = state.draft.lines.find((l) => l.lineId === action.payload.lineId)
      if (!line) return
      if (action.payload.qty <= 0) {
        state.draft.lines = state.draft.lines.filter((l) => l.lineId !== line.lineId)
      } else {
        line.qty = Math.min(99, action.payload.qty)
      }
    },
    removeLine(state, action: PayloadAction<string>) {
      state.draft.lines = state.draft.lines.filter((l) => l.lineId !== action.payload)
    },
    setMode(state, action: PayloadAction<ServiceMode>) {
      state.draft.mode = action.payload
    },
    setMeta(state, action: PayloadAction<Partial<Pick<Draft, 'customer' | 'note' | 'address'>>>) {
      Object.assign(state.draft, action.payload)
    },
    clearDraft(state) {
      state.draft = emptyDraft()
    },
    saveToQueue(state, action: PayloadAction<{ order: Order } & StockMove>) {
      state.orders.push(action.payload.order)
      state.nextNumber = Math.max(state.nextNumber, action.payload.order.number + 1)
      state.draft = emptyDraft()
    },
    chargeDraft(state, action: PayloadAction<{ order: Order } & StockMove>) {
      state.orders.push(action.payload.order)
      state.nextNumber = Math.max(state.nextNumber, action.payload.order.number + 1)
      state.draft = emptyDraft()
    },
    chargeOrder(state, action: PayloadAction<{ id: string; at: string }>) {
      const order = state.orders.find((o) => o.id === action.payload.id)
      if (!order || order.status !== 'por_cobrar') return
      order.status = 'cobrado'
      order.chargedAt = action.payload.at
      if (state.editingId === order.id) {
        state.editingId = null
        state.draft = emptyDraft()
      }
    },
    cancelOrder(state, action: PayloadAction<{ id: string; at: string } & StockMove>) {
      const order = state.orders.find((o) => o.id === action.payload.id)
      if (!order || order.status !== 'por_cobrar') return
      order.status = 'cancelado'
      order.cancelledAt = action.payload.at
      if (state.editingId === order.id) {
        state.editingId = null
        state.draft = emptyDraft()
      }
    },
    loadForEdit(state, action: PayloadAction<string>) {
      const order = state.orders.find((o) => o.id === action.payload)
      if (!order || order.status !== 'por_cobrar') return
      state.editingId = order.id
      state.draft = {
        mode: order.mode,
        lines: order.lines.map((l) => ({ ...l })),
        customer: order.customer ?? '',
        note: order.note ?? '',
        address: order.address ?? '',
      }
    },
    /** Replaces the edited order (same number and creation time) and leaves edit mode. */
    saveEdit(state, action: PayloadAction<{ order: Order } & StockMove>) {
      const index = state.orders.findIndex((o) => o.id === action.payload.order.id)
      if (index !== -1) state.orders[index] = action.payload.order
      state.editingId = null
      state.draft = emptyDraft()
    },
    discardEdit(state) {
      state.editingId = null
      state.draft = emptyDraft()
    },
    addDemoOrders(
      state,
      action: PayloadAction<{ orders: Order[]; backup: Record<string, number>; demoStock: Record<string, number> }>
    ) {
      state.orders = [...state.orders.filter((o) => !o.demo), ...action.payload.orders].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt)
      )
      const highest = action.payload.orders.reduce((max, o) => Math.max(max, o.number), 0)
      state.nextNumber = Math.max(state.nextNumber, highest + 1)
      state.demoStockBackup ??= action.payload.backup
    },
    /** The payload carries the stock to restore; the inventory slice applies it. */
    removeDemoOrders: {
      reducer(state) {
        state.orders = state.orders.filter((o) => !o.demo)
        state.demoStockBackup = null
      },
      prepare(payload: { restoreStock: Record<string, number> }) {
        return { payload }
      },
    },
  },
})

export const {
  addLine,
  updateLine,
  setLineQty,
  removeLine,
  setMode,
  setMeta,
  clearDraft,
  saveToQueue,
  chargeDraft,
  chargeOrder,
  cancelOrder,
  loadForEdit,
  saveEdit,
  discardEdit,
  addDemoOrders,
  removeDemoOrders,
} = orderSlice.actions

type WithOrder = { order: OrderState }

export const selectDraft = (state: WithOrder) => state.order.draft
export const selectOrders = (state: WithOrder) => state.order.orders
export const selectEditingId = (state: WithOrder) => state.order.editingId
export const selectEditingOrder = (state: WithOrder) =>
  state.order.editingId ? state.order.orders.find((o) => o.id === state.order.editingId) ?? null : null
/** Number shown on the panel: the edited order's, or the next free one. */
export const selectDraftNumber = (state: WithOrder) =>
  selectEditingOrder(state)?.number ?? state.order.nextNumber
/** Orders waiting to be charged, oldest first. */
export const selectQueue = createSelector([selectOrders], (orders) =>
  orders.filter((o) => o.status === 'por_cobrar').sort((a, b) => a.createdAt.localeCompare(b.createdAt))
)
export const selectQueueCount = (state: WithOrder) => selectQueue(state).length
export const selectHasDemoOrders = (state: WithOrder) => state.order.orders.some((o) => o.demo)

export default orderSlice.reducer
