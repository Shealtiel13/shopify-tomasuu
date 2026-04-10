import { createSlice } from '@reduxjs/toolkit'

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: {
    token: localStorage.getItem('adminToken'),
    username: localStorage.getItem('adminUsername'),
    role: localStorage.getItem('adminRole'),
  },
  reducers: {
    setAdminCredentials: (state, action) => {
      const { token, username, role } = action.payload
      state.token = token
      state.username = username
      state.role = role
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUsername', username)
      localStorage.setItem('adminRole', role)
    },
    adminLogout: (state) => {
      state.token = null
      state.username = null
      state.role = null
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUsername')
      localStorage.removeItem('adminRole')
    },
  },
})

export const { setAdminCredentials, adminLogout } = adminAuthSlice.actions
export default adminAuthSlice.reducer
