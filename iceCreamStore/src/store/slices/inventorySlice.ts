import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IceCream } from '@/types/iceCream'
import type { Flavor } from '@/types/flavor'
import flavorsData from '@/data/flavors.json'

const flavors = flavorsData as Flavor[]

const initialState: IceCream[] = flavors.map((f) => ({
  id: f.id,
  name: f.name,
  description: f.description,
  category: f.category,
  image_placeholder: f.imagePlaceholder,
  price: f.price,
  image: f.image,
  container: f.container,
  inventory_count: 10,
  archived: false,
  created_at: new Date().toISOString(),
}))

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<IceCream>) {
      state.push(action.payload)
    },
    updateItem(state, action: PayloadAction<IceCream>) {
      const index = state.findIndex((item) => item.id === action.payload.id)
      if (index !== -1) state[index] = action.payload
    },
    archiveItem(state, action: PayloadAction<string>) {
      const item = state.find((i) => i.id === action.payload)
      if (item) item.archived = true
    },
  },
})

export const { addItem, updateItem, archiveItem } = inventorySlice.actions

export const selectActiveItems = (state: { inventory: IceCream[] }) =>
  state.inventory.filter((i) => !i.archived)

export const selectItemById = (state: { inventory: IceCream[] }, id: string) =>
  state.inventory.find((i) => i.id === id)

export default inventorySlice.reducer
