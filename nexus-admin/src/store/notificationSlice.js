import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    message: null,
    type: null,
  },
  reducers: {
    notify: (state, action) => {
      state.message = action.payload.message
      state.type = action.payload.type || 'success'
    },
    clearNotification: (state) => {
      state.message = null
      state.type = null
    },
  },
})

export const { notify, clearNotification } = notificationSlice.actions

export const showNotification = (message, type = 'success') => (dispatch) => {
  dispatch(notify({ message, type }))
  setTimeout(() => dispatch(clearNotification()), 3000)
}

export default notificationSlice.reducer
