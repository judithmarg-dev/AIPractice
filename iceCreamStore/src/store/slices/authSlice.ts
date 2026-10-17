import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  error: string | null
}

const STAFF_EMAIL = 'staff@icecreamstore.com'
const STAFF_PASSWORD = 'staff123'
// The session survives a reload of the tab, not the closing of the browser.
const SESSION_KEY = 'ics-auth'

function readSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function writeSession(value: boolean) {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, '1')
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Storage unavailable: the session lives only in memory.
  }
}

const initialState: AuthState = {
  isAuthenticated: readSession(),
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ email: string; password: string }>) {
      const { email, password } = action.payload
      if (email.trim().toLowerCase() === STAFF_EMAIL && password === STAFF_PASSWORD) {
        state.isAuthenticated = true
        state.error = null
      } else {
        state.error = 'Correo o contraseña incorrectos.'
      }
    },
    logout(state) {
      state.isAuthenticated = false
      state.error = null
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
