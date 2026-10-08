import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { login } from '@/store/slices/authSlice'

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const authError = useAppSelector((state) => state.auth.error)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/staff/inventory', { replace: true })
    }
  }, [isAuthenticated, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 border"
        style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-h)' }}>Staff login</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text)' }}>
          Ice Cream Store · staff portal
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {['email', 'password'].map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <label htmlFor={field} className="text-sm font-medium capitalize" style={{ color: 'var(--text-h)' }}>
                {field}
              </label>
              <input
                id={field}
                type={field}
                value={field === 'email' ? email : password}
                onChange={(e) => field === 'email' ? setEmail(e.target.value) : setPassword(e.target.value)}
                required
                className="rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
              />
            </div>
          ))}

          {authError && (
            <p className="text-xs rounded px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {authError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-semibold text-white text-sm mt-2"
            style={{ background: 'var(--accent)' }}
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  )
}
