import { combineReducers, configureStore, type UnknownAction } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import inventoryReducer from './slices/inventorySlice'
import categoriesReducer from './slices/categoriesSlice'
import optionsReducer from './slices/optionsSlice'
import bookingsReducer from './slices/bookingsSlice'
import orderReducer, { initialOrderState } from './slices/orderSlice'
import settingsReducer from './slices/settingsSlice'
import uiReducer, { setStorageError } from './slices/uiSlice'
import { replacePersisted } from './rootActions'
import { readDraft, writeDraft } from './persistence'

const appReducer = combineReducers({
  auth: authReducer,
  inventory: inventoryReducer,
  categories: categoriesReducer,
  options: optionsReducer,
  bookings: bookingsReducer,
  order: orderReducer,
  settings: settingsReducer,
  ui: uiReducer,
})

type AppState = ReturnType<typeof appReducer>

function rootReducer(state: Parameters<typeof appReducer>[0], action: UnknownAction): AppState {
  if (state && replacePersisted.match(action)) {
    return appReducer({ ...state, ...action.payload }, action)
  }
  return appReducer(state, action)
}

// Store data lives in Supabase (remoteSync.ts). Only the order being built stays in this browser.
const draft = readDraft()

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: draft ? { order: { ...initialOrderState, draft } } : undefined,
  middleware: (getDefault) =>
    // Demo data holds thousands of orders; keep the dev-only checks from flooding the console.
    getDefault({ immutableCheck: { warnAfter: 200 }, serializableCheck: { warnAfter: 200 } }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// ── Local persistence of the draft (throttled) ──
let lastDraft = store.getState().order.draft
let timer: ReturnType<typeof setTimeout> | null = null

function flush() {
  timer = null
  const state = store.getState()
  const ok = writeDraft(state.order.draft)
  if (ok === state.ui.storageError) store.dispatch(setStorageError(!ok))
}

store.subscribe(() => {
  const current = store.getState().order.draft
  if (current === lastDraft) return
  lastDraft = current
  if (!timer) timer = setTimeout(flush, 250)
})

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (timer) {
      clearTimeout(timer)
      flush()
    }
  })
}
