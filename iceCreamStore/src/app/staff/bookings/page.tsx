import { createClient } from '@/lib/supabaseServer'
import { BookingQueueClient } from '@/components/staff/BookingQueueClient'
import type { Booking } from '@/types/booking'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-h)' }}>Bookings</h1>
      <BookingQueueClient initialBookings={(data ?? []) as Booking[]} />
    </div>
  )
}
