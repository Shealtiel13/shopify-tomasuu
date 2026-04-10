import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { adminLogout } from '../store/adminAuthSlice'
import { showNotification } from '../store/notificationSlice'

const paymentStatusColors = {
  pending: 'bg-gray-500/15 text-gray-400',
  submitted: 'bg-yellow-500/15 text-yellow-400',
  paid: 'bg-green-500/15 text-green-400',
  rejected: 'bg-red-500/15 text-red-400',
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [filter, setFilter] = useState('all')
  const [viewModal, setViewModal] = useState(null)
  const { token } = useSelector((state) => state.adminAuth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  }

  const loadPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/payments', { headers })
      if (res.status === 401 || res.status === 403) {
        dispatch(adminLogout())
        navigate('/login')
        return
      }
      setPayments(await res.json())
    } catch {
      setPayments([])
    }
  }, [token])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const handleVerify = async (orderId, action) => {
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
      setViewModal(null)
      loadPayments()
    } catch {
      dispatch(showNotification('Failed to verify payment', 'error'))
    }
  }

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)
  const submittedCount = payments.filter(p => p.status === 'submitted').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          {submittedCount > 0 && (
            <span className="bg-yellow-500/15 text-yellow-400 text-xs font-medium px-2.5 py-1 rounded-full">
              {submittedCount} awaiting review
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'submitted', label: 'Submitted' },
          { key: 'paid', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'pending', label: 'Pending' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {tab.label} ({tab.key === 'all' ? payments.length : payments.filter(p => p.status === tab.key).length})
          </button>
        ))}
      </div>

      {/* Payments list */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          No payments found
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order ID</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Method</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reference</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{payment.payment_id}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">{payment.order_id}</td>
                    <td className="px-5 py-3 text-sm">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${payment.method === 'gcash' ? 'bg-blue-500/15 text-blue-400' : 'bg-gray-500/15 text-gray-400'}`}>
                        {payment.method === 'gcash' ? 'GCash' : 'COD'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">&#8369;{Number(payment.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{payment.reference_number || '-'}</td>
                    <td className="px-5 py-3 text-sm">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${paymentStatusColors[payment.status] || 'bg-gray-500/15 text-gray-400'}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <button
                        onClick={() => setViewModal(payment)}
                        className="inline-flex items-center gap-1.5 bg-gray-600/20 hover:bg-gray-600 text-gray-400 hover:text-white border border-gray-500/30 hover:border-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Details</h3>
              <button onClick={() => setViewModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">&#8369;{Number(viewModal.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <p className={`text-sm font-bold ${
                    viewModal.status === 'paid' ? 'text-green-400' :
                    viewModal.status === 'rejected' ? 'text-red-400' :
                    viewModal.status === 'submitted' ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>{viewModal.status.charAt(0).toUpperCase() + viewModal.status.slice(1)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Method</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.method === 'gcash' ? 'GCash' : 'COD'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.order_id}</p>
                </div>
              </div>
              {viewModal.reference_number && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">GCash Reference No.</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.reference_number}</p>
                </div>
              )}
              {viewModal.proof_url ? (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Payment Proof</p>
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={viewModal.proof_url} alt="GCash proof" className="w-full object-contain bg-gray-50 dark:bg-gray-900 max-h-64" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No proof uploaded yet.</p>
              )}
              {viewModal.status === 'submitted' && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handleVerify(viewModal.order_id, 'reject')} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition cursor-pointer">Reject</button>
                  <button onClick={() => handleVerify(viewModal.order_id, 'approve')} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition cursor-pointer">Approve</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
