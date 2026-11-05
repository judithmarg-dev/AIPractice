import type { ReactNode } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAppSelector } from '@/store/hooks'
import { selectRemoteReady } from '@/store/slices/uiSlice'

/** Holds the app until Supabase has restored the session and loaded the store data. */
export function RemoteGate({ children }: { children: ReactNode }) {
  const ready = useAppSelector(selectRemoteReady)

  if (!isSupabaseConfigured) {
    return (
      <main className="login">
        <div className="panel-card login__card">
          <h1 className="staff-page__title">Falta configurar Supabase</h1>
          <p className="staff-page__subtitle">
            Crea el archivo <code>.env.local</code> con <code>VITE_SUPABASE_URL</code> y{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> y reinicia <code>pnpm dev</code>. Los pasos están en{' '}
            <code>instructions.md</code>.
          </p>
        </div>
      </main>
    )
  }

  if (!ready) {
    return (
      <main className="login" aria-busy="true">
        <p className="staff-page__subtitle" role="status">
          Cargando la tienda…
        </p>
      </main>
    )
  }

  return <>{children}</>
}
