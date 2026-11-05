import { useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectActiveCategories, selectCategoryMap } from '@/store/slices/categoriesSlice'
import { selectOptionsByKind } from '@/store/slices/optionsSlice'
import { CategoryDialog } from '@/components/staff/CategoryDialog'
import { MoneyField } from '@/components/staff/MoneyField'
import { ScoopIcon } from '@/components/FlavorTile'
import { centsToInput, formatOptionPrice, parseMoneyInput } from '@/lib/money'
import { ImageError, compressImage } from '@/lib/image'
import { parseIntInRange, validateLength } from '@/lib/validation'
import type { Product } from '@/types/models'

export type ProductInput = Omit<Product, 'id' | 'archived' | 'createdAt'>

const NEW_CATEGORY = '__new__'

interface ProductFormProps {
  initial?: Product
  submitLabel: string
  onSubmit: (data: ProductInput) => void
}

type Errors = Partial<Record<'name' | 'categoryId' | 'price' | 'cost' | 'stock' | 'image', string>>

/** RF-3.1: product fields with a contextual price label, cost, colour picker and default container. */
export function ProductForm({ initial, submitLabel, onSubmit }: ProductFormProps) {
  const categories = useAppSelector(selectActiveCategories)
  const categoryMap = useAppSelector(selectCategoryMap)
  const envases = useAppSelector(selectOptionsByKind).envase
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [price, setPrice] = useState(centsToInput(initial?.priceCents))
  const [cost, setCost] = useState(centsToInput(initial?.costCents))
  const [stock, setStock] = useState(initial ? String(initial.stock) : '')
  const [image, setImage] = useState<string | undefined>(initial?.image)
  const [color, setColor] = useState(initial?.color ?? '#f9a8d4')
  const [containerId, setContainerId] = useState(initial?.defaultContainerId ?? '')
  const [errors, setErrors] = useState<Errors>({})
  const [processing, setProcessing] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)

  const buildable = categoryMap[categoryId]?.buildable ?? false
  // An archived current category stays selectable so editing does not silently move the product.
  const categoryChoices =
    initial && categoryMap[initial.categoryId]?.archived ? [...categories, categoryMap[initial.categoryId]] : categories

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setProcessing(true)
    setErrors((er) => ({ ...er, image: undefined }))
    try {
      setImage(await compressImage(file))
    } catch (err) {
      setErrors((er) => ({
        ...er,
        image: err instanceof ImageError ? err.message : 'No se pudo procesar la imagen. Prueba con otro archivo.',
      }))
    } finally {
      setProcessing(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Errors = {}
    const nameError = validateLength(name, 2, 60)
    if (nameError) next.name = nameError
    if (!categoryMap[categoryId]) next.categoryId = 'Elige una categoría.'
    const parsedPrice = parseMoneyInput(price)
    if (!parsedPrice.ok) next.price = parsedPrice.error
    const parsedCost = cost.trim() === '' ? null : parseMoneyInput(cost)
    if (parsedCost && !parsedCost.ok) next.cost = parsedCost.error
    const parsedStock = parseIntInRange(stock, 0, 99999)
    if (!parsedStock.ok) next.stock = parsedStock.error
    setErrors(next)
    if (Object.keys(next).length > 0 || !parsedPrice.ok || !parsedStock.ok) return

    const data: ProductInput = {
      name: name.trim(),
      description: description.trim(),
      categoryId,
      priceCents: parsedPrice.cents,
      stock: parsedStock.value,
      color,
    }
    if (parsedCost?.ok) data.costCents = parsedCost.cents
    if (image) data.image = image
    if (containerId) data.defaultContainerId = containerId
    onSubmit(data)
  }

  const err = (key: keyof Errors) =>
    errors[key] ? <span className="field__error" role="alert">{errors[key]}</span> : null

  return (
    <form className="panel-card form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label">Nombre <span className="field__req" aria-hidden="true">*</span></span>
        <input className="field__input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-invalid={errors.name ? true : undefined} />
        {err('name')}
      </label>

      <label className="field">
        <span className="field__label">Descripción</span>
        <textarea className="field__input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} />
      </label>

      <label className="field">
        <span className="field__label">Categoría <span className="field__req" aria-hidden="true">*</span></span>
        <select
          className="field__input"
          value={categoryId}
          onChange={(e) => {
            if (e.target.value === NEW_CATEGORY) setCreatingCategory(true)
            else setCategoryId(e.target.value)
          }}
          aria-invalid={errors.categoryId ? true : undefined}
        >
          <option value="">Elige una categoría…</option>
          {categoryChoices.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.buildable ? ' · se arma por bolas' : ''}{c.archived ? ' (archivada)' : ''}
            </option>
          ))}
          <option value={NEW_CATEGORY}>＋ Nueva categoría</option>
        </select>
        {err('categoryId')}
      </label>

      <div className="form__row">
        <MoneyField
          label={buildable ? 'Precio por bola' : 'Precio'}
          value={price}
          onChange={setPrice}
          error={errors.price}
          hint={buildable ? 'Cada bola del helado suma este precio.' : undefined}
          required
        />
        <MoneyField label="Costo (opcional)" value={cost} onChange={setCost} error={errors.cost} hint={buildable ? 'Costo por bola.' : 'Para calcular la ganancia.'} />
      </div>

      <div className="form__row">
        <label className="field">
          <span className="field__label">Stock <span className="field__req" aria-hidden="true">*</span></span>
          <input className="field__input" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} aria-invalid={errors.stock ? true : undefined} />
          <span className="field__hint">{buildable ? 'En bolas.' : 'En unidades.'}</span>
          {err('stock')}
        </label>
        <label className="field">
          <span className="field__label">Envase por defecto</span>
          <select className="field__input" value={containerId} onChange={(e) => setContainerId(e.target.value)}>
            <option value="">Sin envase por defecto</option>
            {envases.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({formatOptionPrice(o.priceCents)}){o.available ? '' : ' · oculto'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="field">
        <legend className="field__label">Imagen</legend>
        <div className="image-field">
          <div className="image-field__preview" style={{ '--flavor-color': color } as React.CSSProperties} aria-hidden="true">
            {image ? <img src={image} alt="" /> : <ScoopIcon size={36} />}
          </div>
          <div className="image-field__controls">
            <label className="btn btn--secondary btn--sm image-field__pick">
              {processing ? 'Procesando…' : image ? 'Cambiar imagen' : 'Elegir imagen'}
              <input type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={processing} />
            </label>
            {image && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setImage(undefined)}>
                Quitar imagen
              </button>
            )}
          </div>
        </div>
        <span className="field__hint">Opcional. Se reduce a 512 px. Sin imagen se muestra el color de respaldo.</span>
        {err('image')}
      </fieldset>

      <label className="field field--inline">
        <input type="color" className="color-input" value={color} onChange={(e) => setColor(e.target.value)} />
        <span>
          <span className="field__label">Color de respaldo</span>
          <span className="field__hint"> Fondo del círculo cuando no hay imagen.</span>
        </span>
      </label>

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={processing}>{submitLabel}</button>
      </div>

      {creatingCategory && (
        <CategoryDialog onClose={() => setCreatingCategory(false)} onSaved={(id) => setCategoryId(id)} />
      )}
    </form>
  )
}
