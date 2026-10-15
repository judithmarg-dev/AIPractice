import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Scoops } from '@/types/flavor'

export type OrderMode = 'presencial' | 'delivery'

export const DELIVERY_SURCHARGE = 0.3
export const IVA_RATE = 0.1

export interface OrderLine {
  lineId: string
  productId: string
  name: string
  /** Modifiers shown under the name, e.g. ["Barquillo Dulce", "2 bolas"]. */
  details: string[]
  /** Price for one unit of this line (scoops already applied). */
  unitPrice: number
  qty: number
  scoops?: Scoops
}

export interface Order {
  number: number
  mode: OrderMode
  lines: OrderLine[]
}

export interface HeldOrder extends Order {
  heldAt: string
}

export interface ClosedOrder extends Order {
  closedAt: string
  total: number
}

interface OrderState {
  current: Order
  nextNumber: number
  held: HeldOrder[]
  closed: ClosedOrder[]
}

const FIRST_ORDER_NUMBER = 1044

const initialState: OrderState = {
  current: { number: FIRST_ORDER_NUMBER, mode: 'presencial', lines: [] },
  nextNumber: FIRST_ORDER_NUMBER + 1,
  held: [],
  closed: [],
}

function lineKey(line: Omit<OrderLine, 'lineId' | 'qty'>) {
  return `${line.productId}|${line.scoops ?? ''}|${line.details.join('|')}`
}

export function computeTotals(order: Order) {
  const subtotal = order.lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0)
  const surcharge = order.mode === 'delivery' && order.lines.length > 0 ? DELIVERY_SURCHARGE : 0
  const iva = (subtotal + surcharge) * IVA_RATE
  const total = subtotal + surcharge + iva
  const itemCount = order.lines.reduce((sum, l) => sum + l.qty, 0)
  return { subtotal, surcharge, iva, total, itemCount }
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addLine(state, action: PayloadAction<Omit<OrderLine, 'lineId' | 'qty'> & { qty?: number }>) {
      const { qty = 1, ...rest } = action.payload
      const key = lineKey(rest)
      const existing = state.current.lines.find((l) => lineKey(l) === key)
      if (existing) {
        existing.qty += qty
      } else {
        state.current.lines.push({ ...rest, qty, lineId: crypto.randomUUID() })
      }
    },
    setLineQty(state, action: PayloadAction<{ lineId: string; qty: number }>) {
      const line = state.current.lines.find((l) => l.lineId === action.payload.lineId)
      if (!line) return
      if (action.payload.qty <= 0) {
        state.current.lines = state.current.lines.filter((l) => l.lineId !== line.lineId)
      } else {
        line.qty = action.payload.qty
      }
    },
    removeLine(state, action: PayloadAction<string>) {
      state.current.lines = state.current.lines.filter((l) => l.lineId !== action.payload)
    },
    setMode(state, action: PayloadAction<OrderMode>) {
      state.current.mode = action.payload
    },
    clearOrder(state) {
      state.current.lines = []
      state.current.mode = 'presencial'
    },
    holdOrder(state) {
      if (state.current.lines.length === 0) return
      state.held.push({ ...state.current, heldAt: new Date().toISOString() })
      state.current = { number: state.nextNumber, mode: 'presencial', lines: [] }
      state.nextNumber += 1
    },
    resumeHeldOrder(state, action: PayloadAction<number>) {
      const index = state.held.findIndex((h) => h.number === action.payload)
      if (index === -1 || state.current.lines.length > 0) return
      const [held] = state.held.splice(index, 1)
      state.current = { number: held.number, mode: held.mode, lines: held.lines }
    },
    chargeOrder(state) {
      if (state.current.lines.length === 0) return
      const { total } = computeTotals(state.current)
      state.closed.push({ ...state.current, closedAt: new Date().toISOString(), total })
      state.current = { number: state.nextNumber, mode: 'presencial', lines: [] }
      state.nextNumber += 1
    },
  },
})

export const {
  addLine,
  setLineQty,
  removeLine,
  setMode,
  clearOrder,
  holdOrder,
  resumeHeldOrder,
  chargeOrder,
} = orderSlice.actions

export const selectCurrentOrder = (state: { order: OrderState }) => state.order.current
export const selectHeldOrders = (state: { order: OrderState }) => state.order.held

export default orderSlice.reducer
