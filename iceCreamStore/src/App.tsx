import { Routes, Route } from 'react-router-dom'
import { AuthGuard } from '@/components/AuthGuard'
import StaffLayout from '@/layouts/StaffLayout'
import FlavorCatalogPage from '@/pages/FlavorCatalogPage'
import BookingPage from '@/pages/BookingPage'
import BookingConfirmationPage from '@/pages/BookingConfirmationPage'
import LoginPage from '@/pages/LoginPage'
import InventoryPage from '@/pages/staff/InventoryPage'
import NewItemPage from '@/pages/staff/NewItemPage'
import EditItemPage from '@/pages/staff/EditItemPage'
import BookingsPage from '@/pages/staff/BookingsPage'
import AnalyticsPage from '@/pages/staff/AnalyticsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FlavorCatalogPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/new" element={<NewItemPage />} />
          <Route path="inventory/:id/edit" element={<EditItemPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
