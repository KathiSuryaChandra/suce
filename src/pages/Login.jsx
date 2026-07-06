import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext.jsx'
import logoDark from '../assets/logo-dark.png'
import { DEMO_MODE } from '../demo/config'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const next = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address'
    if (!form.password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await login(form.email, form.password)
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-suce section" style={{ maxWidth: 440 }}>
      <img src={logoDark} alt="SUCE" className="suce-logo-mark mb-4" />
      <span className="eyebrow">Welcome back</span>
      <h2 className="mt-1 mb-4">Sign in</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label-suce" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-control-suce"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-invalid={!!errors.email}
          />
          {errors.email && <div className="text-danger mt-1" style={{ fontSize: '0.82rem' }}>{errors.email}</div>}
        </div>

        <div className="mb-2">
          <div className="d-flex justify-content-between">
            <label className="form-label-suce" htmlFor="password">Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--suce-steel)' }}>Forgot password?</Link>
          </div>
          <input
            id="password"
            type="password"
            className="form-control-suce"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            aria-invalid={!!errors.password}
          />
          {errors.password && <div className="text-danger mt-1" style={{ fontSize: '0.82rem' }}>{errors.password}</div>}
        </div>

        <button type="submit" className="btn btn-suce-primary w-100 mt-3" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
        New to SUCE? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
      </p>

      {DEMO_MODE && (
        <div className="mt-4 p-3" style={{ background: '#f4f4f5', borderRadius: 4, fontSize: '0.82rem' }}>
          <strong className="font-mono d-block mb-2">DEMO ACCOUNTS</strong>
          <p className="mb-1 text-secondary">Email: <code>customer@suce.demo</code> — any password</p>
          <p className="mb-0 text-secondary">Email: <code>admin@suce.demo</code> — any password (admin access)</p>
          <button
            type="button"
            className="btn btn-suce-ghost p-0 mt-2"
            style={{ fontSize: '0.8rem', color: 'var(--suce-ink)', fontWeight: 600 }}
            onClick={() => {
              document.getElementById("email").value = "customer@suce.demo"
              setForm({ email: "customer@suce.demo", password: "demo1234" })
            }}
          >
            Fill as customer →
          </button>
        </div>
      )}
    </div>
  )
}
