import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Booking, BookingStatus } from '@/types/booking'

interface BookingsState {
  items: Booking[]
}

const initialState: BookingsState = {
  items: [],
}

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    addBooking(state, action: PayloadAction<Booking>) {
      state.items.unshift(action.payload)
    },
    updateBookingStatus(
      state,
      action: PayloadAction<{ id: string; status: BookingStatus }>
    ) {
      const booking = state.items.find((b) => b.id === action.payload.id)
      if (booking) booking.status = action.payload.status
    },
  },
})

export const { addBooking, updateBookingStatus } = bookingsSlice.actions

export const selectAllBookings = (state: { bookings: BookingsState }) =>
  state.bookings.items

export default bookingsSlice.reducer
