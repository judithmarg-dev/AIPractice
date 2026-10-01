import type { Booking, BookingFormData } from '@/types/booking'

export async function submitBooking(data: BookingFormData): Promise<void> {
  const { createClient } = await import('@/lib/supabaseClient')
  const supabase = createClient()

  const { error } = await supabase.from('bookings').insert([
    {
      date: data.date,
      time: data.time,
      party_size: data.partySize,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
    },
  ])

  if (error) throw new Error(error.message)
}

export async function listBookings(): Promise<Booking[]> {
  const { createClient } = await import('@/lib/supabaseClient')
  const supabase = createClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateBookingStatus(
  id: string,
  status: 'confirmed' | 'cancelled'
): Promise<void> {
  const { createClient } = await import('@/lib/supabaseClient')
  const supabase = createClient()

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
