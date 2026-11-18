import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { PACK_RULES, packKindOf, type Weight } from '@/lib/presentations'

/** The artisan pack being assembled (not yet an order line). Lives in memory only. */
export interface PackState {
  mode: 'porcion' | 'peso'
  weight: Weight
  /** Chosen flavors in the order they were picked; each appears once. */
  flavorIds: string[]
}

export const initialPackState: PackState = { mode: 'porcion', weight: 'kilo', flavorIds: [] }

const maxOf = (s: PackState) => PACK_RULES[packKindOf(s.mode, s.weight)].max

const packSlice = createSlice({
  name: 'pack',
  initialState: initialPackState,
  reducers: {
    /** Switching presentation starts over: the limits differ. */
    setPackMode(state, action: PayloadAction<PackState['mode']>) {
      if (state.mode === action.payload) return
      state.mode = action.payload
      state.flavorIds = []
    },
    /** 1 kilo ↔ ½ kilo keeps the picks that still fit. */
    setPackWeight(state, action: PayloadAction<Weight>) {
      state.weight = action.payload
      state.flavorIds = state.flavorIds.slice(0, maxOf(state))
    },
    /** Adds the flavor, or removes it when it was already picked. Ignored when the limit is reached. */
    toggleFlavor(state, action: PayloadAction<string>) {
      const id = action.payload
      if (state.flavorIds.includes(id)) state.flavorIds = state.flavorIds.filter((x) => x !== id)
      else if (state.flavorIds.length < maxOf(state)) state.flavorIds.push(id)
    },
    clearPack(state) {
      state.flavorIds = []
    },
    loadPack(_state, action: PayloadAction<PackState>) {
      return action.payload
    },
  },
})

export const { setPackMode, setPackWeight, toggleFlavor, clearPack, loadPack } = packSlice.actions

export const selectPack = (state: { pack: PackState }) => state.pack
export const selectPackKind = (state: { pack: PackState }) => packKindOf(state.pack.mode, state.pack.weight)

export default packSlice.reducer
