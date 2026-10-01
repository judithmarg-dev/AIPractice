'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'
import type { BookingStatus } from '@/types/booking'

export async function updateStatus(id: string, status: BookingStatus) {
  const supabase = await createClient()
  await supabase.from('bookings').update({ status }).eq('id', id)
  revalidatePath('/staff/bookings')
}
