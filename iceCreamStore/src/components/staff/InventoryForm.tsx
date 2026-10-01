type DefaultValues = {
  name?: string
  description?: string
  category?: string
  imagePlaceholder?: string
  inventoryCount?: number
}

export function InventoryForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<void>
  defaultValues?: DefaultValues
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField id="name" label="Name" required defaultValue={defaultValues?.name} />
      <FormField id="description" label="Description" defaultValue={defaultValues?.description} />
      <FormField id="imagePlaceholder" label="Colour hex" placeholder="#f472b6" defaultValue={defaultValues?.imagePlaceholder} />
      <FormField id="inventoryCount" label="Stock count" type="number" required defaultValue={String(defaultValues?.inventoryCount ?? '')} />

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
          Category <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={defaultValues?.category ?? ''}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        >
          <option value="">Select…</option>
          <option value="fruit">Fruit</option>
          <option value="chocolate">Chocolate</option>
          <option value="classic">Classic</option>
        </select>
      </div>

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

function FormField({
  id, label, type = 'text', required, placeholder, defaultValue,
}: {
  id: string; label: string; type?: string; required?: boolean
  placeholder?: string; defaultValue?: string
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
        className="rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
      />
    </div>
  )
}
