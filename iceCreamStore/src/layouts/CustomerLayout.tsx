import { Outlet } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import '../catalog.css'

export default function CustomerLayout() {
  return (
    <div className="customer-layout">
      <SiteHeader />
      <Outlet />
    </div>
  )
}
