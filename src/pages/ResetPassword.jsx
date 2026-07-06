import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import authService from '../services/authService'
import { useToast } from '../context/ToastContext.jsx'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const toast = useToast()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) return setError('Use at least 8 characters')
    if (password !== confirmPassword) return setError('Passwords do not match')
    setError('')
    setSubmitting(true)
    try {
      await authService.resetPassword({ token, password })
      toast.success('Password updated — sign in with your new password')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'This reset link is invalid or expired')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="container-suce section text-center" style={{ maxWidth: 440 }}>
        <h3>This link is invalid</h3>
        <p className="text-secondary">Request a new password reset link to continue.</p>
        <Link to="/forgot-password" className="btn btn-suce-outline mt-3">Request new link</Link>
      </div>
    )
  }

  return (
    <div className="container-suce section" style={{ maxWidth: 440 }}>
      <span className="eyebrow">Reset access</span>
      <h2 className="mt-1 mb-4">Choose a new password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label-suce" htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            className="form-control-suce"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="form-label-suce" htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            className="form-control-suce"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {error && <div className="text-danger mb-2" style={{ fontSize: '0.85rem' }}>{error}</div>}
        <button type="submit" className="btn btn-suce-primary w-100 mt-3" disabled={submitting}>
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
