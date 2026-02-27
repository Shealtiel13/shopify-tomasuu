import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProductById, clearCurrentProduct } from '../store/productSlice'
import { placeOrder } from '../store/orderSlice'
import { showNotification } from '../store/notificationSlice'
import { logout } from '../store/authSlice'

const categoryColors = {
  Electronics: 'bg-blue-500/20 text-blue-400',
  Clothing: 'bg-pink-500/20 text-pink-400',
  Food: 'bg-green-500/20 text-green-400',
  Books: 'bg-yellow-500/20 text-yellow-400',
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [buyConfirm, setBuyConfirm] = useState(false)
  const [buyQty, setBuyQty] = useState(1)

  const { currentProduct: product, loading, error } = useSelector((state) => state.products)
  const notification = useSelector((state) => state.notification)

  useEffect(() => {
    dispatch(fetchProductById(id)).then((result) => {
      if (result.payload === 'unauthorized') {
        dispatch(logout())
        navigate('/login')
      }
    })
    return () => {
      dispatch(clearCurrentProduct())
    }
  }, [id, dispatch])

  const confirmBuy = async () => {
    if (!product) return
    const result = await dispatch(placeOrder({
      product_id: product.product_id,
      total_amount: Number(product.price) * buyQty,
    }))
    if (placeOrder.fulfilled.match(result)) {
      dispatch(showNotification('Order placed for ' + buyQty + 'x ' + product.product_name))
      setBuyConfirm(false)
      setBuyQty(1)
    } else {
      dispatch(showNotification(result.payload || 'Failed to place order', 'error'))
      setBuyConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600 dark:text-gray-400 text-lg">{error || 'Product not found'}</p>
        <button
          onClick={() => navigate('/dashboard?tab=products')}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer"
        >
          Back to Shop
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard?tab=products')}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1
            onClick={() => navigate('/dashboard')}
            className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer"
          >
            Nexus<span className="text-blue-500">Hub</span>
          </h1>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Notification */}
        {notification.message && (
          <div className={`px-4 py-3 rounded-lg mb-6 text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-green-500/20 border border-green-500 text-green-400'
              : 'bg-red-500/20 border border-red-500 text-red-400'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex items-center justify-center h-80 md:h-96">
            {product.image_url ? (
              <img src={product.image_url} alt={product.product_name} className="h-full w-full object-contain p-4" />
            ) : (
              <svg className="w-24 h-24 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.category && (
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 w-fit ${
                categoryColors[product.category] || 'bg-gray-600/30 text-gray-400'
              }`}>
                {product.category}
              </span>
            )}

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.product_name}</h2>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
              {product.description || 'No description available.'}
            </p>

            <div className="flex items-center justify-between mb-6">
              <span className="text-blue-400 text-3xl font-bold">
                ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-medium ${
                product.quantity > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {product.quantity > 0 ? product.quantity + ' in stock' : 'Out of stock'}
              </span>
            </div>

            <button
              onClick={() => { setBuyConfirm(true); setBuyQty(1) }}
              disabled={product.quantity <= 0}
              className={`w-full py-3 rounded-lg text-base font-semibold transition cursor-pointer ${
                product.quantity > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.quantity > 0 ? 'Buy Now' : 'Sold Out'}
            </button>
          </div>
        </div>
      </div>

      {/* Buy Confirmation Modal */}
      {buyConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>

            <h3 className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">Confirm Purchase</h3>

            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
              <p className="text-gray-900 dark:text-white text-sm font-medium">{product.product_name}</p>
              {product.category && (
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                  categoryColors[product.category] || 'bg-gray-600/30 text-gray-400'
                }`}>
                  {product.category}
                </span>
              )}
              <p className="text-blue-400 text-sm font-bold mt-2">
                ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
              </p>
            </div>

            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 text-sm mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBuyQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white flex items-center justify-center transition cursor-pointer text-lg font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={buyQty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    setBuyQty(Math.min(Math.max(1, val), product.quantity))
                  }}
                  className="flex-1 h-10 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-center text-sm font-medium focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setBuyQty(q => Math.min(product.quantity, q + 1))}
                  className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white flex items-center justify-center transition cursor-pointer text-lg font-bold"
                >
                  +
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">{product.quantity} available</p>
            </div>

            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 mb-5">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Total</span>
              <span className="text-blue-400 text-xl font-bold">
                ₱{(Number(product.price) * buyQty).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBuyConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmBuy}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
