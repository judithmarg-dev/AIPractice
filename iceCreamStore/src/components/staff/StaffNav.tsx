'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const NAV = [
  { href: '/staff/inventory', label: 'Inventory' },
  { href: '/staff/bookings',  label: 'Bookings' },
  { href: '/staff/analytics', label: 'Analytics' },
]

export function StaffNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
    >
      <div className="flex items-center gap-1">
        <Link href="/" className="text-sm font-bold mr-4" style={{ color: 'var(--accent)' }}>
          🍦 ICS
        </Link>
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
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
      <button
        onClick={signOut}
        className="text-sm px-3 py-1.5 rounded-lg"
        style={{ color: 'var(--text)', background: 'transparent' }}
      >
        Sign out
      </button>
    </nav>
  )
}
