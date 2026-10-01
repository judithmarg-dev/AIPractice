import { StaffNav } from '@/components/staff/StaffNav'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <StaffNav />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
