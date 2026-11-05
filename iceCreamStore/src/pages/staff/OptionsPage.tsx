import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { removeOption, selectOptionsByKind, setOptionAvailable } from '@/store/slices/optionsSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { OptionDialog } from '@/components/staff/OptionDialog'
import { useConfirm } from '@/components/ui/ConfirmProvider'
import { Icon } from '@/components/icons'
import { formatMoney, formatOptionPrice } from '@/lib/money'
import { OPTION_KIND_LABEL } from '@/lib/texts'
import type { OptionItem, OptionKind } from '@/types/models'

const KINDS: { kind: OptionKind; hint: string }[] = [
  { kind: 'envase', hint: 'Un envase por helado. Se puede preseleccionar uno por producto.' },
  { kind: 'extra', hint: 'Adicionales con precio, selección múltiple.' },
  { kind: 'topping', hint: 'Coberturas con precio, selección múltiple.' },
]

export default function OptionsPage() {
  const dispatch = useAppDispatch()
  const confirm = useConfirm()
  const byKind = useAppSelector(selectOptionsByKind)
  const [dialog, setDialog] = useState<{ kind: OptionKind; option?: OptionItem } | null>(null)

  async function handleDelete(option: OptionItem) {
    const ok = await confirm({
      title: `¿Eliminar "${option.name}"?`,
      message: 'Los pedidos ya registrados conservan su nombre y precio. Si solo quieres dejar de ofrecerlo, ocúltalo.',
      confirmLabel: 'Eliminar',
      tone: 'danger',
    })
    if (!ok) return
    dispatch(removeOption(option.id))
    dispatch(pushToast({ message: `"${option.name}" eliminado` }))
  }

  return (
    <div className="staff-page">
      <header className="staff-page__head">
        <div>
          <h1 className="staff-page__title">Opciones</h1>
          <p className="staff-page__subtitle">Envases, extras y toppings que se eligen al armar un helado. Sin inventario.</p>
        </div>
      </header>

      {KINDS.map(({ kind, hint }) => {
        const label = OPTION_KIND_LABEL[kind]
        const items = byKind[kind]
        return (
          <section key={kind} className="staff-section" aria-labelledby={`options-${kind}`}>
            <div className="staff-section__head">
              <div>
                <h2 id={`options-${kind}`} className="staff-section__title">{label.plural}</h2>
                <p className="staff-section__hint">{hint}</p>
              </div>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setDialog({ kind })}>
                <Icon name="plus" size={16} /> Nuevo {label.singular.toLowerCase()}
              </button>
            </div>
            {items.length === 0 ? (
              <p className="staff-page__empty">Todavía no hay {label.plural.toLowerCase()}.</p>
            ) : (
              <ul className="tile-grid">
                {items.map((o) => (
                  <li key={o.id} className={`tile-card${o.available ? '' : ' tile-card--muted'}`}>
                    <span className="tile-card__icon"><Icon name={o.icon} size={28} /></span>
                    <p className="tile-card__title">{o.name}</p>
                    <p className="tile-card__price">{formatOptionPrice(o.priceCents)}</p>
                    <p className="tile-card__meta">
                      {o.costCents !== undefined ? `Costo ${formatMoney(o.costCents)}` : 'Sin costo'}
                    </p>
                    <p className="tile-card__chips">
                      {!o.available && <span className="chip chip--warning"><Icon name="eye-off" size={12} /> Oculta</span>}
                      {o.example && <span className="chip chip--neutral">Ejemplo</span>}
                    </p>
                    <div className="tile-card__actions">
                      <button type="button" className="icon-btn" onClick={() => setDialog({ kind, option: o })} aria-label={`Editar ${o.name}`}>
                        <Icon name="edit" size={18} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => dispatch(setOptionAvailable({ id: o.id, available: !o.available }))}
                        aria-label={o.available ? `Ocultar ${o.name}` : `Mostrar ${o.name}`}
                        aria-pressed={!o.available}
                      >
                        <Icon name={o.available ? 'eye-off' : 'eye'} size={18} />
                      </button>
                      <button type="button" className="icon-btn icon-btn--danger" onClick={() => handleDelete(o)} aria-label={`Eliminar ${o.name}`}>
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}

      {dialog && <OptionDialog kind={dialog.kind} option={dialog.option} onClose={() => setDialog(null)} />}
    </div>
  )
}
