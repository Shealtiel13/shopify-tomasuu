import { configureStore } from '@reduxjs/toolkit'
import adminAuthReducer from './adminAuthSlice'
import notificationReducer from './notificationSlice'
import themeReducer from './themeSlice'

const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    notification: notificationReducer,
    theme: themeReducer,
  },
})

export default store
