import { createSelector, createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit'
import type { Product } from '@/types/models'
import { INITIAL_CATALOG } from '../seed'
import { removeOption } from './optionsSlice'
import {
  addDemoOrders,
  cancelOrder,
  chargeDraft,
  removeDemoOrders,
  saveEdit,
  saveToQueue,
} from './orderSlice'

type WithInventory = { inventory: Product[] }

function applyDelta(state: Product[], delta: Record<string, number>) {
  for (const [id, d] of Object.entries(delta)) {
    const product = state.find((p) => p.id === id)
    if (product) product.stock = Math.max(0, product.stock + d)
  }
}

function setStocks(state: Product[], stocks: Record<string, number>) {
  for (const product of state) {
    if (stocks[product.id] !== undefined) product.stock = stocks[product.id]
  }
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: INITIAL_CATALOG.products,
  reducers: {
    addProduct(state, action: PayloadAction<Product>) {
      state.push(action.payload)
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const index = state.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) state[index] = action.payload
    },
    archiveProduct(state, action: PayloadAction<string>) {
      const product = state.find((p) => p.id === action.payload)
      if (product) product.archived = true
    },
    /** Quick ± adjustment from the inventory list (RF-3.4). */
    adjustStock(state, action: PayloadAction<{ id: string; delta: number }>) {
      applyDelta(state, { [action.payload.id]: action.payload.delta })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(removeOption, (state, action) => {
        for (const p of state) if (p.defaultContainerId === action.payload) p.defaultContainerId = undefined
      })
      .addCase(addDemoOrders, (state, action) => setStocks(state, action.payload.demoStock))
      .addCase(removeDemoOrders, (state, action) => setStocks(state, action.payload.restoreStock))
      .addMatcher(isAnyOf(saveToQueue, chargeDraft, cancelOrder, saveEdit), (state, action) =>
        applyDelta(state, action.payload.stockDelta)
      )
  },
})

export const { addProduct, updateProduct, archiveProduct, adjustStock } = inventorySlice.actions

export const selectAllProducts = (state: WithInventory) => state.inventory

export const selectActiveProducts = createSelector([selectAllProducts], (products) =>
  products.filter((p) => !p.archived)
)

export const selectProductById = (state: WithInventory, id: string) =>
  state.inventory.find((p) => p.id === id)

export default inventorySlice.reducer
