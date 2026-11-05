import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icon, type UiIconId } from '@/components/icons'
import { QueueBadge } from './QueueBadge'

const NAV: { href: string; label: string; icon: UiIconId }[] = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: 'chart' },
  { href: '/staff/cola', label: 'Cola', icon: 'queue' },
  { href: '/staff/inventory', label: 'Inventario', icon: 'box' },
  { href: '/staff/categorias', label: 'Categorías', icon: 'layers' },
  { href: '/staff/opciones', label: 'Opciones', icon: 'sliders' },
  { href: '/staff/bookings', label: 'Reservas', icon: 'calendar' },
  { href: '/staff/ajustes', label: 'Ajustes', icon: 'settings' },
]

export function StaffNav() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  function signOut() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-header__brand" aria-label="IceCreamStore, ir al menú">
            <span className="site-header__logo" aria-hidden="true">🍦</span>
            <span className="site-header__wordmark">IceCreamStore</span>
          </Link>
          <span className="staff-nav__tag">Panel del propietario</span>
          <div className="site-header__actions">
            <Link to="/" className="site-header__btn">
              <span className="site-header__btn-short">Menú</span>
              <span className="site-header__btn-long">Tomar pedidos</span>
            </Link>
            <ThemeToggle />
            <button type="button" className="theme-toggle" onClick={signOut} aria-label="Cerrar sesión" title="Cerrar sesión">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </header>
      <nav className="site-subnav staff-nav" aria-label="Panel del propietario">
        <div className="site-subnav__inner staff-nav__inner">
          {NAV.map(({ href, label, icon }) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) => `site-subnav__tab staff-nav__tab${isActive ? ' site-subnav__tab--active' : ''}`}
            >
              <Icon name={icon} size={16} />
              {label}
              {href === '/staff/cola' && <QueueBadge />}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
