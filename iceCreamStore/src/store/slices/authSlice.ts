import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  error: string | null
}

const STAFF_EMAIL = 'staff@icecreamstore.com'
const STAFF_PASSWORD = 'staff123'

const initialState: AuthState = {
  isAuthenticated: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ email: string; password: string }>) {
      const { email, password } = action.payload
      if (email === STAFF_EMAIL && password === STAFF_PASSWORD) {
        state.isAuthenticated = true
        state.error = null
      } else {
        state.error = 'Invalid email or password.'
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
