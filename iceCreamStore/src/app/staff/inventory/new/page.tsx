import Link from 'next/link'
import { redirect } from 'next/navigation'
import { addIceCream } from '../actions'
import { InventoryForm } from '@/components/staff/InventoryForm'

async function action(formData: FormData) {
  'use server'
  await addIceCream(formData)
  redirect('/staff/inventory')
}

export default function NewItemPage() {
  return (
    <div className="max-w-lg">
      <Link href="/staff/inventory" className="text-sm mb-6 inline-block" style={{ color: 'var(--accent)' }}>
        ← Back to inventory
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-h)' }}>Add ice cream</h1>
      <InventoryForm action={action} />
    </div>
  )
}
