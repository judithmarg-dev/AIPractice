import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Settings } from '@/types/models'
import { DEFAULT_SETTINGS } from '../seed'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: DEFAULT_SETTINGS,
  reducers: {
    updateSettings(state, action: PayloadAction<Partial<Settings>>) {
      Object.assign(state, action.payload)
    },
  },
})

export const { updateSettings } = settingsSlice.actions

export const selectSettings = (state: { settings: Settings }) => state.settings

export default settingsSlice.reducer
