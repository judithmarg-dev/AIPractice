import { Link, useNavigate, useParams } from 'react-router-dom'
import { InventoryForm, readImageFromForm } from '@/components/staff/InventoryForm'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateItem, selectItemById } from '@/store/slices/inventorySlice'

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const item = useAppSelector((state) => selectItemById(state, id!))

  if (!item) {
    return (
      <div className="max-w-lg">
        <Link to="/staff/inventory" className="text-sm mb-6 inline-block" style={{ color: 'var(--accent)' }}>
          ← Back to inventory
        </Link>
        <p className="text-sm" style={{ color: 'var(--text)' }}>Item not found.</p>
      </div>
    )
  }

  async function action(formData: FormData) {
    const image = await readImageFromForm(formData)
    dispatch(updateItem({
      ...item!,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      image_placeholder: (formData.get('imagePlaceholder') as string) || '#9ca3af',
      price: parseFloat(formData.get('price') as string) || 0,
      image,
      container: (formData.get('container') as string).trim() || undefined,
      inventory_count: parseInt(formData.get('inventoryCount') as string) || 0,
    }))
    navigate('/staff/inventory')
  }

  return (
    <div className="max-w-lg">
      <Link to="/staff/inventory" className="text-sm mb-6 inline-block" style={{ color: 'var(--accent)' }}>
        ← Back to inventory
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-h)' }}>Edit: {item.name}</h1>
      <InventoryForm
        action={action}
        defaultValues={{
          name: item.name,
          description: item.description,
          category: item.category,
          imagePlaceholder: item.image_placeholder,
          image: item.image,
          price: item.price,
          container: item.container,
          inventoryCount: item.inventory_count,
        }}
      />
    </div>
  )
}
