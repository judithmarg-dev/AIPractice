export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  id: string
  date: string
  time: string
  party_size: number
  first_name: string
  last_name: string
  email: string
  phone: string
  status: BookingStatus
  created_at: string
}

export interface BookingFormData {
  date: string
  time: string
  partySize: number
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface BookingFormErrors {
  date?: string
  time?: string
  partySize?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}
