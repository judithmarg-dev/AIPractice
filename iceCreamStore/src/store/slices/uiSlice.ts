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
  /** The local order draft could not be saved in this browser. */
  storageError: boolean
  /** The first load from Supabase finished (successfully or not). */
  remoteReady: boolean
  /** Last error reading from or writing to Supabase; null when in sync. */
  syncError: string | null
}

const initialState: UiState = { toasts: [], storageError: false, remoteReady: false, syncError: null }

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
    setRemoteReady(state) {
      state.remoteReady = true
    },
    setSyncError(state, action: PayloadAction<string | null>) {
      state.syncError = action.payload
    },
  },
})

export const { pushToast, dismissToast, setStorageError, setRemoteReady, setSyncError } = uiSlice.actions

export const selectToasts = (state: { ui: UiState }) => state.ui.toasts
export const selectStorageError = (state: { ui: UiState }) => state.ui.storageError
export const selectRemoteReady = (state: { ui: UiState }) => state.ui.remoteReady
export const selectSyncError = (state: { ui: UiState }) => state.ui.syncError

export default uiSlice.reducer
