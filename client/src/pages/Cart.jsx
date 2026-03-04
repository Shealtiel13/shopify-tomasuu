import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCart, updateCartItem, removeCartItem, clearCart, checkoutCart } from '../store/cartSlice'
import { showNotification } from '../store/notificationSlice'

export default function Cart() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, loading } = useSelector((state) => state.cart)
  const [checkingOut, setCheckingOut] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  // Clean up selections when items change (e.g. after removal)
  useEffect(() => {
    setSelectedItems(prev => prev.filter(id => items.some(i => i.cart_item_id === id)))
  }, [items])

  const total = items.reduce((sum, item) => sum + Number(item.price_at_add) * item.quantity, 0)

  const selectedTotal = items
    .filter(i => selectedItems.includes(i.cart_item_id))
    .reduce((sum, item) => sum + Number(item.price_at_add) * item.quantity, 0)

  const toggleSelect = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    setSelectedItems(prev => prev.length === items.length ? [] : items.map(i => i.cart_item_id))
  }

  const confirmBulkDelete = async () => {
    for (const id of selectedItems) {
      await dispatch(removeCartItem(id))
    }
    dispatch(showNotification(selectedItems.length + ' item(s) removed from cart'))
    setSelectedItems([])
    setBulkDeleteConfirm(false)
  }

  const handleQuantity = (item, delta) => {
    const newQty = item.quantity + delta
    if (newQty <= 0) {
      dispatch(removeCartItem(item.cart_item_id))
    } else {
      dispatch(updateCartItem({ cart_item_id: item.cart_item_id, quantity: newQty }))
    }
  }

  const handleBulkDelete = async () => {
    for (const id of selectedItems) {
      await dispatch(removeCartItem(id))
    }
    dispatch(showNotification(selectedItems.length + ' item(s) removed from cart'))
    setSelectedItems([])
    setBulkDeleteConfirm(false)
  }

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      dispatch(showNotification('Please select items to checkout', 'error'))
      return
    }
    setCheckingOut(true)
    const result = await dispatch(checkoutCart(selectedItems))
    if (checkoutCart.fulfilled.match(result)) {
      dispatch(showNotification('Checkout successful! ' + result.payload.orders.length + ' order(s) placed.'))
      setSelectedItems([])
    } else {
      dispatch(showNotification(result.payload || 'Checkout failed', 'error'))
    }
    setCheckingOut(false)
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 onClick={() => navigate('/dashboard')} className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer">
            Nexus<span className="text-blue-500">Hub</span>
          </h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shopping Cart</h2>
            <span className="bg-blue-600/20 text-blue-400 text-xs font-medium px-2 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          {selectedItems.length > 0 && (
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer flex items-center gap-2 w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove Selected ({selectedItems.length})
            </button>
          )}
        </div>

        {loading && items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Your cart is empty</p>
            <p className="text-gray-400 dark:text-gray-600 text-sm mt-1 mb-6">Add some components to get started!</p>
            <button onClick={() => navigate('/dashboard?tab=products')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select all bar */}
            <div className="flex items-center gap-3 px-2">
              <input
                type="checkbox"
                checked={selectedItems.length === items.length && items.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {selectedItems.length > 0 ? selectedItems.length + ' selected' : 'Select all'}
              </span>
            </div>

            {items.map(item => {
              const product = item.Product
              return (
                <div key={item.cart_item_id} className={`bg-white dark:bg-gray-800 border rounded-xl p-5 transition ${
                  selectedItems.includes(item.cart_item_id) ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.cart_item_id)}
                      onChange={() => toggleSelect(item.cart_item_id)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 flex-shrink-0"
                    />
                    {/* Product image */}
                    <div
                      onClick={() => product && navigate('/product/' + product.product_id)}
                      className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-200 dark:from-gray-700 to-gray-300 dark:to-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
                    >
                      {product && product.image_url ? (
                        <img src={product.image_url} alt={product.product_name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 dark:text-white font-semibold text-base truncate">
                        {product ? product.product_name : 'Product #' + item.product_id}
                      </h3>
                      <p className="text-blue-400 text-sm font-bold">
                        ₱{Number(item.price_at_add).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantity(item, -1)}
                        className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white flex items-center justify-center transition cursor-pointer text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-gray-900 dark:text-white text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(item, 1)}
                        className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white flex items-center justify-center transition cursor-pointer text-sm font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal + remove */}
                    <div className="flex items-center gap-4">
                      <span className="text-blue-400 text-lg font-bold w-28 text-right">
                        ₱{(Number(item.price_at_add) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => dispatch(removeCartItem(item.cart_item_id))}
                        className="text-red-400 hover:text-red-300 transition cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Cart footer */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {selectedItems.length > 0
                    ? 'Selected (' + selectedItems.length + ' of ' + items.length + ' items)'
                    : 'Total (' + items.length + ' ' + (items.length === 1 ? 'item' : 'items') + ')'
                  }
                </span>
                <span className="text-blue-400 text-2xl font-bold">
                  ₱{(selectedItems.length > 0 ? selectedTotal : total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/dashboard?tab=products')}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer disabled:opacity-50"
                >
                  {checkingOut ? 'Processing...' : selectedItems.length === items.length ? 'Checkout All' : selectedItems.length > 0 ? 'Checkout (' + selectedItems.length + ')' : 'Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">Remove {selectedItems.length} Item{selectedItems.length > 1 ? 's' : ''}</h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-5">
              Are you sure you want to remove {selectedItems.length} selected item{selectedItems.length > 1 ? 's' : ''} from your cart?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer"
              >
                Keep Items
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
