import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearNotification } from './store/notificationSlice'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProductDetail from './pages/ProductDetail'
import Admin from './pages/Admin'
import Cart from './pages/Cart'
import ForgotPassword from './pages/ForgotPassword'
=======
import Cart from './pages/Cart'

function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth.token)
  return token ? children : <Navigate to="/login" />
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
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
    </>
  )
}

export default App
