import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/store'
import { startRemoteSync } from '@/store/remoteSync'
import { isSupabaseConfigured } from '@/lib/supabase'
import { ConfirmProvider } from '@/components/ui/ConfirmProvider'
import { Toasts } from '@/components/ui/Toasts'
import { RemoteGate } from '@/components/RemoteGate'
import './index.css'
import './ui.css'
import App from './App'

if (isSupabaseConfigured) void startRemoteSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RemoteGate>
        <BrowserRouter>
          <ConfirmProvider>
            <App />
            <Toasts />
          </ConfirmProvider>
        </BrowserRouter>
      </RemoteGate>
    </Provider>
  </StrictMode>,
)
