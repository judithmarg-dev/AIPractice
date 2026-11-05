import { Outlet } from 'react-router-dom'
import { StaffNav } from '@/components/staff/StaffNav'
import '../catalog.css'
import '../staff.css'

export default function StaffLayout() {
  return (
    <div className="staff-layout">
      <StaffNav />
      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  )
}
