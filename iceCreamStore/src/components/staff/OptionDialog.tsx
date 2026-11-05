import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { IconPicker } from '@/components/ui/IconPicker'
import { Switch } from '@/components/ui/Switch'
import { MoneyField } from '@/components/staff/MoneyField'
import { useAppDispatch } from '@/store/hooks'
import { addOption, updateOption } from '@/store/slices/optionsSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { centsToInput, parseMoneyInput } from '@/lib/money'
import { OPTION_KIND_LABEL, T } from '@/lib/texts'
import { slugId, validateLength } from '@/lib/validation'
import type { IconId, OptionItem, OptionKind } from '@/types/models'

const DEFAULT_ICON: Record<OptionKind, IconId> = { envase: 'cup', extra: 'sauce', topping: 'sprinkles' }

interface OptionDialogProps {
  kind: OptionKind
  option?: OptionItem
  onClose: () => void
}

export function OptionDialog({ kind, option, onClose }: OptionDialogProps) {
  const dispatch = useAppDispatch()
  const [name, setName] = useState(option?.name ?? '')
  const [icon, setIcon] = useState<IconId>(option?.icon ?? DEFAULT_ICON[kind])
  const [price, setPrice] = useState(centsToInput(option?.priceCents ?? 0))
  const [cost, setCost] = useState(centsToInput(option?.costCents))
  const [available, setAvailable] = useState(option?.available ?? true)
  const [errors, setErrors] = useState<{ name?: string; price?: string; cost?: string }>({})
  const label = OPTION_KIND_LABEL[kind].singular.toLowerCase()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // The dialog is portaled, but React still bubbles submit to a form that renders it.
    e.stopPropagation()
    const next: typeof errors = {}
    const nameError = validateLength(name, 2, 40)
    if (nameError) next.name = nameError
    const parsedPrice = parseMoneyInput(price)
    if (!parsedPrice.ok) next.price = parsedPrice.error
    const parsedCost = cost.trim() === '' ? null : parseMoneyInput(cost)
    if (parsedCost && !parsedCost.ok) next.cost = parsedCost.error
    setErrors(next)
    if (Object.keys(next).length > 0 || !parsedPrice.ok) return

    const item: OptionItem = {
      id: option?.id ?? slugId(name),
      kind,
      name: name.trim(),
      icon,
      priceCents: parsedPrice.cents,
      available,
    }
    if (parsedCost?.ok) item.costCents = parsedCost.cents
    if (option?.example) item.example = true
    dispatch(option ? updateOption(item) : addOption(item))
    dispatch(pushToast({ message: option ? `"${item.name}" actualizado` : `"${item.name}" creado` }))
    onClose()
  }

  const formId = 'option-form'
  return (
    <Dialog
      title={option ? `Editar ${label}` : `Nuevo ${label}`}
      onClose={onClose}
      footer={
        <div className="dialog__actions">
          <button type="submit" form={formId} className="btn btn--primary">{option ? T.saveChanges : T.create}</button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>{T.cancel}</button>
        </div>
      }
    >
      <form id={formId} className="form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span className="field__label">Nombre <span className="field__req" aria-hidden="true">*</span></span>
          <input
            className="field__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            aria-invalid={errors.name ? true : undefined}
            data-autofocus
          />
          {errors.name && <span className="field__error" role="alert">{errors.name}</span>}
        </label>
        <div className="form__row">
          <MoneyField label="Precio" value={price} onChange={setPrice} error={errors.price} hint="0 = incluido" required />
          <MoneyField label="Costo (opcional)" value={cost} onChange={setCost} error={errors.cost} hint="Para calcular la ganancia" />
        </div>
        <IconPicker value={icon} onChange={setIcon} />
        <Switch checked={available} onChange={setAvailable} label="Disponible" description="Si está apagado, no se ofrece en el armado." />
      </form>
    </Dialog>
  )
}
