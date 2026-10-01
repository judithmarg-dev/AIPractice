'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabaseServer'

export async function addIceCream(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('ice_creams').insert([{
    name:              formData.get('name') as string,
    description:       formData.get('description') as string,
    category:          formData.get('category') as string,
    image_placeholder: formData.get('imagePlaceholder') as string || '#9ca3af',
    inventory_count:   parseInt(formData.get('inventoryCount') as string) || 0,
  }])
  revalidatePath('/staff/inventory')
}

export async function updateIceCream(id: string, formData: FormData) {
  const supabase = await createClient()
  await supabase.from('ice_creams').update({
    name:              formData.get('name') as string,
    description:       formData.get('description') as string,
    category:          formData.get('category') as string,
    image_placeholder: formData.get('imagePlaceholder') as string || '#9ca3af',
    inventory_count:   parseInt(formData.get('inventoryCount') as string) || 0,
  }).eq('id', id)
  revalidatePath('/staff/inventory')
}

export async function archiveIceCream(id: string) {
  const supabase = await createClient()
  await supabase.from('ice_creams').update({ archived: true }).eq('id', id)
  revalidatePath('/staff/inventory')
}
