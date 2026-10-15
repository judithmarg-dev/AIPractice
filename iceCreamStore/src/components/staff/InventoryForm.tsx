import { useState } from 'react'
import { CATEGORIES } from '@/types/flavor'

type DefaultValues = {
  name?: string
  description?: string
  category?: string
  imagePlaceholder?: string
  image?: string
  price?: number
  container?: string
  inventoryCount?: number
}

const inputClass = 'rounded-lg border px-3 py-2 text-sm'
const inputStyle = { borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }

export function InventoryForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<void>
  defaultValues?: DefaultValues
}) {
  const [preview, setPreview] = useState<string | undefined>(defaultValues?.image)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      setPreview(defaultValues?.image)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField id="name" label="Name" required defaultValue={defaultValues?.name} />
      <FormField id="description" label="Description" defaultValue={defaultValues?.description} />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="price"
          label="Price (USD)"
          type="number"
          required
          step="0.01"
          min="0"
          placeholder="2.60"
          defaultValue={defaultValues?.price !== undefined ? String(defaultValues.price) : ''}
          hint="For artesanal items this is the price per scoop."
        />
        <FormField
          id="inventoryCount"
          label="Stock count"
          type="number"
          required
          min="0"
          defaultValue={String(defaultValues?.inventoryCount ?? '')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
          Category <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={defaultValues?.category ?? ''}
          className={inputClass}
          style={inputStyle}
        >
          <option value="">Select…</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <FormField
        id="container"
        label="Envase de presentación"
        placeholder="Barquillo Dulce, Vaso Compostable 500ml…"
        defaultValue={defaultValues?.container}
        hint="Optional. Shown under the item name in the menu and the order."
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="image" className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
          Image
        </label>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full shrink-0 overflow-hidden border"
            style={{ borderColor: 'var(--border)', background: defaultValues?.imagePlaceholder ?? 'var(--surface-2)' }}
            aria-hidden="true"
          >
            {preview && <img src={preview} alt="" className="w-full h-full object-cover" />}
          </div>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm"
            style={{ color: 'var(--text)' }}
          />
        </div>
        {defaultValues?.image && <input type="hidden" name="existingImage" value={defaultValues.image} />}
        <p className="text-xs" style={{ color: 'var(--text)' }}>
          Optional. When no image is set the colour below is used as the swatch.
        </p>
      </div>

      <FormField
        id="imagePlaceholder"
        label="Colour hex"
        placeholder="#f472b6"
        defaultValue={defaultValues?.imagePlaceholder}
      />

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl font-semibold text-white text-sm mt-2"
        style={{ background: 'var(--accent)' }}
      >
        Save item
      </button>
    </form>
  )
}

/** Reads the uploaded file (if any) as a data URL; falls back to the existing image. */
export async function readImageFromForm(formData: FormData): Promise<string | undefined> {
  const file = formData.get('image')
  const existing = (formData.get('existingImage') as string) || undefined
  if (!(file instanceof File) || file.size === 0) return existing
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function FormField({
  id, label, type = 'text', required, placeholder, defaultValue, hint, step, min,
}: {
  id: string; label: string; type?: string; required?: boolean
  placeholder?: string; defaultValue?: string; hint?: string; step?: string; min?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        step={step}
        min={min}
        className={inputClass}
        style={inputStyle}
      />
      {hint && <p className="text-xs" style={{ color: 'var(--text)' }}>{hint}</p>}
    </div>
  )
}
