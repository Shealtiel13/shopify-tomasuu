import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearNotification } from './store/notificationSlice'
import AdminLayout from './layouts/AdminLayout'
import AdminLogin from './pages/AdminLogin'
import AdminOverview from './pages/AdminOverview'
import AdminCustomers from './pages/AdminCustomers'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import AdminPayments from './pages/AdminPayments'

function AdminProtectedRoute({ children }) {
  const { token, role } = useSelector((state) => state.adminAuth)
  if (!token) return <Navigate to="/login" />
  if (role !== 'admin') return <Navigate to="/login" />
  return children
}

function Toast() {
  const dispatch = useDispatch()
  const { message, type } = useSelector((state) => state.notification)
  if (!message) return null
  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[280px] max-w-sm ${
        type === 'success'
          ? 'bg-green-500/20 border border-green-500 text-green-400 backdrop-blur-sm'
          : 'bg-red-500/20 border border-red-500 text-red-400 backdrop-blur-sm'
      }`}>
        <span className="flex-1">{message}</span>
        <button onClick={() => dispatch(clearNotification())} className="text-current opacity-60 hover:opacity-100 transition cursor-pointer flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
    <Toast />
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="payments" element={<AdminPayments />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
    </>
  )
}

export default App
