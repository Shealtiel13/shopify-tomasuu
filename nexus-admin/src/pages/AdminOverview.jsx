import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { adminLogout } from '../store/adminAuthSlice'
import { showNotification } from '../store/notificationSlice'

const statusColors = {
  Pending: 'bg-yellow-500/15 text-yellow-400',
  Processing: 'bg-blue-500/15 text-blue-400',
  Shipped: 'bg-purple-500/15 text-purple-400',
  Delivered: 'bg-orange-500/15 text-orange-400',
  Completed: 'bg-green-500/15 text-green-400',
  Cancelled: 'bg-red-500/15 text-red-400',
}

export default function AdminOverview() {
  const [data, setData] = useState({ customers: [], products: [], orders: [] })
  const { token } = useSelector((state) => state.adminAuth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  }

  const loadAll = useCallback(async () => {
    try {
      const results = await Promise.all([
        fetch('/api/customers', { headers }),
        fetch('/api/products', { headers }),
        fetch('/api/orders', { headers }),
      ])
      if (results.some(r => r.status === 401 || r.status === 403)) {
        dispatch(adminLogout())
        navigate('/login')
        return
      }
      const [customers, products, orders] = await Promise.all(results.map(r => r.json()))
      setData({ customers, products, orders })
    } catch {
      dispatch(showNotification('Failed to load dashboard data', 'error'))
    }
  }, [token])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const totalRevenue = data.orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

  const pendingOrders = data.orders.filter(o => o.status === 'Pending').length
  const lowStock = data.products.filter(p => p.quantity > 0 && p.quantity <= 5).length

  const recentOrders = [...data.orders]
    .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
    .slice(0, 8)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Customers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{data.customers.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Products</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{data.products.length}</p>
              {lowStock > 0 && <p className="text-xs text-orange-400 mt-1">{lowStock} low stock</p>}
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/15 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{data.orders.length}</p>
              {pendingOrders > 0 && <p className="text-xs text-yellow-400 mt-1">{pendingOrders} pending</p>}
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">&#8369;{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/15 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          <button onClick={() => navigate('/orders')} className="text-blue-500 hover:text-blue-400 text-sm font-medium transition cursor-pointer">
            View All
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reference</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">{order.order_number}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">&#8369;{Number(order.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3 text-sm">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${order.payment_method === 'gcash' ? 'bg-blue-500/15 text-blue-400' : 'bg-gray-500/15 text-gray-400'}`}>
                        {order.payment_method === 'gcash' ? 'GCash' : 'COD'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-500/15 text-gray-400'}`}>
                        {order.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
