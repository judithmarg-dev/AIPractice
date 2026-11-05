import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/icons'

interface ExportMenuProps {
  busy: boolean
  onPdf: () => void
  onSummaryCsv: () => void
  onDetailCsv: () => void
}

/** "Exportar" disclosure with the three downloads (RF-7.7, RF-7.8). */
export function ExportMenu({ busy, onPdf, onSummaryCsv, onDetailCsv }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        ref.current?.querySelector<HTMLButtonElement>('button')?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const run = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  return (
    <div className="export-menu" ref={ref}>
      <button
        type="button"
        className="btn btn--primary"
        aria-expanded={open}
        aria-controls="export-menu-list"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
      >
        <Icon name="download" size={18} /> {busy ? 'Generando…' : 'Exportar'}
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <ul id="export-menu-list" className="export-menu__list">
          <li>
            <button type="button" className="export-menu__item" onClick={run(onPdf)}>
              <Icon name="note" size={18} />
              <span>
                <span className="export-menu__title">Descargar PDF</span>
                <span className="export-menu__hint">Indicadores y gráficos, A4</span>
              </span>
            </button>
          </li>
          <li>
            <button type="button" className="export-menu__item" onClick={run(onSummaryCsv)}>
              <Icon name="chart" size={18} />
              <span>
                <span className="export-menu__title">CSV · Resumen</span>
                <span className="export-menu__hint">Una fila por hora o por día</span>
              </span>
            </button>
          </li>
          <li>
            <button type="button" className="export-menu__item" onClick={run(onDetailCsv)}>
              <Icon name="receipt" size={18} />
              <span>
                <span className="export-menu__title">CSV · Detalle de órdenes</span>
                <span className="export-menu__hint">Una fila por línea de pedido</span>
              </span>
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
