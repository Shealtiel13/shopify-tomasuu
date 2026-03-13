import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const api = (path, opts = {}) => {
  const token = localStorage.getItem('token')
  return fetch(`/api/profile${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  }).then(async (r) => {
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Request failed')
    return data
  })
}

export const fetchProfile = createAsyncThunk('profile/fetch', () => api(''))

export const updateProfile = createAsyncThunk('profile/update', (data) =>
  api('', { method: 'PATCH', body: JSON.stringify(data) })
)

export const updateAddress = createAsyncThunk('profile/updateAddress', (data) =>
  api('/address', { method: 'PATCH', body: JSON.stringify(data) })
)

export const changePassword = createAsyncThunk('profile/changePassword', (data) =>
  api('/password', { method: 'PATCH', body: JSON.stringify(data) })
)

const profileSlice = createSlice({
  name: 'profile',
  initialState: { data: null, loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.loading = false; state.data = action.payload })
      .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.error.message })
  },
})

export default profileSlice.reducer
