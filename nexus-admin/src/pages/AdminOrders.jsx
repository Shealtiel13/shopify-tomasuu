import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { adminLogout } from '../store/adminAuthSlice'
import { showNotification } from '../store/notificationSlice'
import DataTable from '../components/DataTable'

const statusColors = {
  Pending: 'bg-yellow-500/15 text-yellow-400',
  Processing: 'bg-blue-500/15 text-blue-400',
  Shipped: 'bg-purple-500/15 text-purple-400',
  Delivered: 'bg-orange-500/15 text-orange-400',
  Completed: 'bg-green-500/15 text-green-400',
  Cancelled: 'bg-red-500/15 text-red-400',
}

const timelineDotColors = {
  Pending: 'bg-yellow-500',
  Processing: 'bg-blue-500',
  Shipped: 'bg-purple-500',
  Delivered: 'bg-orange-500',
  Completed: 'bg-green-500',
  Cancelled: 'bg-red-500',
}

const columns = [
  { key: 'order_id', label: 'ID' },
  { key: 'order_number', label: 'Reference No.', bold: true },
  { key: 'customer_id', label: 'Customer ID' },
  { key: 'product_id', label: 'Product ID' },
  { key: 'order_date', label: 'Order Date' },
  { key: 'total_amount', label: 'Total Amount' },
  { key: 'payment_method', label: 'Payment', render: (val) => {
    const labels = { cod: 'COD', gcash: 'GCash' }
    const colors = { cod: 'bg-gray-500/15 text-gray-400', gcash: 'bg-blue-500/15 text-blue-400' }
    return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[val] || 'bg-gray-500/15 text-gray-400'}`}>{labels[val] || val || 'COD'}</span>
  }},
  { key: 'status', label: 'Status', render: (val) => (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[val] || 'bg-gray-500/15 text-gray-400'}`}>{val || 'N/A'}</span>
  )},
]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [trackingModal, setTrackingModal] = useState(null)
  const [paymentModal, setPaymentModal] = useState(null)
  const { token } = useSelector((state) => state.adminAuth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  }

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders', { headers })
      if (res.status === 401 || res.status === 403) {
        dispatch(adminLogout())
        navigate('/login')
        return
      }
      setOrders(await res.json())
    } catch {
      setOrders([])
    }
  }, [token])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleEdit = (row) => {
    setStatusModal({ order: row, status: row.status, notes: '' })
  }

  const handleStatusUpdate = async () => {
    if (!statusModal) return
    const { order, status, notes } = statusModal
    try {
      const res = await fetch('/api/orders/' + order.order_id + '/status', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status, notes }),
      })
      if (!res.ok) {
        const data = await res.json()
        dispatch(showNotification(data.error || 'Failed to update status', 'error'))
        return
      }
      dispatch(showNotification('Order status updated to ' + status))
      setStatusModal(null)
      loadOrders()
    } catch {
      dispatch(showNotification('Failed to update status', 'error'))
    }
  }

  const handleViewPayment = async (orderId) => {
    try {
      const res = await fetch('/api/payments/' + orderId, { headers })
      if (!res.ok) {
        dispatch(showNotification('No payment record found', 'error'))
        return
      }
      setPaymentModal(await res.json())
    } catch {
      dispatch(showNotification('Failed to load payment', 'error'))
    }
  }

  const handleVerifyPayment = async (orderId, action) => {
    try {
      const res = await fetch('/api/payments/' + orderId + '/verify', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const data = await res.json()
        dispatch(showNotification(data.error || 'Failed to verify', 'error'))
        return
      }
      dispatch(showNotification(action === 'approve' ? 'Payment approved' : 'Payment rejected'))
      setPaymentModal(null)
      loadOrders()
    } catch {
      dispatch(showNotification('Failed to verify payment', 'error'))
    }
  }

  const handleViewTracking = async (orderId) => {
    try {
      const res = await fetch('/api/orders/' + orderId + '/tracking', { headers })
      if (!res.ok) return
      setTrackingModal(await res.json())
    } catch {
      dispatch(showNotification('Failed to load tracking', 'error'))
    }
  }

  const handleDelete = (row) => setDeleteConfirm(row)

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      const res = await fetch('/api/orders/' + deleteConfirm.order_id, { method: 'DELETE', headers })
      if (!res.ok) {
        const data = await res.json()
        dispatch(showNotification(data.error || 'Failed to delete', 'error'))
        setDeleteConfirm(null)
        return
      }
      dispatch(showNotification('Deleted successfully'))
      setDeleteConfirm(null)
      loadOrders()
    } catch {
      dispatch(showNotification('Failed to delete', 'error'))
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>

      <DataTable
        columns={columns}
        data={orders}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={(row) => handleViewTracking(row.order_id)}
        viewLabel="Track"
        editLabel="Confirm order"
        deleteLabel="Delete Order"
      />

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold mb-1">Confirm Order</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{statusModal.order.order_number}</p>
            {statusModal.order.payment_method === 'gcash' && (
              <button
                onClick={() => handleViewPayment(statusModal.order.order_id)}
                className="text-blue-400 hover:text-blue-300 text-xs font-medium mb-4 flex items-center gap-1 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View GCash Payment Proof
              </button>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={statusModal.status}
                onChange={(e) => setStatusModal({ ...statusModal, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
              <input
                type="text"
                value={statusModal.notes}
                onChange={(e) => setStatusModal({ ...statusModal, notes: e.target.value })}
                placeholder="e.g. Shipped via LBC"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStatusModal(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer">Cancel</button>
              <button onClick={handleStatusUpdate} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer">Update Status</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Verification Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">GCash Payment</h3>
              <button onClick={() => setPaymentModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">&#8369;{Number(paymentModal.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <p className={`text-sm font-bold ${
                    paymentModal.status === 'paid' ? 'text-green-400' :
                    paymentModal.status === 'rejected' ? 'text-red-400' :
                    paymentModal.status === 'submitted' ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>{paymentModal.status.charAt(0).toUpperCase() + paymentModal.status.slice(1)}</p>
                </div>
              </div>
              {paymentModal.reference_number && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">GCash Reference No.</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{paymentModal.reference_number}</p>
                </div>
              )}
              {paymentModal.proof_url ? (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Payment Proof</p>
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={paymentModal.proof_url} alt="GCash proof" className="w-full object-contain bg-gray-50 dark:bg-gray-900 max-h-64" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No proof uploaded yet.</p>
              )}
              {paymentModal.status === 'submitted' && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handleVerifyPayment(paymentModal.order_id, 'reject')} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition cursor-pointer">Reject</button>
                  <button onClick={() => handleVerifyPayment(paymentModal.order_id, 'approve')} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition cursor-pointer">Approve Payment</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Tracking</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{trackingModal.order.order_number}</p>
              </div>
              <button onClick={() => setTrackingModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Status:</span>
                <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[trackingModal.order.status] || 'bg-gray-500/15 text-gray-400'}`}>
                  {trackingModal.order.status}
                </span>
              </div>
              {trackingModal.history.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No status changes recorded yet.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-4">
                    {trackingModal.history.map((entry, i) => (
                      <div key={entry.history_id || i} className="relative flex gap-4 pl-8">
                        <div className={`absolute left-1.5 top-1 w-3 h-3 rounded-full ${timelineDotColors[entry.to_status] || 'bg-gray-500'} ring-2 ring-white dark:ring-gray-800`}></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {entry.from_status ? `${entry.from_status} → ${entry.to_status}` : entry.to_status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            by {entry.changed_by} &middot; {new Date(entry.created_at).toLocaleString()}
                          </p>
                          {entry.notes && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1">{entry.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">Delete Order</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-2">Are you sure? This action cannot be undone.</p>
            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 mb-5">
              <p className="text-gray-900 dark:text-white text-sm font-medium">{deleteConfirm.order_number}</p>
              <p className="text-gray-500 text-xs mt-1">ID: {deleteConfirm.order_id}</p>
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
