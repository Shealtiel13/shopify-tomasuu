import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { adminLogout } from '../store/adminAuthSlice'
import { showNotification } from '../store/notificationSlice'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'

const columns = [
  { key: 'customer_id', label: 'ID' },
  { key: 'first_name', label: 'First Name', bold: true },
  { key: 'last_name', label: 'Last Name', bold: true },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'age', label: 'Age' },
  { key: 'birth_date', label: 'Birth Date' },
]

const fields = [
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'first_name', label: 'First Name', type: 'text' },
  { key: 'last_name', label: 'Last Name', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'birth_date', label: 'Birth Date', type: 'date' },
]

const statusColors = {
  Pending: 'bg-yellow-500/15 text-yellow-400',
  Processing: 'bg-blue-500/15 text-blue-400',
  Shipped: 'bg-purple-500/15 text-purple-400',
  Delivered: 'bg-orange-500/15 text-orange-400',
  Completed: 'bg-green-500/15 text-green-400',
  Cancelled: 'bg-red-500/15 text-red-400',
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [viewCustomer, setViewCustomer] = useState(null)
  const [search, setSearch] = useState('')
  const { token } = useSelector((state) => state.adminAuth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  }

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/customers', { headers })
      if (res.status === 401 || res.status === 403) {
        dispatch(adminLogout())
        navigate('/login')
        return
      }
      setCustomers(await res.json())
    } catch {
      setCustomers([])
    }
  }, [token])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const tableData = search.trim()
    ? customers.filter(c => {
        const q = search.trim().toLowerCase()
        return (c.first_name || '').toLowerCase().includes(q) ||
          (c.last_name || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q)
      })
    : customers

  const handleEdit = (row) => setModal({ data: row, type: 'edit' })

  const handleSave = async (formData) => {
    try {
      const id = modal.data.customer_id
      await fetch('/api/customers/' + id, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(formData),
      })
      dispatch(showNotification('Customer updated successfully'))
      setModal(null)
      loadCustomers()
    } catch {
      dispatch(showNotification('Something went wrong', 'error'))
    }
  }

  const handleDelete = (row) => setDeleteConfirm(row)

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      const res = await fetch('/api/customers/' + deleteConfirm.customer_id, { method: 'DELETE', headers })
      if (!res.ok) {
        const data = await res.json()
        dispatch(showNotification(data.error || 'Failed to delete', 'error'))
        setDeleteConfirm(null)
        return
      }
      dispatch(showNotification('Deleted successfully'))
      setDeleteConfirm(null)
      loadCustomers()
    } catch {
      dispatch(showNotification('Failed to delete', 'error'))
      setDeleteConfirm(null)
    }
  }

  const handleView = async (row) => {
    try {
      const res = await fetch('/api/customers/' + row.customer_id, { headers })
      if (!res.ok) return
      setViewCustomer(await res.json())
    } catch {
      dispatch(showNotification('Failed to load customer profile', 'error'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          {search.trim() && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {tableData.length} result{tableData.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Edit Modal */}
      {modal && (
        <Modal
          title="Edit Customer"
          fields={fields}
          data={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Customer Profile Panel */}
      {viewCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Profile</h3>
              <button onClick={() => setViewCustomer(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {(viewCustomer.first_name?.[0] || '').toUpperCase()}{(viewCustomer.last_name?.[0] || '').toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{viewCustomer.first_name} {viewCustomer.last_name}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{viewCustomer.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{viewCustomer.phone || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{viewCustomer.age || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Birth Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{viewCustomer.birth_date || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Address</h5>
                {viewCustomer.address ? (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 dark:text-white">{viewCustomer.address.street_address}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{viewCustomer.address.city}, {viewCustomer.address.postal_code}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No address on file</p>
                )}
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Order History</h5>
                {viewCustomer.orders && viewCustomer.orders.length > 0 ? (
                  <div className="space-y-2">
                    {viewCustomer.orders.map(order => (
                      <div key={order.order_id} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{order.product?.product_name || 'Unknown Product'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {order.order_number} &middot; {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            &#8369;{Number(order.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-500/15 text-gray-400'}`}>
                            {order.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
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
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">Delete Customer</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-2">Are you sure? This action cannot be undone.</p>
            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 mb-5">
              <p className="text-gray-900 dark:text-white text-sm font-medium">
                {deleteConfirm.first_name} {deleteConfirm.last_name}
              </p>
              <p className="text-gray-500 text-xs mt-1">ID: {deleteConfirm.customer_id}</p>
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
