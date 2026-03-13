import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess('A reset code has been sent to your email')
      setStep(2)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess('Code verified! Enter your new password')
      setStep(3)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess('Password reset successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Nexus<span className="text-blue-500">Hub</span></h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Reset your password</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>{s}</div>
                {s < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {step === 1 && 'Enter your email'}
            {step === 2 && 'Enter reset code'}
            {step === 3 && 'Set new password'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {step === 1 && 'We\'ll send a verification code to your email'}
            {step === 2 && 'Check your inbox for the 6-digit code'}
            {step === 3 && 'Choose a strong password for your account'}
          </p>

          {error && <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded mb-4">{success}</div>}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className={inputClass} placeholder="Enter your registered email" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition duration-200 cursor-pointer">
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">Verification Code</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required maxLength={6}
                  className={`${inputClass} text-center text-2xl tracking-[0.5em]`} placeholder="------" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition duration-200 cursor-pointer">
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button type="button" onClick={() => { setStep(1); setError(''); setSuccess('') }}
                className="w-full text-gray-500 hover:text-gray-300 text-sm cursor-pointer">
                Resend code
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                  className={inputClass} placeholder="Enter new password" />
              </div>
              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  className={inputClass} placeholder="Confirm new password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition duration-200 cursor-pointer">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-gray-600 dark:text-gray-400 text-center mt-6">
            <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
