import { Link, useNavigate } from 'react-router-dom'
import { InventoryForm, readImageFromForm } from '@/components/staff/InventoryForm'
import { useAppDispatch } from '@/store/hooks'
import { addItem } from '@/store/slices/inventorySlice'

export default function NewItemPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  async function action(formData: FormData) {
    const image = await readImageFromForm(formData)
    dispatch(addItem({
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      image_placeholder: (formData.get('imagePlaceholder') as string) || '#9ca3af',
      price: parseFloat(formData.get('price') as string) || 0,
      image,
      container: (formData.get('container') as string).trim() || undefined,
      inventory_count: parseInt(formData.get('inventoryCount') as string) || 0,
      archived: false,
      created_at: new Date().toISOString(),
    }))
    navigate('/staff/inventory')
  }

  return (
    <div className="max-w-lg">
      <Link to="/staff/inventory" className="text-sm mb-6 inline-block" style={{ color: 'var(--accent)' }}>
        ← Back to inventory
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-h)' }}>Add ice cream</h1>
      <InventoryForm action={action} />
    </div>
  )
}
