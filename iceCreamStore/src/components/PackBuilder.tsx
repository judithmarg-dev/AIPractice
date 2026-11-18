import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addLine } from '@/store/slices/orderSlice'
import { selectActiveProducts } from '@/store/slices/inventorySlice'
import { clearPack, selectPack, selectPackKind, toggleFlavor } from '@/store/slices/packSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { selectAvailableStock } from '@/store/selectors'
import { ScoopSprite } from '@/components/ScoopSprite'
import { Icon } from '@/components/icons'
import { formatMoney } from '@/lib/money'
import { makeBuildLine, toSnapshot } from '@/lib/orderMath'
import { PACK_RULES, limitText } from '@/lib/presentations'
import { spriteOf } from '@/lib/scoopSprites'
import { plural } from '@/lib/texts'
import type { Product } from '@/types/models'

/** Cone with the picked scoops stacked on it; every new scoop drops in. */
function Cone({ flavors }: { flavors: Product[] }) {
  const names = flavors.map((p) => p.name).join(', ')
  return (
    <div
      className="pack__stage"
      style={{ '--count': Math.max(flavors.length, 1) } as React.CSSProperties}
      role="img"
      aria-label={`Barquillo con ${plural(flavors.length, 'bola', 'bolas')}: ${names}`}
    >
      <svg className="pack__cone" viewBox="0 0 130 150" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="pack-cone-clip">
            <path d="M4 0 H126 L65 148 Z" />
          </clipPath>
        </defs>
        <path d="M4 0 H126 L65 148 Z" fill="#e2a85a" />
        <g clipPath="url(#pack-cone-clip)" stroke="#b9772e" strokeWidth="2.2" opacity="0.7">
          {[-60, -30, 0, 30, 60, 90, 120, 150, 180].map((x) => (
            <g key={x}>
              <line x1={x} y1="0" x2={x + 120} y2="150" />
              <line x1={x + 130} y1="0" x2={x + 10} y2="150" />
            </g>
          ))}
        </g>
        <path d="M4 0 H126 L65 148 Z" fill="none" stroke="#b9772e" strokeWidth="3" strokeLinejoin="round" />
        <rect x="0" y="0" width="130" height="9" rx="4.5" fill="#cf8f3f" />
      </svg>
      {flavors.map((p, i) => {
        const sprite = spriteOf(p)
        return (
          <div key={p.id} className="pack__scoop" style={{ '--n': i } as React.CSSProperties}>
            {sprite ? (
              <ScoopSprite sprite={sprite} className="pack__scoop-img" />
            ) : (
              <span className="pack__scoop-fallback" style={{ background: p.color }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/** The artisan pack being assembled, shown at the top of the order (section.order). */
export function PackBuilder() {
  const dispatch = useAppDispatch()
  const pack = useAppSelector(selectPack)
  const kind = useAppSelector(selectPackKind)
  const products = useAppSelector(selectActiveProducts)
  const settings = useAppSelector((s) => s.settings)
  const available = useAppSelector((s) => selectAvailableStock(s, null))
  const [error, setError] = useState<string | null>(null)

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const flavors = pack.flavorIds.map((id) => byId.get(id)).filter((p): p is Product => p !== undefined)
  if (flavors.length === 0) return null

  const rule = PACK_RULES[kind]
  const byWeight = pack.mode === 'peso'
  const priceCents = byWeight
    ? kind === 'kilo' ? settings.kiloPriceCents : settings.halfKiloPriceCents
    : flavors.reduce((sum, p) => sum + p.priceCents, 0)
  const missing = rule.min - flavors.length
  const ready = missing <= 0

  function handleAdd() {
    const short = flavors.find((p) => (available[p.id] ?? 0) < 1)
    if (short) return setError(`No hay stock de ${short.name}.`)
    setError(null)
    dispatch(
      addLine(
        makeBuildLine({
          lineId: crypto.randomUUID(),
          categoryId: flavors[0].categoryId,
          scoops: flavors.map(toSnapshot),
          extras: [],
          toppings: [],
          qty: 1,
          presentation: pack.mode,
          pack: byWeight ? { kind: kind as 'kilo' | 'medio', label: rule.label, priceCents } : undefined,
        })
      )
    )
    dispatch(clearPack())
    dispatch(pushToast({ message: `${byWeight ? rule.label : 'Porción'} agregado al pedido · ${formatMoney(priceCents)}` }))
  }

  return (
    <div className="pack" aria-live="polite">
      <div className="pack__head">
        <h3 className="pack__title">{byWeight ? `Tu ${rule.label}` : 'Tu porción'}</h3>
        <span className="pack__count">
          {flavors.length} de {rule.max} {rule.max === 1 ? 'sabor' : 'sabores'}
        </span>
      </div>

      {byWeight ? (
        // By weight there is no animation: just the picked flavors.
        <ul className="pack__tub">
          {flavors.map((p) => {
            const sprite = spriteOf(p)
            return (
              <li key={p.id} className="pack__tub-item">
                {sprite ? (
                  <ScoopSprite sprite={sprite} className="pack__tub-img" />
                ) : (
                  <span className="pack__scoop-fallback" style={{ background: p.color }} />
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <Cone flavors={flavors} />
      )}

      <ul className="pack__flavors">
        {flavors.map((p) => (
          <li key={p.id} className="pack__flavor">
            <span className="pack__flavor-name">{p.name}</span>
            {!byWeight && <span className="pack__flavor-price">{formatMoney(p.priceCents)}</span>}
            <button
              type="button"
              className="pack__flavor-remove"
              onClick={() => dispatch(toggleFlavor(p.id))}
              aria-label={`Quitar ${p.name}`}
            >
              <Icon name="close" size={14} />
            </button>
          </li>
        ))}
      </ul>

      <p className="pack__hint">
        {ready
          ? flavors.length >= rule.max
            ? 'Llegaste al máximo de sabores.'
            : `Puedes sumar ${limitText({ ...rule, min: 1, max: rule.max - flavors.length })}.`
          : `Elige ${plural(missing, 'sabor más', 'sabores más')} (${limitText(rule)}).`}
      </p>
      {error && (
        <p className="pack__error" role="alert">
          {error}
        </p>
      )}

      <div className="pack__actions">
        <button type="button" className="order__btn order__btn--primary" disabled={!ready} onClick={handleAdd}>
          <span>Agregar al pedido</span>
          <span>{formatMoney(priceCents)}</span>
        </button>
        <button type="button" className="order__btn order__btn--secondary" onClick={() => dispatch(clearPack())}>
          Quitar todo
        </button>
      </div>
    </div>
  )
}
