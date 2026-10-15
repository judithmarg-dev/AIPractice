import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import inventoryReducer from './slices/inventorySlice'
import bookingsReducer from './slices/bookingsSlice'
import orderReducer from './slices/orderSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inventory: inventoryReducer,
    bookings: bookingsReducer,
    order: orderReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
