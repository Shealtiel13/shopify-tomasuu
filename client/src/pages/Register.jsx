import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', username: '', password: '',
    phone: '', age: '', birth_date: '', street_address: '', city: '', postal_code: '',
    role: 'user'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const selectRole = (role) => {
    setForm({ ...form, role })
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const body = form.role === 'admin'
        ? { username: form.username, password: form.password, role: form.role }
        : { ...form, age: parseInt(form.age) }

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setSuccess('Account created successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  const inputClass = "w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-lg px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Nexus<span className="text-blue-500">Hub</span></h1>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8 overflow-hidden">
          {error && <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded mb-4">{success}</div>}

          {step === 1 && (
            <div className="animate-[fadeIn_0.3s_ease-in-out]">
              <h2 className="text-2xl font-semibold text-white mb-2">Register</h2>
              <p className="text-gray-400 mb-6">Choose your account type</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => selectRole('user')}
                  className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 hover:border-blue-500 rounded-xl p-6 text-center transition cursor-pointer group"
                >
                  <div className="text-4xl mb-3">👤</div>
                  <div className="text-white font-semibold text-lg group-hover:text-blue-400 transition">User</div>
                  <p className="text-gray-400 text-sm mt-1">Full account with profile & address</p>
                </button>
                <button
                  type="button"
                  onClick={() => selectRole('admin')}
                  className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 hover:border-purple-500 rounded-xl p-6 text-center transition cursor-pointer group"
                >
                  <div className="text-4xl mb-3">🛡️</div>
                  <div className="text-white font-semibold text-lg group-hover:text-purple-400 transition">Admin</div>
                  <p className="text-gray-400 text-sm mt-1">Management access only</p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-[fadeIn_0.3s_ease-in-out]">
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-2xl font-semibold text-white">
                  {form.role === 'admin' ? 'Admin' : 'User'} Registration
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {form.role === 'user' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">First Name</label>
                        <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required
                          className={inputClass} placeholder="Enter your first name" />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Last Name</label>
                        <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required
                          className={inputClass} placeholder="Enter your last name" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1">Email</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required
                        className={inputClass} placeholder="Enter your email address" />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Username</label>
                    <input type="text" name="username" value={form.username} onChange={handleChange} required
                      className={inputClass} placeholder="Choose a username" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Password</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} required
                      className={inputClass} placeholder="Create a password" />
                  </div>
                </div>

                {form.role === 'user' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Phone</label>
                        <input type="text" name="phone" value={form.phone} onChange={handleChange} required
                          className={inputClass} placeholder="Enter your phone number" />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Age</label>
                        <input type="number" name="age" value={form.age} onChange={handleChange} required
                          className={inputClass} placeholder="Enter your age" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1">Birth Date</label>
                      <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} required
                        className={inputClass} />
                    </div>

                    <div className="border-t border-gray-700 pt-4 mt-4">
                      <h3 className="text-lg font-medium text-white mb-3">Address</h3>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Street Address</label>
                        <input type="text" name="street_address" value={form.street_address} onChange={handleChange} required
                          className={inputClass} placeholder="Enter your street address" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-1">City</label>
                          <input type="text" name="city" value={form.city} onChange={handleChange} required
                            className={inputClass} placeholder="Enter your city" />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-1">Postal Code</label>
                          <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} required
                            className={inputClass} placeholder="Enter your postal code" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button type="submit"
                  className={`w-full font-semibold py-3 rounded-lg transition duration-200 mt-2 cursor-pointer text-white ${
                    form.role === 'admin'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                  Create Account
                </button>
              </form>
            </div>
          )}

          <p className="text-gray-400 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
