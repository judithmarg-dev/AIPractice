import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { updateIceCream } from '../../actions'
import { InventoryForm } from '@/components/staff/InventoryForm'

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: item } = await supabase.from('ice_creams').select('*').eq('id', id).single()

  if (!item) notFound()

  async function action(formData: FormData) {
    'use server'
    await updateIceCream(id, formData)
    redirect('/staff/inventory')
  }

  return (
    <div className="max-w-lg">
      <Link href="/staff/inventory" className="text-sm mb-6 inline-block" style={{ color: 'var(--accent)' }}>
        ← Back to inventory
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-h)' }}>Edit: {item.name}</h1>
      <InventoryForm
        action={action}
        defaultValues={{
          name:             item.name,
          description:      item.description,
          category:         item.category,
          imagePlaceholder: item.image_placeholder,
          inventoryCount:   item.inventory_count,
        }}
      />
    </div>
  )
}
