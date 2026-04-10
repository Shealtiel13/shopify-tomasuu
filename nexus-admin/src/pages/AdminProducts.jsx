import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { adminLogout } from '../store/adminAuthSlice'
import { showNotification } from '../store/notificationSlice'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'

const columns = [
  { key: 'product_id', label: 'ID' },
  { key: 'product_name', label: 'Product Name', bold: true },
  { key: 'price', label: 'Price' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
]

const fields = [
  { key: 'product_name', label: 'Product Name', type: 'text' },
  { key: 'price', label: 'Price', type: 'number' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'image_url', label: 'Image', type: 'file' },
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

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [category, setCategory] = useState(null)
  const { token } = useSelector((state) => state.adminAuth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  }

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products', { headers })
      if (res.status === 401 || res.status === 403) {
        dispatch(adminLogout())
        navigate('/login')
        return
      }
      setProducts(await res.json())
    } catch {
      setProducts([])
    }
  }, [token])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const tableData = category ? products.filter(p => p.category === category) : products

  const handleAdd = () => setModal({ data: null, type: 'add' })
  const handleEdit = (row) => setModal({ data: row, type: 'edit' })

  const handleSave = async (formData) => {
    const hasFile = Object.values(formData).some(v => v instanceof File)
    let body, fetchHeaders
    if (hasFile) {
      body = new FormData()
      Object.entries(formData).forEach(([k, v]) => {
        if (v instanceof File) body.append('image', v)
        else body.append(k, v)
      })
      fetchHeaders = { 'Authorization': 'Bearer ' + token }
    } else {
      body = JSON.stringify(formData)
      fetchHeaders = headers
    }
    try {
      if (modal.type === 'add') {
        await fetch('/api/products', { method: 'POST', headers: fetchHeaders, body })
        dispatch(showNotification('Product created successfully'))
      } else {
        await fetch('/api/products/' + modal.data.product_id, { method: 'PATCH', headers: fetchHeaders, body })
        dispatch(showNotification('Product updated successfully'))
      }
      setModal(null)
      loadProducts()
    } catch {
      dispatch(showNotification('Something went wrong', 'error'))
    }
  }

  const handleDelete = (row) => setDeleteConfirm(row)

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      const res = await fetch('/api/products/' + deleteConfirm.product_id, { method: 'DELETE', headers })
      if (!res.ok) {
        const data = await res.json()
        dispatch(showNotification(data.error || 'Failed to delete', 'error'))
        setDeleteConfirm(null)
        return
      }
      dispatch(showNotification('Deleted successfully'))
      setDeleteConfirm(null)
      loadProducts()
    } catch {
      dispatch(showNotification('Failed to delete', 'error'))
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer">
          + Add Product
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto py-1 px-1 scrollbar-hide">
        <button
          onClick={() => setCategory(null)}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
            !category ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All ({products.length})
        </button>
        {Object.entries(categoryColors).map(([cat, colors]) => {
          const count = products.filter(p => p.category === cat).length
          if (count === 0) return null
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                category === cat ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900 ' + colors : colors
              }`}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Modal */}
      {modal && (
        <Modal
          title={modal.type === 'edit' ? 'Edit Product' : 'Add Product'}
          fields={fields}
          data={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">Delete Product</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-2">Are you sure? This action cannot be undone.</p>
            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 mb-5">
              <p className="text-gray-900 dark:text-white text-sm font-medium">{deleteConfirm.product_name}</p>
              <p className="text-gray-500 text-xs mt-1">ID: {deleteConfirm.product_id}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition cursor-pointer">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
