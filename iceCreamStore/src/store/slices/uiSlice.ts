import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface Toast {
  id: string
  message: string
  /** Optional in-app link shown next to the message. */
  link?: { to: string; label: string }
  tone?: 'success' | 'error'
}

interface UiState {
  toasts: Toast[]
  storageError: boolean
}

const initialState: UiState = { toasts: [], storageError: false }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    pushToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts = [...state.toasts.slice(-2), action.payload]
      },
      prepare(toast: Omit<Toast, 'id'>) {
        return { payload: { ...toast, id: crypto.randomUUID() } }
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
    setStorageError(state, action: PayloadAction<boolean>) {
      state.storageError = action.payload
    },
  },
})

export const { pushToast, dismissToast, setStorageError } = uiSlice.actions

export const selectToasts = (state: { ui: UiState }) => state.ui.toasts
export const selectStorageError = (state: { ui: UiState }) => state.ui.storageError

export default uiSlice.reducer
