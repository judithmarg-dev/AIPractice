import type { Booking, BookingFormData } from '@/types/booking'
import { store } from '@/store'
import { addBooking, selectAllBookings, updateBookingStatus as updateStatus } from '@/store/slices/bookingsSlice'

export async function submitBooking(data: BookingFormData): Promise<void> {
  store.dispatch(addBooking({
    id: crypto.randomUUID(),
    date: data.date,
    time: data.time,
    party_size: data.partySize,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    status: 'pending',
    created_at: new Date().toISOString(),
  }))
}

export async function listBookings(): Promise<Booking[]> {
  return selectAllBookings(store.getState())
}

export async function updateBookingStatus(
  id: string,
  status: 'confirmed' | 'cancelled'
): Promise<void> {
  store.dispatch(updateStatus({ id, status }))
}
