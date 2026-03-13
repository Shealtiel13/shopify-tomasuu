import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import { fetchProducts } from '../store/productSlice'
import { fetchMyOrders, placeOrder, cancelOrder } from '../store/orderSlice'
import { showNotification } from '../store/notificationSlice'
import { toggleDarkMode } from '../store/themeSlice'
import { fetchProfile, updateProfile, updateAddress, changePassword } from '../store/profileSlice'

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(null)
  const [buyConfirm, setBuyConfirm] = useState(null)
  const [buyQty, setBuyQty] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null)
  const [visibleProducts, setVisibleProducts] = useState(8)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { username, firstName } = useSelector((state) => state.auth)
  const { items: products } = useSelector((state) => state.products)
  const { items: orders } = useSelector((state) => state.orders)
  const notification = useSelector((state) => state.notification)
  const { darkMode } = useSelector((state) => state.theme)
  const { data: profileData, loading: profileLoading } = useSelector((state) => state.profile)

  const [profileForm, setProfileForm] = useState({ email: '', first_name: '', last_name: '', phone: '', age: '', birth_date: '' })
  const [addressForm, setAddressForm] = useState({ city: '', postal_code: '', street_address: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [addressSaving, setAddressSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

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
    if (!activeTab || activeTab === 'products') dispatch(fetchProducts())
    if (activeTab === 'orders') dispatch(fetchMyOrders())
    if (activeTab === 'settings') dispatch(fetchProfile())
  }, [activeTab, dispatch])

  useEffect(() => {
    if (profileData) {
      setProfileForm({
        email: profileData.email || '',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone || '',
        age: profileData.age || '',
        birth_date: profileData.birth_date || '',
      })
      if (profileData.address) {
        setAddressForm({
          city: profileData.address.city || '',
          postal_code: profileData.address.postal_code || '',
          street_address: profileData.address.street_address || '',
        })
      }
    }
  }, [profileData])

  useEffect(() => {
    const params = {}
    if (activeTab) params.tab = activeTab
    if (selectedCategory) params.category = selectedCategory
    setSearchParams(params, { replace: true })
  }, [activeTab, selectedCategory])

  const handleProfileSave = async () => {
    setProfileSaving(true)
    try {
      await dispatch(updateProfile(profileForm)).unwrap()
      dispatch(showNotification('Profile updated successfully'))
    } catch (err) {
      dispatch(showNotification(err.message || 'Failed to update profile', 'error'))
    } finally {
      setProfileSaving(false)
    }
  }

  const handleAddressSave = async () => {
    setAddressSaving(true)
    try {
      await dispatch(updateAddress(addressForm)).unwrap()
      dispatch(showNotification('Address updated successfully'))
    } catch (err) {
      dispatch(showNotification(err.message || 'Failed to update address', 'error'))
    } finally {
      setAddressSaving(false)
    }
  }

  const passwordErrors = (() => {
    const errs = []
    const pw = passwordForm.newPassword
    if (pw && pw.length < 8) errs.push('At least 8 characters')
    if (pw && !/[A-Z]/.test(pw)) errs.push('One uppercase letter')
    if (pw && !/[a-z]/.test(pw)) errs.push('One lowercase letter')
    if (pw && !/[0-9]/.test(pw)) errs.push('One number')
    return errs
  })()

  const passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword

  const handlePasswordChange = async () => {
    if (passwordErrors.length > 0) {
      dispatch(showNotification('Password does not meet requirements', 'error'))
      return
    }
    if (!passwordsMatch) {
      dispatch(showNotification('New passwords do not match', 'error'))
      return
    }
    setPasswordSaving(true)
    try {
      await dispatch(changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })).unwrap()
      dispatch(showNotification('Password changed successfully'))
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      dispatch(showNotification(err.message || 'Failed to change password', 'error'))
    } finally {
      setPasswordSaving(false)
    }
  }

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

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const categoryColors = {
    GPU: 'bg-green-500/20 text-green-400',
    CPU: 'bg-blue-500/20 text-blue-400',
    RAM: 'bg-purple-500/20 text-purple-400',
    Storage: 'bg-orange-500/20 text-orange-400',
    Motherboard: 'bg-red-500/20 text-red-400',
    PSU: 'bg-yellow-500/20 text-yellow-400',
    Case: 'bg-cyan-500/20 text-cyan-400',
    Cooling: 'bg-teal-500/20 text-teal-400',
    Peripherals: 'bg-pink-500/20 text-pink-400',
    Monitor: 'bg-indigo-500/20 text-indigo-400',
    Keyboard: 'bg-amber-500/20 text-amber-400',
    Mouse: 'bg-lime-500/20 text-lime-400',
  }

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    setVisibleProducts(8)
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
        {/* Notification */}
        {notification.message && (
          <div className={`px-4 py-3 rounded-lg mb-4 text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-green-500/20 border border-green-500 text-green-400'
              : 'bg-red-500/20 border border-red-500 text-red-400'
          }`}>
            {notification.message}
          </div>
        )}

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
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBuy(product) }}
                          disabled={product.quantity <= 0}
                          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                            product.quantity > 0
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {product.quantity > 0 ? 'Buy Now' : 'Sold Out'}
                        </button>
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
              <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProducts.slice(0, visibleProducts).map(product => (
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

                      {/* Buy button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBuy(product) }}
                        disabled={product.quantity <= 0}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                          product.quantity > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {product.quantity > 0 ? 'Buy Now' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredProducts.length > visibleProducts && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setVisibleProducts(v => v + 8)}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition cursor-pointer"
                  >
                    Load More ({filteredProducts.length - visibleProducts} remaining)
                  </button>
                </div>
              )}
              </>
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
                {orders.map(order => {
                  const product = order.Product
                  const orderDate = order.order_date ? new Date(order.order_date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : 'N/A'

                  return (
                    <div key={order.order_id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-400 dark:hover:border-gray-600 transition">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        {/* Left: product info */}
                        <div className="flex gap-4">
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

                        {/* Right: price and actions */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                          <span className="text-blue-400 text-xl font-bold">
                            ₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="text-red-400 hover:text-red-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Order
                          </button>
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
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setActiveTab(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
            </div>

            {profileLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-[3px] border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading profile...</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-2xl">
                {/* Profile Header Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold ring-2 ring-white/30 shrink-0">
                      {(profileForm.first_name?.[0] || username?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {profileForm.first_name && profileForm.last_name
                          ? `${profileForm.first_name} ${profileForm.last_name}`
                          : username || 'User'}
                      </h3>
                      <p className="text-blue-200 text-sm">{profileForm.email || 'No email set'}</p>
                      <p className="text-blue-300/70 text-xs mt-0.5">@{username}</p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-semibold">Personal Information</h3>
                      <p className="text-gray-400 text-xs">Update your personal details</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'first_name', label: 'First Name', type: 'text', icon: null },
                      { key: 'last_name', label: 'Last Name', type: 'text', icon: null },
                      { key: 'email', label: 'Email', type: 'email', icon: null },
                      { key: 'phone', label: 'Phone', type: 'text', icon: null },
                      { key: 'age', label: 'Age', type: 'number', icon: null, readOnly: true },
                      { key: 'birth_date', label: 'Birth Date', type: 'date', icon: null, readOnly: true },
                    ].map(({ key, label, type, readOnly }) => (
                      <div key={key} className="group">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
                        <input
                          type={type}
                          value={profileForm[key]}
                          onChange={(e) => !readOnly && setProfileForm({ ...profileForm, [key]: e.target.value })}
                          readOnly={readOnly}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                            readOnly
                              ? 'border-gray-100 dark:border-gray-700/30 bg-gray-100 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'border-gray-200 dark:border-gray-600/50 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <button
                      onClick={handleProfileSave}
                      disabled={profileSaving}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 cursor-pointer flex items-center gap-2"
                    >
                      {profileSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-4.5 h-4.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-semibold">Address</h3>
                      <p className="text-gray-400 text-xs">Manage your shipping address</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'city', label: 'City' },
                      { key: 'postal_code', label: 'Postal Code' },
                      { key: 'street_address', label: 'Street Address' },
                    ].map(({ key, label }) => (
                      <div key={key} className={key === 'street_address' ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
                        <input
                          type="text"
                          value={addressForm[key]}
                          onChange={(e) => setAddressForm({ ...addressForm, [key]: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600/50 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <button
                      onClick={handleAddressSave}
                      disabled={addressSaving}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/30 cursor-pointer flex items-center gap-2"
                    >
                      {addressSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Address
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                      <svg className="w-4.5 h-4.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-semibold">Change Password</h3>
                      <p className="text-gray-400 text-xs">Keep your account secure</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { key: 'currentPassword', label: 'Current Password' },
                      { key: 'newPassword', label: 'New Password' },
                      { key: 'confirmPassword', label: 'Confirm New Password' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
                        <input
                          type="password"
                          value={passwordForm[key]}
                          onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 ${
                            key === 'confirmPassword' && passwordForm.confirmPassword && !passwordsMatch
                              ? 'border-red-400 dark:border-red-500/50 focus:ring-2 focus:ring-red-500/40 focus:border-red-500'
                              : key === 'confirmPassword' && passwordForm.confirmPassword && passwordsMatch
                                ? 'border-green-400 dark:border-green-500/50 focus:ring-2 focus:ring-green-500/40 focus:border-green-500'
                                : key === 'newPassword' && passwordForm.newPassword && passwordErrors.length > 0
                                  ? 'border-red-400 dark:border-red-500/50 focus:ring-2 focus:ring-red-500/40 focus:border-red-500'
                                  : key === 'newPassword' && passwordForm.newPassword && passwordErrors.length === 0
                                    ? 'border-green-400 dark:border-green-500/50 focus:ring-2 focus:ring-green-500/40 focus:border-green-500'
                                    : 'border-gray-200 dark:border-gray-600/50 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500'
                          }`}
                        />
                        {key === 'newPassword' && passwordForm.newPassword && (
                          <div className="mt-2 space-y-1">
                            {[
                              { test: passwordForm.newPassword.length >= 8, text: 'At least 8 characters' },
                              { test: /[A-Z]/.test(passwordForm.newPassword), text: 'One uppercase letter' },
                              { test: /[a-z]/.test(passwordForm.newPassword), text: 'One lowercase letter' },
                              { test: /[0-9]/.test(passwordForm.newPassword), text: 'One number' },
                            ].map(({ test, text }) => (
                              <div key={text} className="flex items-center gap-1.5">
                                {test ? (
                                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                                <span className={`text-xs ${test ? 'text-green-500' : 'text-red-400'}`}>{text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {key === 'confirmPassword' && passwordForm.confirmPassword && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {passwordsMatch ? (
                              <>
                                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs text-green-500">Passwords match</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-xs text-red-400">Passwords do not match</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <button
                      onClick={handlePasswordChange}
                      disabled={passwordSaving}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-amber-500/20 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer flex items-center gap-2"
                    >
                      {passwordSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Appearance */}
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
                      <svg className="w-4.5 h-4.5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-semibold">Appearance</h3>
                      <p className="text-gray-400 text-xs">Customize how things look</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {darkMode ? (
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium text-sm">Dark Mode</p>
                        <p className="text-gray-400 text-xs">{darkMode ? 'On' : 'Off'} — Toggle between light and dark theme</p>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch(toggleDarkMode())}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                        darkMode ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
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
    </div>
  )
}
