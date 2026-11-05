import { Link, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { ThemeToggle } from '@/components/ThemeToggle'
import { QueueBadge } from '@/components/staff/QueueBadge'

const NAV = [
  { href: '/', label: 'Menú', match: (p: string) => p === '/' },
  // On phones the queue link lives in the sub-nav strip, where there is room for it.
  { href: '/staff/cola', label: 'Cola', match: (p: string) => p.startsWith('/staff/cola'), wide: true },
  { href: '/booking', label: 'Reservar', match: (p: string) => p.startsWith('/booking') },
]

export function SiteHeader() {
  const { pathname } = useLocation()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-header__brand" aria-label="IceCreamStore, inicio">
            <span className="site-header__logo" aria-hidden="true">🍦</span>
            <span className="site-header__wordmark">IceCreamStore</span>
          </Link>

          <nav className="site-header__nav" aria-label="Principal">
            {NAV.map(({ href, label, match, wide }) => {
              const active = match(pathname)
              return (
                <Link
                  key={href}
                  to={href}
                  className={`site-header__link${active ? ' site-header__link--active' : ''}${wide ? ' site-header__link--wide' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {label}
                  {href === '/staff/cola' && <QueueBadge />}
                </Link>
              )
            })}
          </nav>

          <div className="site-header__actions">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/staff/dashboard" className="site-header__btn site-header__btn--solid">
                <span className="site-header__btn-short">Panel</span>
                <span className="site-header__btn-long">Panel del propietario</span>
              </Link>
            ) : (
              <Link to="/login" className="site-header__btn">
                <span className="site-header__btn-short">Staff</span>
                <span className="site-header__btn-long">Acceso staff</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="site-subnav">
        <div className="site-subnav__inner">
          <Link
            to="/"
            className={`site-subnav__tab${pathname === '/' ? ' site-subnav__tab--active' : ''}`}
          >
            Menú
          </Link>
          <Link to="/staff/cola" className="site-subnav__tab">
            Cola del mostrador
            <QueueBadge />
          </Link>
        </div>
      </div>
    </>
  )
}
