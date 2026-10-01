'use client'
interface PartySizeInputProps {
  value: number
  error?: string
  onChange: (v: number) => void
}

export function PartySizeInput({ value, error, onChange }: PartySizeInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="partySize" className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
        Party size
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Decrease"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-9 h-9 rounded-full border flex items-center justify-center text-lg font-semibold"
          style={{ borderColor: 'var(--border)', color: 'var(--text-h)', background: 'var(--bg)' }}
        >
          −
        </button>
        <input
          id="partySize"
          type="number"
          min={1}
          max={20}
          value={value}
          onChange={(e) => onChange(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-16 text-center rounded-lg border px-2 py-2 text-sm"
          style={{ borderColor: error ? '#ef4444' : 'var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        />
        <button
          type="button"
          aria-label="Increase"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="w-9 h-9 rounded-full border flex items-center justify-center text-lg font-semibold"
          style={{ borderColor: 'var(--border)', color: 'var(--text-h)', background: 'var(--bg)' }}
        >
          +
        </button>
      </div>
      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  )
}
