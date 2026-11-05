// Staff sign-in / sign-out through Supabase Auth. The session itself reaches the store through
// onAuthStateChange in remoteSync.ts, after the staff-only data has been loaded.
import { requireSupabase } from '@/lib/supabase'
import type { AppDispatch } from '.'
import { loginFailed, loginStarted } from './slices/authSlice'

export const signIn =
  (email: string, password: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(loginStarted())
    try {
      const { error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        dispatch(
          loginFailed(
            error.message === 'Invalid login credentials'
              ? 'Correo o contraseña incorrectos.'
              : `No se pudo iniciar sesión: ${error.message}`
          )
        )
      }
    } catch {
      dispatch(loginFailed('No se pudo conectar con Supabase. Revisa tu conexión.'))
    }
  }

export const signOut = () => async (): Promise<void> => {
  await requireSupabase().auth.signOut()
}
