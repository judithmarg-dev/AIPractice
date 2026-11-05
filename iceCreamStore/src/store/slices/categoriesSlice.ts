import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Category } from '@/types/models'
import { INITIAL_CATALOG } from '../seed'

type WithCategories = { categories: Category[] }

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: INITIAL_CATALOG.categories,
  reducers: {
    addCategory(state, action: PayloadAction<Omit<Category, 'order' | 'archived'>>) {
      const order = state.reduce((max, c) => Math.max(max, c.order), -1) + 1
      state.push({ ...action.payload, order, archived: false })
    },
    updateCategory(state, action: PayloadAction<Pick<Category, 'id' | 'name' | 'icon' | 'buildable'>>) {
      const category = state.find((c) => c.id === action.payload.id)
      if (!category) return
      category.name = action.payload.name
      category.icon = action.payload.icon
      // The protected category is always buildable.
      if (!category.protected) category.buildable = action.payload.buildable
    },
    /** Swaps the category with its neighbour among the active ones. */
    moveCategory(state, action: PayloadAction<{ id: string; direction: -1 | 1 }>) {
      const active = state.filter((c) => !c.archived).sort((a, b) => a.order - b.order)
      const index = active.findIndex((c) => c.id === action.payload.id)
      const other = active[index + action.payload.direction]
      if (index === -1 || !other) return
      const current = active[index]
      const order = current.order
      current.order = other.order
      other.order = order
    },
    /** Callers must check there are no active products first (RF-1.4). */
    archiveCategory(state, action: PayloadAction<string>) {
      const category = state.find((c) => c.id === action.payload)
      if (category && !category.protected) category.archived = true
    },
    restoreCategory(state, action: PayloadAction<string>) {
      const category = state.find((c) => c.id === action.payload)
      if (!category) return
      category.archived = false
      category.order = state.reduce((max, c) => Math.max(max, c.order), -1) + 1
    },
  },
})

export const { addCategory, updateCategory, moveCategory, archiveCategory, restoreCategory } =
  categoriesSlice.actions

export const selectAllCategories = (state: WithCategories) => state.categories

export const selectActiveCategories = createSelector([selectAllCategories], (categories) =>
  categories.filter((c) => !c.archived).sort((a, b) => a.order - b.order)
)

export const selectCategoryMap = createSelector([selectAllCategories], (categories) =>
  Object.fromEntries(categories.map((c) => [c.id, c])) as Record<string, Category>
)

export const selectCategoryById = (state: WithCategories, id: string) =>
  state.categories.find((c) => c.id === id)

export default categoriesSlice.reducer
