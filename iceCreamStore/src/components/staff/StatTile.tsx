interface StatTileProps {
  label: string
  value: string | number
  sublabel?: string
  accent?: boolean
}

export function StatTile({ label, value, sublabel, accent }: StatTileProps) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-1"
      style={{
        borderColor: accent ? 'var(--accent-border)' : 'var(--border)',
        background: accent ? 'var(--accent-bg)' : 'var(--bg)',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}>
        {label}
      </p>
      <p className="text-3xl font-bold" style={{ color: 'var(--text-h)' }}>{value}</p>
      {sublabel && <p className="text-xs" style={{ color: 'var(--text)' }}>{sublabel}</p>}
    </div>
  )
}
