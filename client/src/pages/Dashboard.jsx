import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import { fetchProducts } from '../store/productSlice'
import { fetchMyOrders, placeOrder, cancelOrder, confirmOrder } from '../store/orderSlice'
import { addToCart, fetchCart } from '../store/cartSlice'
import { showNotification } from '../store/notificationSlice'
import { toggleDarkMode } from '../store/themeSlice'

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(null)
  const [bulkCancelConfirm, setBulkCancelConfirm] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [buyConfirm, setBuyConfirm] = useState(null)
  const [buyQty, setBuyQty] = useState(1)
  const [receiveConfirm, setReceiveConfirm] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { username, firstName } = useSelector((state) => state.auth)
  const { items: products } = useSelector((state) => state.products)
  const { items: orders } = useSelector((state) => state.orders)
  const { items: cartItems } = useSelector((state) => state.cart)
  const { darkMode } = useSelector((state) => state.theme)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  useEffect(() => {
    if (!activeTab || activeTab === 'products') dispatch(fetchProducts())
    if (activeTab === 'orders') dispatch(fetchMyOrders())
  }, [activeTab, dispatch])

  useEffect(() => {
    const params = {}
    if (activeTab) params.tab = activeTab
    if (selectedCategory) params.category = selectedCategory
    setSearchParams(params, { replace: true })
  }, [activeTab, selectedCategory])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setDropdownOpen(false)
  }

  const handleBuy = (product) => {
    setBuyConfirm(product)
    setBuyQty(1)
  }

  const confirmBuy = async () => {
    if (!buyConfirm) return
    const result = await dispatch(placeOrder({
      product_id: buyConfirm.product_id,
      total_amount: Number(buyConfirm.price) * buyQty,
    }))
    if (placeOrder.fulfilled.match(result)) {
      dispatch(showNotification('Solid choice! ' + buyQty + 'x ' + buyConfirm.product_name + ' added to your orders'))
      setBuyConfirm(null)
      setActiveTab('orders')
    } else {
      dispatch(showNotification(result.payload || 'Failed to place order', 'error'))
      setBuyConfirm(null)
    }
  }

  const handleDeleteOrder = (row) => {
    setCancelConfirm(row)
  }

  const confirmCancelOrder = async () => {
    if (!cancelConfirm) return
    const result = await dispatch(cancelOrder(cancelConfirm.order_id))
    if (cancelOrder.fulfilled.match(result)) {
      dispatch(showNotification('Order has been cancelled successfully'))
    } else {
      dispatch(showNotification('Failed to cancel order', 'error'))
    }
    setCancelConfirm(null)
  }

  const toggleOrderSelect = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    )
  }

  const toggleSelectAll = () => {
    setSelectedOrders(prev =>
      prev.length === pendingOrders.length ? [] : pendingOrders.map(o => o.order_id)
    )
  }

  const confirmBulkCancel = async () => {
    let cancelled = 0
    for (const orderId of selectedOrders) {
      const result = await dispatch(cancelOrder(orderId))
      if (cancelOrder.fulfilled.match(result)) cancelled++
    }
    dispatch(showNotification(cancelled + ' order(s) cancelled successfully'))
    setSelectedOrders([])
    setBulkCancelConfirm(false)
  }

  const handleConfirmReceived = async () => {
    if (!receiveConfirm) return
    const result = await dispatch(confirmOrder(receiveConfirm.order_id))
    if (confirmOrder.fulfilled.match(result)) {
      dispatch(showNotification('Order marked as completed'))
    } else {
      dispatch(showNotification(result.payload || 'Failed to confirm order', 'error'))
    }
    setReceiveConfirm(null)
  }

  const statusColors = {
    Pending: 'bg-yellow-500/15 text-yellow-400',
    Processing: 'bg-blue-500/15 text-blue-400',
    Shipped: 'bg-purple-500/15 text-purple-400',
    Delivered: 'bg-orange-500/15 text-orange-400',
    Completed: 'bg-green-500/15 text-green-400',
    Cancelled: 'bg-red-500/15 text-red-400',
  }

  const pendingOrders = orders.filter(o => o.status === 'Pending')

  const handleAddToCart = async (product) => {
    const result = await dispatch(addToCart({ product_id: product.product_id, quantity: 1 }))
    if (addToCart.fulfilled.match(result)) {
      dispatch(showNotification(product.product_name + ' added to cart'))
    } else {
      dispatch(showNotification(result.payload || 'Failed to add to cart', 'error'))
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const categoryColors = {
    GPU: 'bg-blue-500/15 text-blue-400',
    CPU: 'bg-blue-500/15 text-blue-400',
    RAM: 'bg-blue-500/15 text-blue-400',
    Storage: 'bg-blue-500/15 text-blue-400',
    Motherboard: 'bg-blue-500/15 text-blue-400',
    PSU: 'bg-blue-500/15 text-blue-400',
    Case: 'bg-blue-500/15 text-blue-400',
    Cooling: 'bg-blue-500/15 text-blue-400',
    Peripherals: 'bg-blue-500/15 text-blue-400',
    Monitor: 'bg-blue-500/15 text-blue-400',
    Keyboard: 'bg-blue-500/15 text-blue-400',
    Mouse: 'bg-blue-500/15 text-blue-400',
  }

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    setActiveTab('products')
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1
            onClick={() => setActiveTab(null)}
            className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer"
          >
            Nexus<span className="text-blue-500">Hub</span>
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/cart')}
              className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {(username || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="font-medium hidden sm:inline">{username || 'User'}</span>
                <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => handleTabChange('products')}
                    className={`w-full text-left px-4 py-3 text-sm transition cursor-pointer flex items-center gap-2 ${
                      activeTab === 'products' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Shop
                  </button>
                  <button
                    onClick={() => handleTabChange('orders')}
                    className={`w-full text-left px-4 py-3 text-sm transition cursor-pointer flex items-center gap-2 ${
                      activeTab === 'orders' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Orders
                  </button>
                  <button
                    onClick={() => handleTabChange('settings')}
                    className={`w-full text-left px-4 py-3 text-sm transition cursor-pointer flex items-center gap-2 ${
                      activeTab === 'settings' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Landing page */}
        {!activeTab && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-12">
              <div className="relative z-10 max-w-xl">
                <p className="text-blue-200 text-sm font-medium mb-2">Welcome back, {firstName || username || 'User'}</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Build Your Dream Rig</h2>
                <p className="text-blue-100 text-base sm:text-lg mb-6">Shop the latest GPUs, CPUs, motherboards and more — all at the best prices.</p>
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition cursor-pointer text-sm"
                >
                  Shop Now
                </button>
              </div>
              {/* Decorative SVG */}
              <svg className="absolute right-0 top-0 h-full w-1/2 text-white/5 hidden sm:block" viewBox="0 0 200 200" fill="currentColor">
                <rect x="60" y="20" width="80" height="80" rx="8" />
                <rect x="70" y="30" width="60" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                <circle cx="100" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                <rect x="40" y="110" width="120" height="10" rx="2" />
                <rect x="50" y="125" width="100" height="10" rx="2" />
                <rect x="45" y="140" width="30" height="30" rx="4" />
                <rect x="85" y="140" width="30" height="30" rx="4" />
                <rect x="125" y="140" width="30" height="30" rx="4" />
                <rect x="55" y="175" width="90" height="6" rx="2" />
              </svg>
            </div>

            {/* Category Pills */}
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-3">Browse Categories</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {Object.entries(categoryColors).map(([cat, colors]) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer hover:scale-105 ${colors}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Products */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg">Featured Products</h3>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-blue-500 hover:text-blue-400 text-sm font-medium transition cursor-pointer"
                >
                  View All
                </button>
              </div>
              {products.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center">
                  <p className="text-gray-500 text-sm">New products coming soon — check back later!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {products.slice(0, 4).map(product => (
                    <div key={product.product_id} onClick={() => navigate('/product/' + product.product_id)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-gray-400 dark:hover:border-gray-600 transition group cursor-pointer">
                      <div className="h-48 bg-gradient-to-br from-gray-200 dark:from-gray-700 to-gray-300 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.product_name} className="h-full w-full object-contain p-2" />
                        ) : (
                          <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 group-hover:text-gray-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                      </div>
                      <div className="p-4">
                        {product.category && (
                          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
                            categoryColors[product.category] || 'bg-gray-600/30 text-gray-400'
                          }`}>
                            {product.category}
                          </span>
                        )}
                        <h3 className="text-gray-900 dark:text-white font-semibold text-base mb-1 truncate">{product.product_name}</h3>
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2 h-10">
                          {product.description || 'No description available.'}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-blue-400 text-xl font-bold">₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className={`text-xs font-medium ${product.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {product.quantity > 0 ? product.quantity + ' in stock' : 'Out of stock'}
                          </span>
                        </div>
                        {product.quantity > 0 ? (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAddToCart(product) }}
                              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleBuy(product) }}
                              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Buy Now
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                          >
                            Sold Out
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('products')}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 rounded-xl p-5 flex items-center gap-4 transition group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/30 transition flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-gray-900 dark:text-white font-semibold text-base block">Shop Parts</span>
                  <span className="text-gray-500 text-sm">GPUs, CPUs, RAM & more</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 rounded-xl p-5 flex items-center gap-4 transition group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/30 transition flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-gray-900 dark:text-white font-semibold text-base block">My Orders</span>
                  <span className="text-gray-500 text-sm">Track your components</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Products - Shopify-style grid */}
        {activeTab === 'products' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setActiveTab(null)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shop</h2>
              {selectedCategory && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[selectedCategory] || 'bg-gray-600/30 text-gray-400'}`}>
                  {selectedCategory}
                </span>
              )}
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2 overflow-x-auto py-1 px-1 mb-6 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
                  !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {Object.entries(categoryColors).map(([cat, colors]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
                    selectedCategory === cat ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900 ' + colors : colors + ' hover:scale-105'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-500 text-lg">{selectedCategory ? 'No ' + selectedCategory + ' products found' : 'No components listed yet'}</p>
                <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">{selectedCategory ? 'Try a different category' : 'New stock is incoming — check back soon!'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProducts.map(product => (
                  <div key={product.product_id} onClick={() => navigate('/product/' + product.product_id)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-gray-400 dark:hover:border-gray-600 transition group cursor-pointer">
                    {/* Product image */}
                    <div className="h-48 bg-gradient-to-br from-gray-200 dark:from-gray-700 to-gray-300 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.product_name} className="h-full w-full object-contain p-2" />
                      ) : (
                        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 group-hover:text-gray-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>

                    <div className="p-4">
                      {/* Category badge */}
                      {product.category && (
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
                          categoryColors[product.category] || 'bg-gray-600/30 text-gray-400'
                        }`}>
                          {product.category}
                        </span>
                      )}

                      {/* Product name */}
                      <h3 className="text-gray-900 dark:text-white font-semibold text-base mb-1 truncate">{product.product_name}</h3>

                      {/* Description */}
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2 h-10">
                        {product.description || 'No description available.'}
                      </p>

                      {/* Price and stock */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-blue-400 text-xl font-bold">₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className={`text-xs font-medium ${
                          product.quantity > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {product.quantity > 0 ? product.quantity + ' in stock' : 'Out of stock'}
                        </span>
                      </div>

                      {/* Buy / Add to Cart buttons */}
                      {product.quantity > 0 ? (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product) }}
                            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleBuy(product) }}
                            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Buy Now
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* My Orders - card view */}
        {activeTab === 'orders' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab(null)}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Orders</h2>
                <span className="bg-blue-600/20 text-blue-400 text-xs font-medium px-2 py-0.5 rounded-full">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedOrders.length > 0 && (
                  <button
                    onClick={() => setBulkCancelConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer flex items-center gap-2 w-fit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Cancel Selected ({selectedOrders.length})
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer flex items-center gap-2 w-fit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Continue Shopping
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No orders yet</p>
                <p className="text-gray-400 dark:text-gray-600 text-sm mt-1 mb-6">Your next build starts here — grab some parts!</p>
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select all bar */}
                <div className="flex items-center gap-3 px-2">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === pendingOrders.length && pendingOrders.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {selectedOrders.length > 0 ? selectedOrders.length + ' selected' : 'Select all'}
                  </span>
                </div>

                {orders.map(order => {
                  const product = order.Product
                  const orderDate = order.order_date ? new Date(order.order_date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : 'N/A'

                  return (
                    <div key={order.order_id} className={`bg-white dark:bg-gray-800 border rounded-xl p-5 transition ${
                      selectedOrders.includes(order.order_id) ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        {/* Left: checkbox + product info */}
                        <div className="flex gap-4">
                          {order.status === 'Pending' ? (
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.order_id)}
                              onChange={() => toggleOrderSelect(order.order_id)}
                              className="w-4 h-4 mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-4 h-4 mt-1 flex-shrink-0" />
                          )}
                          {/* Product image */}
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-200 dark:from-gray-700 to-gray-300 dark:to-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product && product.image_url ? (
                              <img src={product.image_url} alt={product.product_name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            )}
                          </div>

                          <div>
                            <h3 className="text-gray-900 dark:text-white font-semibold text-base">
                              {product ? product.product_name : 'Product #' + order.product_id}
                            </h3>
                            {product && product.category && (
                              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                                categoryColors[product.category] || 'bg-gray-600/30 text-gray-400'
                              }`}>
                                {product.category}
                              </span>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {orderDate}
                              </span>
                              <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>
                              <span className="break-all">{order.order_number || 'Order #' + order.order_id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: price, status, and actions */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                          <span className="text-blue-400 text-xl font-bold">
                            ₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-500/15 text-gray-400'}`}>
                            {order.status || 'Pending'}
                          </span>
                          {order.status === 'Pending' && (
                            <button
                              onClick={() => handleDeleteOrder(order)}
                              className="text-red-400 hover:text-red-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel Order
                            </button>
                          )}
                          {order.status === 'Delivered' && (
                            <button
                              onClick={() => setReceiveConfirm(order)}
                              className="text-green-400 hover:text-green-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Order Received
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveTab(null)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 max-w-lg">
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-4">Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Dark Mode</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Toggle between light and dark theme</p>
                </div>
                <button
                  onClick={() => dispatch(toggleDarkMode())}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                    darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Buy Confirmation Modal */}
      {buyConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">Confirm Purchase</h3>

            {/* Product details */}
            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
              <p className="text-gray-900 dark:text-white text-sm font-medium">{buyConfirm.product_name}</p>
              {buyConfirm.category && (
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                  categoryColors[buyConfirm.category] || 'bg-gray-600/30 text-gray-400'
                }`}>
                  {buyConfirm.category}
                </span>
              )}
              <p className="text-blue-400 text-sm font-bold mt-2">
                ₱{Number(buyConfirm.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
              </p>
            </div>

            {/* Quantity selector */}
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
                  max={buyConfirm.quantity}
                  value={buyQty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    setBuyQty(Math.min(Math.max(1, val), buyConfirm.quantity))
                  }}
                  className="flex-1 h-10 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-center text-sm font-medium focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setBuyQty(q => Math.min(buyConfirm.quantity, q + 1))}
                  className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white flex items-center justify-center transition cursor-pointer text-lg font-bold"
                >
                  +
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">{buyConfirm.quantity} available</p>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 mb-5">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Total</span>
              <span className="text-blue-400 text-xl font-bold">
                ₱{(Number(buyConfirm.price) * buyQty).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setBuyConfirm(null)}
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

      {/* Cancel Order Confirmation Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">Cancel Order</h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-2">
              Are you sure you want to cancel this order?
            </p>

            {/* Order details */}
            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 mb-5">
              <p className="text-gray-900 dark:text-white text-sm font-medium">
                {cancelConfirm.Product ? cancelConfirm.Product.product_name : 'Order #' + cancelConfirm.order_id}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                ₱{Number(cancelConfirm.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Cancel Confirmation Modal */}
      {bulkCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">Cancel {selectedOrders.length} Order{selectedOrders.length > 1 ? 's' : ''}</h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-5">
              Are you sure you want to cancel {selectedOrders.length} selected order{selectedOrders.length > 1 ? 's' : ''}? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setBulkCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer"
              >
                Keep Orders
              </button>
              <button
                onClick={confirmBulkCancel}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
              >
                Yes, Cancel All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Received Modal */}
      {receiveConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">Confirm Receipt</h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-2">
              Have you received this order?
            </p>

            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 mb-5">
              <p className="text-gray-900 dark:text-white text-sm font-medium">
                {receiveConfirm.Product ? receiveConfirm.Product.product_name : 'Order #' + receiveConfirm.order_id}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                ₱{Number(receiveConfirm.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setReceiveConfirm(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer"
              >
                Not Yet
              </button>
              <button
                onClick={handleConfirmReceived}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition cursor-pointer"
              >
                Yes, Received
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
