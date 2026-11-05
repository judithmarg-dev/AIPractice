import { TIME_SLOTS } from '@/data/timeSlots'

interface TimeSelectProps {
  value: string
  error?: string
  onChange: (v: string) => void
}

export function TimeSelect({ value, error, onChange }: TimeSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="time" className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
        Hora
      </label>
      <select
        id="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
        style={{
          borderColor: error ? 'var(--danger)' : 'var(--border)',
          background: 'var(--bg)',
          color: value ? 'var(--text-h)' : 'var(--text)',
        }}
      >
        <option value="">Elige un horario</option>
        {TIME_SLOTS.map((slot) => (
          <option key={slot} value={slot}>{slot}</option>
        ))}
      </select>
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}
