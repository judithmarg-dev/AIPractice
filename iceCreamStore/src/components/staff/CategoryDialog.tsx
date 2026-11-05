import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { IconPicker } from '@/components/ui/IconPicker'
import { Switch } from '@/components/ui/Switch'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addCategory, selectAllCategories, updateCategory } from '@/store/slices/categoriesSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { slugId, validateCategoryName } from '@/lib/validation'
import { T } from '@/lib/texts'
import type { Category, IconId } from '@/types/models'

interface CategoryDialogProps {
  /** Category to edit; creates a new one when absent. */
  category?: Category
  onClose: () => void
  onSaved?: (id: string) => void
}

/** Short form for creating or editing a category (RF-1.2, RF-1.3, RF-1.4). */
export function CategoryDialog({ category, onClose, onSaved }: CategoryDialogProps) {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectAllCategories)
  const [name, setName] = useState(category?.name ?? '')
  const [icon, setIcon] = useState<IconId>(category?.icon ?? 'grid')
  const [buildable, setBuildable] = useState(category?.buildable ?? false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // The dialog is portaled, but React still bubbles submit to a form that renders it.
    e.stopPropagation()
    const problem = validateCategoryName(name, categories, category?.id)
    if (problem) return setError(problem)
    const id = category?.id ?? slugId(name)
    if (category) dispatch(updateCategory({ id, name: name.trim(), icon, buildable }))
    else dispatch(addCategory({ id, name: name.trim(), icon, buildable }))
    dispatch(pushToast({ message: category ? `Categoría "${name.trim()}" actualizada` : `Categoría "${name.trim()}" creada` }))
    onSaved?.(id)
    onClose()
  }

  const formId = 'category-form'
  return (
    <Dialog
      title={category ? 'Editar categoría' : 'Nueva categoría'}
      onClose={onClose}
      footer={
        <div className="dialog__actions">
          <button type="submit" form={formId} className="btn btn--primary">
            {category ? T.saveChanges : 'Crear categoría'}
          </button>
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
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            maxLength={40}
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'category-name-error' : undefined}
            data-autofocus
          />
          {error && <span id="category-name-error" className="field__error" role="alert">{error}</span>}
        </label>
        <IconPicker value={icon} onChange={setIcon} />
        <Switch
          checked={buildable}
          onChange={setBuildable}
          label="Se arma por bolas"
          description={
            category?.protected
              ? 'Artesanales siempre se arma por bolas.'
              : 'Al tocar sus productos en el menú se abre el armado con bolas, envase, extras y toppings.'
          }
          disabled={category?.protected}
        />
      </form>
    </Dialog>
  )
}
