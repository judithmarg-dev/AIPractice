import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectSettings, updateSettings } from '@/store/slices/settingsSlice'
import { selectHasDemoOrders } from '@/store/slices/orderSlice'
import { selectAllOptions } from '@/store/slices/optionsSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { clearDemoData, loadDemoData } from '@/store/orderActions'
import { replacePersisted } from '@/store/rootActions'
import { seedPersisted } from '@/store/persistence'
import { useConfirm } from '@/components/ui/ConfirmProvider'
import { MoneyField } from '@/components/staff/MoneyField'
import { Icon } from '@/components/icons'
import { centsToInput, formatOptionPrice, parseMoneyInput } from '@/lib/money'
import { OPTION_KIND_LABEL, T } from '@/lib/texts'
import { parseIntInRange } from '@/lib/validation'
import type { Settings } from '@/types/models'

type Field = 'ivaPercent' | 'lowStockThreshold' | 'maxScoops' | 'queueAmberMinutes' | 'queueRedMinutes'

const INT_FIELDS: { key: Field; label: string; hint: string; min: number; max: number; suffix?: string }[] = [
  { key: 'ivaPercent', label: 'IVA', hint: 'Se aplica sobre subtotal + recargo.', min: 0, max: 100, suffix: '%' },
  { key: 'lowStockThreshold', label: 'Umbral de stock bajo', hint: 'Por debajo de este número el producto aparece en alertas.', min: 0, max: 999, suffix: 'u.' },
  { key: 'maxScoops', label: 'Máximo de bolas por helado', hint: 'Incluye la bola base.', min: 1, max: 6 },
  { key: 'queueAmberMinutes', label: 'Alerta ámbar en la cola', hint: 'Minutos de espera para marcar un pedido como demorado.', min: 1, max: 600, suffix: 'min' },
  { key: 'queueRedMinutes', label: 'Alerta roja en la cola', hint: 'Minutos de espera para marcar un pedido como urgente.', min: 1, max: 600, suffix: 'min' },
]

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const confirm = useConfirm()
  const settings = useAppSelector(selectSettings)
  const hasDemo = useAppSelector(selectHasDemoOrders)
  const examples = useAppSelector(selectAllOptions).filter((o) => o.example)
  const [values, setValues] = useState<Record<Field, string>>(() => ({
    ivaPercent: String(settings.ivaPercent),
    lowStockThreshold: String(settings.lowStockThreshold),
    maxScoops: String(settings.maxScoops),
    queueAmberMinutes: String(settings.queueAmberMinutes),
    queueRedMinutes: String(settings.queueRedMinutes),
  }))
  const [surcharge, setSurcharge] = useState(centsToInput(settings.deliverySurchargeCents))
  const [errors, setErrors] = useState<Partial<Record<Field | 'surcharge', string>>>({})

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    const patch: Partial<Settings> = {}
    for (const f of INT_FIELDS) {
      const r = parseIntInRange(values[f.key], f.min, f.max)
      if (r.ok) patch[f.key] = r.value
      else next[f.key] = r.error
    }
    const money = parseMoneyInput(surcharge)
    if (money.ok) patch.deliverySurchargeCents = money.cents
    else next.surcharge = money.error
    if (!next.queueRedMinutes && !next.queueAmberMinutes && patch.queueRedMinutes! <= patch.queueAmberMinutes!) {
      next.queueRedMinutes = 'Debe ser mayor que el tiempo de la alerta ámbar.'
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return
    dispatch(updateSettings(patch))
    dispatch(pushToast({ message: 'Ajustes guardados' }))
  }

  async function handleLoadDemo() {
    const ok = await confirm({
      title: '¿Cargar datos de demostración?',
      message: 'Se crean dos meses de pedidos cobrados de ejemplo y se ajusta el stock para mostrar alertas. Puedes borrarlos después sin tocar tus pedidos reales.',
      confirmLabel: T.loadDemo,
    })
    if (!ok) return
    const count = dispatch(loadDemoData())
    dispatch(pushToast({ message: `${count} pedidos de demostración cargados`, link: { to: '/staff/dashboard', label: 'Ver dashboard' } }))
  }

  async function handleClearDemo() {
    const ok = await confirm({
      title: '¿Borrar los datos de demostración?',
      message: 'Se eliminan solo los pedidos de demostración y el stock vuelve al que había antes de cargarlos.',
      confirmLabel: T.clearDemo,
      tone: 'warning',
    })
    if (!ok) return
    dispatch(clearDemoData())
    dispatch(pushToast({ message: 'Datos de demostración borrados' }))
  }

  async function handleReset() {
    const ok = await confirm({
      title: '¿Restablecer los datos de la tienda?',
      message: 'Se borran productos, categorías, opciones, pedidos, reservas y ajustes, y todo vuelve al catálogo inicial. No se puede deshacer.',
      confirmLabel: 'Restablecer todo',
      tone: 'danger',
    })
    if (!ok) return
    const seed = seedPersisted()
    dispatch(replacePersisted(seed))
    setValues({
      ivaPercent: String(seed.settings.ivaPercent),
      lowStockThreshold: String(seed.settings.lowStockThreshold),
      maxScoops: String(seed.settings.maxScoops),
      queueAmberMinutes: String(seed.settings.queueAmberMinutes),
      queueRedMinutes: String(seed.settings.queueRedMinutes),
    })
    setSurcharge(centsToInput(seed.settings.deliverySurchargeCents))
    dispatch(pushToast({ message: 'La tienda volvió a los datos iniciales' }))
  }

  return (
    <div className="staff-page staff-page--narrow">
      <header className="staff-page__head">
        <div>
          <h1 className="staff-page__title">Ajustes</h1>
          <p className="staff-page__subtitle">Impuestos, recargos, umbrales y datos de la tienda.</p>
        </div>
      </header>

      <form className="panel-card form" onSubmit={handleSave} noValidate>
        <h2 className="panel-card__title">Cálculos y alertas</h2>
        <div className="form__grid">
          <MoneyField
            label="Recargo de delivery"
            value={surcharge}
            onChange={setSurcharge}
            error={errors.surcharge}
            hint="Monto fijo por pedido de delivery."
            required
          />
          {INT_FIELDS.map((f) => (
            <label key={f.key} className="field">
              <span className="field__label">{f.label}{f.suffix ? ` (${f.suffix})` : ''}</span>
              <input
                className="field__input"
                inputMode="numeric"
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                aria-invalid={errors[f.key] ? true : undefined}
              />
              <span className="field__hint">{f.hint}</span>
              {errors[f.key] && <span className="field__error" role="alert">{errors[f.key]}</span>}
            </label>
          ))}
        </div>
        <div className="form__actions">
          <button type="submit" className="btn btn--primary">Guardar ajustes</button>
        </div>
      </form>

      <section className="panel-card" aria-labelledby="examples-heading">
        <h2 id="examples-heading" className="panel-card__title">Catálogo de ejemplo</h2>
        <p className="panel-card__text">
          Estas opciones vienen de ejemplo para empezar. Edítalas, ocúltalas o elimínalas en{' '}
          <Link to="/staff/opciones" className="link">Opciones</Link>.
        </p>
        {examples.length === 0 ? (
          <p className="panel-card__text">No quedan opciones de ejemplo.</p>
        ) : (
          <ul className="example-list">
            {examples.map((o) => (
              <li key={o.id} className="chip chip--neutral">
                <Icon name={o.icon} size={14} /> {o.name} · {OPTION_KIND_LABEL[o.kind].singular} · {formatOptionPrice(o.priceCents)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel-card" aria-labelledby="data-heading">
        <h2 id="data-heading" className="panel-card__title">Datos de la tienda</h2>
        <p className="panel-card__text">
          Todo se guarda en este navegador. Los datos de demostración sirven para ver el dashboard con actividad.
        </p>
        <div className="data-actions">
          <button type="button" className="btn btn--secondary" onClick={handleLoadDemo}>
            <Icon name="chart" size={18} /> {T.loadDemo}
          </button>
          <button type="button" className="btn btn--warning" onClick={handleClearDemo} disabled={!hasDemo}>
            <Icon name="trash" size={18} /> {T.clearDemo}
          </button>
          <button type="button" className="btn btn--danger" onClick={handleReset}>
            <Icon name="restore" size={18} /> Restablecer datos de la tienda
          </button>
        </div>
      </section>
    </div>
  )
}
