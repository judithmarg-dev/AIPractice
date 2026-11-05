import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthGuard } from '@/components/AuthGuard'
import StaffLayout from '@/layouts/StaffLayout'
import CustomerLayout from '@/layouts/CustomerLayout'
import FlavorCatalogPage from '@/pages/FlavorCatalogPage'
import BookingPage from '@/pages/BookingPage'
import BookingConfirmationPage from '@/pages/BookingConfirmationPage'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/staff/DashboardPage'
import QueuePage from '@/pages/staff/QueuePage'
import InventoryPage from '@/pages/staff/InventoryPage'
import NewItemPage from '@/pages/staff/NewItemPage'
import EditItemPage from '@/pages/staff/EditItemPage'
import CategoriesPage from '@/pages/staff/CategoriesPage'
import OptionsPage from '@/pages/staff/OptionsPage'
import SettingsPage from '@/pages/staff/SettingsPage'
import BookingsPage from '@/pages/staff/BookingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<FlavorCatalogPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<AuthGuard />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="analytics" element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="cola" element={<QueuePage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/new" element={<NewItemPage />} />
          <Route path="inventory/:id/edit" element={<EditItemPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="opciones" element={<OptionsPage />} />
          <Route path="ajustes" element={<SettingsPage />} />
          <Route path="bookings" element={<BookingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
