import { combineReducers, configureStore, type UnknownAction } from '@reduxjs/toolkit'
import authReducer, { writeSession } from './slices/authSlice'
import inventoryReducer from './slices/inventorySlice'
import categoriesReducer from './slices/categoriesSlice'
import optionsReducer from './slices/optionsSlice'
import bookingsReducer from './slices/bookingsSlice'
import orderReducer from './slices/orderSlice'
import settingsReducer from './slices/settingsSlice'
import uiReducer, { setStorageError } from './slices/uiSlice'
import { replacePersisted } from './rootActions'
import {
  PERSISTED_KEYS,
  STORAGE_KEY,
  parseStored,
  readStored,
  serialize,
  writeStored,
  type PersistedState,
} from './persistence'

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

const stored = readStored()
const preloaded = parseStored(stored)

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: preloaded ?? undefined,
  middleware: (getDefault) =>
    // Demo data holds thousands of orders; keep the dev-only checks from flooding the console.
    getDefault({ immutableCheck: { warnAfter: 200 }, serializableCheck: { warnAfter: 200 } }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// ── Persistence: save the persisted slices (throttled) whenever one of them changes ──
let lastWritten = stored
let lastSlices: unknown[] = []
let timer: ReturnType<typeof setTimeout> | null = null
let lastAuth = store.getState().auth.isAuthenticated

function flush() {
  timer = null
  const state = store.getState()
  const text = serialize(state as PersistedState)
  if (text === lastWritten) return
  const ok = writeStored(text)
  if (ok) lastWritten = text
  if (ok === state.ui.storageError) store.dispatch(setStorageError(!ok))
}

store.subscribe(() => {
  const state = store.getState()
  if (state.auth.isAuthenticated !== lastAuth) {
    lastAuth = state.auth.isAuthenticated
    writeSession(lastAuth)
  }
  const slices = PERSISTED_KEYS.map((k) => state[k])
  if (slices.every((s, i) => s === lastSlices[i])) return
  lastSlices = slices
  if (!timer) timer = setTimeout(flush, 250)
})

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (timer) {
      clearTimeout(timer)
      flush()
    }
  })
  // RF-6.8: another tab changed the store; adopt its state.
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue || e.newValue === lastWritten) return
    const next = parseStored(e.newValue)
    if (!next) return
    lastWritten = e.newValue
    store.dispatch(replacePersisted(next))
  })
}
