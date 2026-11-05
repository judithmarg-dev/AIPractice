interface DateInputProps {
  value: string
  error?: string
  onChange: (v: string) => void
}

export function DateInput({ value, error, onChange }: DateInputProps) {
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="date" className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
        Fecha
      </label>
      <input
        id="date"
        type="date"
        min={today}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
        style={{
          borderColor: error ? 'var(--danger)' : 'var(--border)',
          background: 'var(--bg)',
          color: 'var(--text-h)',
        }}
      />
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}
