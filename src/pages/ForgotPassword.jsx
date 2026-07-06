import { useState } from 'react'
import { Link } from 'react-router-dom'
import authService from '../services/authService'
import { useToast } from '../context/ToastContext.jsx'

export default function ForgotPassword() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await authService.forgotPassword(email)
      setSubmitted(true)
    } catch {
      // Intentionally show the same success state either way — avoids
      // leaking which emails are registered.
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="auth-shell text-center">
        <i className="bi bi-envelope-check" style={{ fontSize: '2.2rem', color: 'var(--suce-silver)' }} />
        <h3 className="mt-3 mb-2">Check your inbox</h3>
        <p className="text-secondary">
          If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
        </p>
        <Link to="/login" className="btn btn-suce-outline mt-3">Back to sign in</Link>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <span className="eyebrow">Reset access</span>
      <h2 className="mt-1 mb-2">Forgot your password?</h2>
      <p className="text-secondary mb-4">Enter your email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit}>
        <label className="form-label-suce" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          className="form-control-suce"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-suce-primary w-100 mt-4" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
        <Link to="/login">Back to sign in</Link>
      </p>
    </div>
  )
}