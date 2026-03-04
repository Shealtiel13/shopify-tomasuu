import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import productReducer from './productSlice'
import orderReducer from './orderSlice'
import notificationReducer from './notificationSlice'
import themeReducer from './themeSlice'
import cartReducer from './cartSlice'
import profileReducer from './profileSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    orders: orderReducer,
    notification: notificationReducer,
    theme: themeReducer,
    cart: cartReducer,
    profile: profileReducer,
  },
})

export default store
