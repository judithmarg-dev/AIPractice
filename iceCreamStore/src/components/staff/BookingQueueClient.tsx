'use client'
import { useState, useEffect, useTransition } from 'react'
import type { Booking, BookingStatus } from '@/types/booking'
import { StatusBadge } from './StatusBadge'
import { updateStatus } from '@/app/staff/bookings/actions'
import { createClient } from '@/lib/supabaseClient'

export function BookingQueueClient({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings)
  const [newCount, setNewCount] = useState(0)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        setBookings((prev) => [payload.new as Booking, ...prev])
        setNewCount((c) => c + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  function handleStatusChange(id: string, next: BookingStatus) {
    const prev = bookings.find((b) => b.id === id)?.status
    setBookings((bs) => bs.map((b) => b.id === id ? { ...b, status: next } : b))

    startTransition(async () => {
      try {
        await updateStatus(id, next)
      } catch {
        if (prev) setBookings((bs) => bs.map((b) => b.id === id ? { ...b, status: prev } : b))
      }
    })
  }

  return (
    <div>
      {newCount > 0 && (
        <div
          className="mb-4 px-4 py-2 rounded-lg text-sm"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
        >
          {newCount} new booking{newCount !== 1 ? 's' : ''} arrived — list updated automatically.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--accent-bg)' }}>
              {['Name', 'Date', 'Time', 'Guests', 'Contact', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-h)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', opacity: isPending ? 0.7 : 1 }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-h)' }}>
                  {b.first_name} {b.last_name}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{b.date}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{b.time}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{b.party_size}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text)' }}>
                  <div>{b.email}</div>
                  <div className="text-xs">{b.phone}</div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {b.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(b.id, 'confirmed')}
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}
                      >
                        Confirm
                      </button>
                    )}
                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(b.id, 'cancelled')}
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!bookings.length && (
          <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text)' }}>No bookings yet.</p>
        )}
      </div>
    </div>
  )
}
