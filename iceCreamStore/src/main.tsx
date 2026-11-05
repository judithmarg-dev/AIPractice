import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/store'
import { ConfirmProvider } from '@/components/ui/ConfirmProvider'
import { Toasts } from '@/components/ui/Toasts'
import './index.css'
import './ui.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConfirmProvider>
          <App />
          <Toasts />
        </ConfirmProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
