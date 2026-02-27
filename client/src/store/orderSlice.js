import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMy',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    const res = await fetch('/api/orders/my', {
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

export const placeOrder = createAsyncThunk(
  'orders/place',
  async ({ product_id, total_amount }, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({
        product_id,
        order_date: new Date().toISOString().split('T')[0],
        total_amount,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      return rejectWithValue(err.error || 'Failed to place order')
    }
    return await res.json()
  }
)

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (orderId, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    const res = await fetch('/api/orders/' + orderId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    })
    if (!res.ok) {
      return rejectWithValue('Failed to cancel order')
    }
    return orderId
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load orders'
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.items = state.items.filter(o => o.order_id !== action.payload)
      })
  },
})

export default orderSlice.reducer
