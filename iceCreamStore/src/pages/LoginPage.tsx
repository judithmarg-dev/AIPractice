import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { login } from '@/store/slices/authSlice'
import '../staff.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const authError = useAppSelector((state) => state.auth.error)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const from = (location.state as { from?: string } | null)?.from

  useEffect(() => {
    if (isAuthenticated) navigate(from?.startsWith('/staff') ? from : '/staff/dashboard', { replace: true })
  }, [isAuthenticated, navigate, from])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <main className="login">
      <div className="panel-card login__card">
        <h1 className="staff-page__title">Acceso staff</h1>
        <p className="staff-page__subtitle">IceCreamStore · panel del propietario</p>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span className="field__label">Correo electrónico</span>
            <input
              className="field__input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Contraseña</span>
            <input
              className="field__input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {authError && (
            <p className="form__error" role="alert">
              {authError}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block">
            Entrar
          </button>
        </form>
      </div>
    </main>
  )
}
