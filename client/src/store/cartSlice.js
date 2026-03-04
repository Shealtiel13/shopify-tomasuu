import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    const res = await fetch('/api/cart', {
      headers: { Authorization: 'Bearer ' + token }
    })
    if (!res.ok) return rejectWithValue('Failed to fetch cart')
    return await res.json()
  }
)

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ product_id, quantity = 1 }, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    const res = await fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ product_id, quantity })
    })
    if (!res.ok) {
      const err = await res.json()
      return rejectWithValue(err.error || 'Failed to add to cart')
    }
    return await res.json()
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ cart_item_id, quantity }, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    const res = await fetch('/api/cart/items/' + cart_item_id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ quantity })
    })
    if (!res.ok) {
      const err = await res.json()
      return rejectWithValue(err.error || 'Failed to update item')
    }
    return await res.json()
  }
)

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (cart_item_id, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    const res = await fetch('/api/cart/items/' + cart_item_id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    })
    if (!res.ok) return rejectWithValue('Failed to remove item')
    return cart_item_id
  }
)

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    const res = await fetch('/api/cart/clear', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    })
    if (!res.ok) return rejectWithValue('Failed to clear cart')
    return true
  }
)

export const checkoutCart = createAsyncThunk(
  'cart/checkout',
  async (cart_item_ids, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    const body = cart_item_ids && cart_item_ids.length > 0 ? { cart_item_ids } : {}
    const res = await fetch('/api/cart/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json()
      return rejectWithValue(err.error || 'Checkout failed')
    }
    const data = await res.json()
    data._checkedOutIds = cart_item_ids || null
    return data
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i.cart_item_id === action.payload.cart_item_id)
        if (idx >= 0) state.items[idx] = action.payload
        else state.items.push(action.payload)
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (action.payload.message === 'Item removed') {
          state.items = state.items.filter(i => i.cart_item_id !== action.meta.arg.cart_item_id)
        } else {
          const idx = state.items.findIndex(i => i.cart_item_id === action.payload.cart_item_id)
          if (idx >= 0) state.items[idx] = action.payload
        }
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.cart_item_id !== action.payload)
      })
      .addCase(clearCart.fulfilled, (state) => { state.items = [] })
      .addCase(checkoutCart.fulfilled, (state, action) => {
        const ids = action.payload._checkedOutIds
        if (ids && ids.length > 0) {
          state.items = state.items.filter(i => !ids.includes(i.cart_item_id))
        } else {
          state.items = []
        }
      })
  },
})

export default cartSlice.reducer
