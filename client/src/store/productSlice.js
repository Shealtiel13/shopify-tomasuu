import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    const res = await fetch('/api/products', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    })
    if (res.status === 401 || res.status === 403) {
      return rejectWithValue('unauthorized')
    }
    const data = await res.json()
    return Array.isArray(data) ? data : []
  }
)

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    const res = await fetch('/api/products/' + id, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    })
    if (res.status === 401 || res.status === 403) {
      return rejectWithValue('unauthorized')
    }
    if (!res.ok) {
      return rejectWithValue('Product not found')
    }
    return await res.json()
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load products'
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load product'
      })
  },
})

export const { clearCurrentProduct } = productSlice.actions
export default productSlice.reducer
