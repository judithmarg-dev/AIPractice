import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { ThemeToggle } from '@/components/ThemeToggle'
import '../../catalog.css'

const NAV = [
  { href: '/staff/inventory', label: 'Inventory' },
  { href: '/staff/bookings',  label: 'Bookings' },
  { href: '/staff/analytics', label: 'Analytics' },
]

export function StaffNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  function signOut() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <nav
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
    >
      <div className="flex items-center gap-1">
        <Link to="/" className="text-sm font-bold mr-4" style={{ color: 'var(--accent)' }}>
          🍦 ICS
        </Link>
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            to={href}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: pathname.startsWith(href) ? 'var(--accent-bg)' : 'transparent',
              color: pathname.startsWith(href) ? 'var(--accent)' : 'var(--text)',
            }}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      <button
        onClick={signOut}
        className="text-sm px-3 py-1.5 rounded-lg"
        style={{ color: 'var(--text)', background: 'transparent' }}
      >
        Sign out
      </button>
      </div>
    </nav>
  )
}
