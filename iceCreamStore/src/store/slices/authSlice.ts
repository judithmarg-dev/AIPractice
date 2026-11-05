// Staff session mirrored from Supabase Auth (see store/authActions.ts and store/remoteSync.ts).
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  email: string | null
  /** A sign-in request is in flight. */
  pending: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  email: null,
  pending: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Supabase reported a new session (email) or no session (null). */
    sessionChanged(state, action: PayloadAction<string | null>) {
      state.isAuthenticated = action.payload !== null
      state.email = action.payload
      state.pending = false
      state.error = null
    },
    loginStarted(state) {
      state.pending = true
      state.error = null
    },
    loginFailed(state, action: PayloadAction<string>) {
      state.pending = false
      state.error = action.payload
    },
  },
})

export const { sessionChanged, loginStarted, loginFailed } = authSlice.actions
export default authSlice.reducer
