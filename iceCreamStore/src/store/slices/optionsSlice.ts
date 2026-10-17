import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { OptionItem, OptionKind } from '@/types/models'
import { INITIAL_CATALOG } from '../seed'

type WithOptions = { options: OptionItem[] }

const optionsSlice = createSlice({
  name: 'options',
  initialState: INITIAL_CATALOG.options,
  reducers: {
    addOption(state, action: PayloadAction<OptionItem>) {
      state.push(action.payload)
    },
    updateOption(state, action: PayloadAction<OptionItem>) {
      const index = state.findIndex((o) => o.id === action.payload.id)
      if (index !== -1) state[index] = action.payload
    },
    setOptionAvailable(state, action: PayloadAction<{ id: string; available: boolean }>) {
      const option = state.find((o) => o.id === action.payload.id)
      if (option) option.available = action.payload.available
    },
    /** Past orders keep their snapshots; products lose it as default container (inventory slice). */
    removeOption(state, action: PayloadAction<string>) {
      return state.filter((o) => o.id !== action.payload)
    },
  },
})

export const { addOption, updateOption, setOptionAvailable, removeOption } = optionsSlice.actions

export const selectAllOptions = (state: WithOptions) => state.options

export const selectOptionsByKind = createSelector([selectAllOptions], (options) => {
  const byKind: Record<OptionKind, OptionItem[]> = { envase: [], extra: [], topping: [] }
  for (const o of options) byKind[o.kind].push(o)
  return byKind
})

export const selectAvailableOptionsByKind = createSelector([selectOptionsByKind], (byKind) => ({
  envase: byKind.envase.filter((o) => o.available),
  extra: byKind.extra.filter((o) => o.available),
  topping: byKind.topping.filter((o) => o.available),
}))

export default optionsSlice.reducer
