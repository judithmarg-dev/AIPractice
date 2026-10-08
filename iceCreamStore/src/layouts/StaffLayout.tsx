import { Outlet } from 'react-router-dom'
import { StaffNav } from '@/components/staff/StaffNav'

export default function StaffLayout() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <StaffNav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
