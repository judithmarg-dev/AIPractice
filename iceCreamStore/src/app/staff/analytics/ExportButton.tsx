'use client'
import { useState } from 'react'
import { exportBookingsCSV } from '@/lib/exportCsv'
import type { Booking } from '@/types/booking'
import { createClient } from '@/lib/supabaseClient'

export function ExportButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
      exportBookingsCSV((data ?? []) as Booking[])
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="px-4 py-2 rounded-lg text-sm font-semibold border disabled:opacity-60"
      style={{ borderColor: 'var(--border)', color: 'var(--text-h)', background: 'var(--bg)' }}
    >
      {loading ? 'Exporting…' : '↓ Export CSV'}
    </button>
  )
}
