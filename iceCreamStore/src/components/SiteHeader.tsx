import { Link, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

const NAV = [
  { href: '/', label: 'Menu', match: (p: string) => p === '/' },
  { href: '/booking', label: 'Book a table', match: (p: string) => p.startsWith('/booking') },
]

export function SiteHeader() {
  const { pathname } = useLocation()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-header__brand" aria-label="IceCreamStore home">
            <span className="site-header__logo" aria-hidden="true">🍦</span>
            <span className="site-header__wordmark">IceCreamStore</span>
          </Link>

          <nav className="site-header__nav" aria-label="Primary">
            {NAV.map(({ href, label, match }) => {
              const active = match(pathname)
              return (
                <Link
                  key={href}
                  to={href}
                  className={`site-header__link${active ? ' site-header__link--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="site-header__actions">
            {isAuthenticated ? (
              <Link to="/staff/inventory" className="site-header__btn site-header__btn--solid">
                Staff
              </Link>
            ) : (
              <Link to="/login" className="site-header__btn">
                Staff sign in
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
            Menu
          </Link>
        </div>
      </div>
    </>
  )
}
