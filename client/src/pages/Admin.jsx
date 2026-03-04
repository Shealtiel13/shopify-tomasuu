import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import { showNotification } from '../store/notificationSlice'
import { toggleDarkMode } from '../store/themeSlice'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'

const sections = [
  {
    key: 'customers',
    label: 'Customers',
    endpoint: '/api/customers',
    idKey: 'customer_id',
    columns: [
      { key: 'customer_id', label: 'ID' },
      { key: 'first_name', label: 'First Name', bold: true },
      { key: 'last_name', label: 'Last Name', bold: true },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'age', label: 'Age' },
      { key: 'birth_date', label: 'Birth Date' },
    ],
    fields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'first_name', label: 'First Name', type: 'text' },
      { key: 'last_name', label: 'Last Name', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'birth_date', label: 'Birth Date', type: 'date' },
    ],
  },
  {
    key: 'products',
    label: 'Products',
    endpoint: '/api/products',
    idKey: 'product_id',
    columns: [
      { key: 'product_id', label: 'ID' },
      { key: 'product_name', label: 'Product Name', bold: true },
      { key: 'price', label: 'Price' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
    ],
    fields: [
      { key: 'product_name', label: 'Product Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'image_url', label: 'Image', type: 'file' },
    ],
    canAdd: true,
  },
  {
    key: 'orders',
    label: 'Orders',
    endpoint: '/api/orders',
    idKey: 'order_id',
    columns: [
      { key: 'order_id', label: 'ID' },
      { key: 'order_number', label: 'Reference No.', bold: true },
      { key: 'customer_id', label: 'Customer ID' },
      { key: 'product_id', label: 'Product ID' },
      { key: 'order_date', label: 'Order Date' },
      { key: 'total_amount', label: 'Total Amount' },
      { key: 'status', label: 'Status', render: (val) => {
        const colors = {
          Pending: 'bg-yellow-500/15 text-yellow-400',
          Processing: 'bg-blue-500/15 text-blue-400',
          Shipped: 'bg-purple-500/15 text-purple-400',
          Delivered: 'bg-orange-500/15 text-orange-400',
          Completed: 'bg-green-500/15 text-green-400',
          Cancelled: 'bg-red-500/15 text-red-400',
        }
        return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[val] || 'bg-gray-500/15 text-gray-400'}`}>{val || 'N/A'}</span>
      }},
    ],
    fields: [
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed'] },
    ],
  },
]

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

export default function Admin() {
  const [data, setData] = useState({ customers: [], products: [], orders: [] })
  const [modal, setModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [productCategory, setProductCategory] = useState(null)
  const settingsRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { token, username, role } = useSelector((state) => state.auth)
  const { darkMode } = useSelector((state) => state.theme)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/dashboard')
    }
  }, [])

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  }

  const loadAll = useCallback(async () => {
    try {
      const results = await Promise.all(
        sections.map(s => fetch(s.endpoint, { headers }))
      )
      if (results.some(r => r.status === 401 || r.status === 403)) {
        dispatch(logout())
        navigate('/login')
        return
      }
      const [customers, products, orders] = await Promise.all(
        results.map(r => r.json())
      )
      setData({ customers, products, orders })
    } catch {
      setData({ customers: [], products: [], orders: [] })
    }
  }, [token])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleAdd = (section) => {
    setModal({ section, data: null, type: 'add' })
  }

  const handleEdit = (section, row) => {
    setModal({ section, data: row, type: 'edit' })
  }

  const handleSave = async (formData) => {
    const { section, type } = modal
    const hasFile = Object.values(formData).some(v => v instanceof File)
    let body, fetchHeaders
    if (hasFile) {
      body = new FormData()
      Object.entries(formData).forEach(([k, v]) => {
        if (v instanceof File) {
          body.append('image', v)
        } else {
          body.append(k, v)
        }
      })
      fetchHeaders = { 'Authorization': 'Bearer ' + token }
    } else {
      body = JSON.stringify(formData)
      fetchHeaders = headers
    }
    try {
      if (type === 'add') {
        await fetch(section.endpoint, {
          method: 'POST',
          headers: fetchHeaders,
          body,
        })
        dispatch(showNotification(section.label.slice(0, -1) + ' created successfully'))
      } else {
        const id = modal.data[section.idKey]
        await fetch(section.endpoint + '/' + id, {
          method: 'PATCH',
          headers: fetchHeaders,
          body,
        })
        dispatch(showNotification(section.label.slice(0, -1) + ' updated successfully'))
      }
      setModal(null)
      loadAll()
    } catch {
      dispatch(showNotification('Something went wrong', 'error'))
    }
  }

  const handleDelete = (section, row) => {
    setDeleteConfirm({ section, row })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    const { section, row } = deleteConfirm
    const id = row[section.idKey]
    try {
      const res = await fetch(section.endpoint + '/' + id, { method: 'DELETE', headers })
      if (!res.ok) {
        const data = await res.json()
        dispatch(showNotification(data.error || 'Failed to delete', 'error'))
        setDeleteConfirm(null)
        return
      }
      dispatch(showNotification('Deleted successfully'))
      setDeleteConfirm(null)
      loadAll()
    } catch {
      dispatch(showNotification('Failed to delete', 'error'))
      setDeleteConfirm(null)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nexus<span className="text-blue-500">Hub</span></h1>
            <span className="bg-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded">ADMIN</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-gray-600 dark:text-gray-400">Welcome, <span className="text-gray-900 dark:text-white font-medium">{username || 'Admin'}</span></span>
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition cursor-pointer ${showSettings ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
                  <h4 className="text-gray-900 dark:text-white font-semibold text-sm mb-3">Settings</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 dark:text-white text-sm font-medium">Dark Mode</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Toggle light/dark theme</p>
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
              )}
            </div>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{data.customers.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{data.products.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{data.orders.length}</p>
          </div>
        </div>

        {/* All Tables */}
        {sections.map(section => {
          const isProducts = section.key === 'products'
          const tableData = isProducts && productCategory
            ? data.products.filter(p => p.category === productCategory)
            : data[section.key]

          return (
            <div key={section.key}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{section.label}</h2>
                {section.canAdd && (
                  <button onClick={() => handleAdd(section)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer">
                    + Add {section.label.slice(0, -1)}
                  </button>
                )}
              </div>
              {isProducts && (
                <div className="flex gap-2 overflow-x-auto py-1 px-1 mb-4 scrollbar-hide">
                  <button
                    onClick={() => setProductCategory(null)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                      !productCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    All ({data.products.length})
                  </button>
                  {Object.entries(categoryColors).map(([cat, colors]) => {
                    const count = data.products.filter(p => p.category === cat).length
                    if (count === 0) return null
                    return (
                      <button
                        key={cat}
                        onClick={() => setProductCategory(cat)}
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                          productCategory === cat ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900 ' + colors : colors
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    )
                  })}
                </div>
              )}
              <DataTable
                columns={section.columns}
                data={tableData}
                onEdit={(row) => handleEdit(section, row)}
                onDelete={(row) => handleDelete(section, row)}
              />
            </div>
          )
        })}
      </div>

      {/* Edit/Add Modal */}
      {modal && (
        <Modal
          title={(modal.type === 'edit' ? 'Edit ' : 'Add ') + modal.section.label.slice(0, -1)}
          fields={modal.section.fields}
          data={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h3 className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">Delete {deleteConfirm.section.label.slice(0, -1)}</h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-2">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>

            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 mb-5">
              <p className="text-gray-900 dark:text-white text-sm font-medium">
                {deleteConfirm.row[deleteConfirm.section.columns.find(c => c.bold)?.key] || deleteConfirm.section.label.slice(0, -1) + ' #' + deleteConfirm.row[deleteConfirm.section.idKey]}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                ID: {deleteConfirm.row[deleteConfirm.section.idKey]}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
