import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role'),
    firstName: localStorage.getItem('firstName'),
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, username, role, firstName } = action.payload
      state.token = token
      state.username = username
      state.role = role
      state.firstName = firstName
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      localStorage.setItem('role', role)
      if (firstName) localStorage.setItem('firstName', firstName)
    },
    logout: (state) => {
      state.token = null
      state.username = null
      state.role = null
      state.firstName = null
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('role')
      localStorage.removeItem('firstName')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
