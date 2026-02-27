import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role'),
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, username, role } = action.payload
      state.token = token
      state.username = username
      state.role = role
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      localStorage.setItem('role', role)
    },
    logout: (state) => {
      state.token = null
      state.username = null
      state.role = null
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('role')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
