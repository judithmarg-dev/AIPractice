import { useMemo, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { OptionCard } from '@/components/ui/OptionCard'
import { Stepper } from '@/components/ui/Stepper'
import { ScoopIcon } from '@/components/FlavorTile'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectActiveProducts } from '@/store/slices/inventorySlice'
import { selectAvailableOptionsByKind } from '@/store/slices/optionsSlice'
import { addLine, updateLine } from '@/store/slices/orderSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { selectAvailableStock } from '@/store/selectors'
import { formatMoney, formatOptionPrice } from '@/lib/money'
import { buildUnitPrice, makeBuildLine, toSnapshot } from '@/lib/orderMath'
import { T, plural } from '@/lib/texts'
import type { OrderLine } from '@/types/models'

interface BuildModalProps {
  baseId: string
  /** Line being edited (RF-4.10). */
  line?: OrderLine
  onClose: () => void
}

const MAX_QTY = 20

export function BuildModal({ baseId, line, onClose }: BuildModalProps) {
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectActiveProducts)
  const options = useAppSelector(selectAvailableOptionsByKind)
  const maxScoops = useAppSelector((s) => s.settings.maxScoops)
  const available = useAppSelector((s) => selectAvailableStock(s, line?.lineId ?? null))
  const base = products.find((p) => p.id === baseId)
  const flavors = useMemo(() => products.filter((p) => base && p.categoryId === base.categoryId), [products, base])

  // Extra scoops in the order they were added (ids may repeat).
  const [extraScoops, setExtraScoops] = useState<string[]>(() => line?.build?.scoops.slice(1).map((s) => s.id) ?? [])
  const [containerId, setContainerId] = useState<string | null>(() => {
    if (line?.build) return line.build.container?.id ?? null
    const preferred = base?.defaultContainerId
    return preferred && options.envase.some((o) => o.id === preferred) ? preferred : null
  })
  const [extraIds, setExtraIds] = useState<string[]>(() => line?.build?.extras.map((o) => o.id) ?? [])
  const [toppingIds, setToppingIds] = useState<string[]>(() => line?.build?.toppings.map((o) => o.id) ?? [])
  const [qty, setQty] = useState(line?.qty ?? 1)

  if (!base) return null

  const scoopIds = [base.id, ...extraScoops]
  const counts: Record<string, number> = {}
  for (const id of scoopIds) counts[id] = (counts[id] ?? 0) + 1
  const totalScoops = scoopIds.length
  const atMax = totalScoops >= maxScoops
  const stockOf = (id: string) => available[id] ?? 0

  const byId = new Map(products.map((p) => [p.id, p]))
  const container = options.envase.find((o) => o.id === containerId)
  const extras = options.extra.filter((o) => extraIds.includes(o.id))
  const toppings = options.topping.filter((o) => toppingIds.includes(o.id))
  const scoopSnapshots = scoopIds.map((id) => byId.get(id)).filter((p) => p !== undefined).map(toSnapshot)
  const unitPrice = buildUnitPrice({
    scoops: scoopSnapshots,
    container: container ? toSnapshot(container) : undefined,
    extras: extras.map(toSnapshot),
    toppings: toppings.map(toSnapshot),
  })

  const shortFlavor = Object.entries(counts).find(([id, n]) => n * qty > stockOf(id))
  const baseSoldOut = stockOf(base.id) < 1
  const blocked = baseSoldOut || shortFlavor !== undefined
  const maxQty = Math.max(1, Math.min(MAX_QTY, ...Object.entries(counts).map(([id, n]) => Math.floor(stockOf(id) / n))))

  const addScoop = (id: string) => setExtraScoops((list) => [...list, id])
  const removeScoop = (id: string) =>
    setExtraScoops((list) => {
      const i = list.lastIndexOf(id)
      return i === -1 ? list : [...list.slice(0, i), ...list.slice(i + 1)]
    })
  const toggle = (list: string[], id: string, on: boolean) => (on ? [...list, id] : list.filter((x) => x !== id))

  function handleSubmit() {
    if (blocked) return
    const next = makeBuildLine({
      lineId: line?.lineId ?? crypto.randomUUID(),
      categoryId: base!.categoryId,
      scoops: scoopSnapshots,
      container: container ? toSnapshot(container) : undefined,
      extras: extras.map(toSnapshot),
      toppings: toppings.map(toSnapshot),
      qty,
    })
    dispatch(line ? updateLine(next) : addLine(next))
    dispatch(pushToast({ message: line ? 'Cambios guardados en la línea' : `Helado agregado al pedido · ${formatMoney(unitPrice * qty)}` }))
    onClose()
  }

  const summary = scoopIds
    .map((id, i) => `${i + 1}. ${byId.get(id)?.name ?? ''}${i === 0 ? ' (base)' : ''}`)
    .join(' · ')

  const header = (
    <div className="build__header">
      <div className="build__hero" style={{ '--flavor-color': base.color } as React.CSSProperties} aria-hidden="true">
        {base.image ? <img src={base.image} alt="" /> : <ScoopIcon size={56} />}
      </div>
      <div className="build__intro">
        <p className="build__eyebrow">{line ? 'Editar helado' : 'Arma tu helado'}</p>
        <p className="build__name">{base.name}</p>
        {base.description && <p className="build__description">{base.description}</p>}
        <p className="build__base-price">
          Base · {formatMoney(base.priceCents)} por bola
          {baseSoldOut && <span className="chip chip--danger">{T.soldOut}</span>}
        </p>
      </div>
    </div>
  )

  const footer = (
    <div className="build__footer">
      {blocked && (
        <p className="build__warning" role="alert">
          {baseSoldOut
            ? `${base.name} está agotado.`
            : `No hay stock de ${byId.get(shortFlavor![0])?.name} para ${plural(qty, 'helado', 'helados')}.`}
        </p>
      )}
      <div className="build__footer-row">
        <Stepper size="sm" value={qty} onChange={setQty} min={1} max={Math.max(qty, maxQty)} label="Cantidad de helados" />
        <button type="button" className="btn btn--primary btn--grow" onClick={handleSubmit} disabled={blocked}>
          <span>{line ? T.saveChanges : T.addToOrder}</span>
          <span aria-live="polite">{formatMoney(unitPrice * qty)}</span>
        </button>
      </div>
    </div>
  )

  return (
    <Dialog title={`${line ? 'Editar' : 'Armar'} helado: ${base.name}`} header={header} footer={footer} size="lg" onClose={onClose}>
      <section className="build__section" aria-labelledby="build-scoops">
        <div className="build__section-head">
          <h3 id="build-scoops" className="build__section-title">Bolas adicionales</h3>
          <span className="build__section-meta">
            Opcional · {totalScoops} de {maxScoops} {maxScoops === 1 ? 'bola' : 'bolas'}
          </span>
        </div>
        <p className="build__summary">{summary}</p>
        <div className="option-grid">
          {flavors.map((p) => {
            const extraCount = extraScoops.filter((id) => id === p.id).length
            const canAddOne = (counts[p.id] ?? 0) + 1 <= stockOf(p.id)
            const soldOut = p.stock === 0
            const disabled = extraCount === 0 && (atMax || !canAddOne)
            const note = soldOut ? T.soldOut : !canAddOne ? 'Sin stock disponible' : T.maxReached
            return (
              <OptionCard
                key={p.id}
                type="checkbox"
                name="scoops"
                checked={extraCount > 0}
                onChange={(on) => (on ? addScoop(p.id) : setExtraScoops((l) => l.filter((id) => id !== p.id)))}
                title={p.name}
                price={`+${formatMoney(p.priceCents)}`}
                image={p.image}
                icon="cone"
                color={p.color}
                disabled={disabled}
                note={note}
              >
                {extraCount > 0 && (
                  <div className="option-card__extra">
                    <Stepper
                      size="sm"
                      value={extraCount}
                      onChange={(n) => (n > extraCount ? addScoop(p.id) : removeScoop(p.id))}
                      max={atMax || !canAddOne ? extraCount : extraCount + 1}
                      label={`Bolas de ${p.name}`}
                    />
                  </div>
                )}
              </OptionCard>
            )
          })}
        </div>
      </section>

      <section className="build__section" aria-labelledby="build-container">
        <h3 id="build-container" className="build__section-title">Envase</h3>
        <div className="option-grid" role="radiogroup" aria-labelledby="build-container">
          <OptionCard
            type="radio"
            name="container"
            checked={containerId === null}
            onChange={() => setContainerId(null)}
            title={T.noContainer}
            price={T.included}
            icon="tub"
          />
          {options.envase.map((o) => (
            <OptionCard
              key={o.id}
              type="radio"
              name="container"
              checked={containerId === o.id}
              onChange={() => setContainerId(o.id)}
              title={o.name}
              price={formatOptionPrice(o.priceCents)}
              icon={o.icon}
            />
          ))}
        </div>
      </section>

      {(['extra', 'topping'] as const).map((kind) => {
        const list = options[kind]
        if (list.length === 0) return null
        const selected = kind === 'extra' ? extraIds : toppingIds
        const setSelected = kind === 'extra' ? setExtraIds : setToppingIds
        const titleId = `build-${kind}`
        return (
          <section key={kind} className="build__section" aria-labelledby={titleId}>
            <div className="build__section-head">
              <h3 id={titleId} className="build__section-title">{kind === 'extra' ? 'Extras' : 'Toppings'}</h3>
              <span className="build__section-meta">Opcional · puedes elegir varios</span>
            </div>
            <div className="option-grid">
              {list.map((o) => (
                <OptionCard
                  key={o.id}
                  type="checkbox"
                  name={kind}
                  checked={selected.includes(o.id)}
                  onChange={(on) => setSelected((l) => toggle(l, o.id, on))}
                  title={o.name}
                  price={formatOptionPrice(o.priceCents)}
                  icon={o.icon}
                />
              ))}
            </div>
          </section>
        )
      })}
    </Dialog>
  )
}
