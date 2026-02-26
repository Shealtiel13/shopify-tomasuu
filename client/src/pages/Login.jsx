import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (redirectTo) => {
    setError('')

    try {
      const res = await fetch('/api/login/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('username', username)
      localStorage.setItem('role', data.role)

      if (redirectTo === '/admin' && data.role !== 'admin') {
        setError('Access denied. You are not an admin.')
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
        return
      }

      if (redirectTo === '/dashboard' && data.role === 'admin') {
        setError('Admin accounts cannot log in as a regular user.')
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
        return
      }

      navigate(redirectTo)
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleLogin('/dashboard')
  }

  const handleAdminLogin = (e) => {
    e.preventDefault()
    handleLogin('/admin')
  }

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Nexus<span className="text-blue-500">Hub</span></h1>
          <p className="text-gray-400 mt-2">Customer & Order Management System</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Login</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your username" />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your password" />
            </div>

            <div className="flex gap-3">
              <button type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 cursor-pointer">
                Sign In
              </button>
              <button type="button" onClick={handleAdminLogin}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition duration-200 cursor-pointer">
                Admin Login
              </button>
            </div>
          </form>

          <p className="text-gray-400 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
