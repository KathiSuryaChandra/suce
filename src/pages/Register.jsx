import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext.jsx'
import logoDark from '../assets/logo-dark.png'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export default function Register() {
  const { register, setSession, updateUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  // ── Tab ───────────────────────────────────────────────────────────
  // "password" = first/last name + email + password (existing flow)
  // "otp"      = mobile number + OTP only, no password
  const [tab, setTab] = useState('password')

  // ─────────────────────────────────────────────────────────────────
  // PASSWORD SIGNUP (unchanged from before)
  // ─────────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const next = {}
    if (!form.firstName.trim()) next.firstName = 'First name is required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address'
    if (form.password.length < 8) next.password = 'Use at least 8 characters'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      })
      toast.success('Welcome to SUCE')
      navigate('/', { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || 'Could not create your account'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  // ─────────────────────────────────────────────────────────────────
  // MOBILE OTP SIGNUP
  // Step 1: enter mobile number, send OTP
  // Step 2: enter OTP, verify -> account is created automatically by
  //         the backend on first successful verification, and we're
  //         logged in immediately
  // Step 3: ask for the person's name now that they're verified +
  //         logged in, and save it via PUT /users/me
  // ─────────────────────────────────────────────────────────────────
  const [otpStep, setOtpStep] = useState(1) // 1=enter mobile, 2=enter otp, 3=enter name
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [otpName, setOtpName] = useState({ firstName: '', lastName: '' })
  const [resendTimer, setResendTimer] = useState(0)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')

  const isValidMobile = (val) => /^[6-9]\d{9}$/.test(val)

  function startResendTimer() {
    setResendTimer(30)
    const t = setInterval(() => {
      setResendTimer((p) => {
        if (p <= 1) { clearInterval(t); return 0 }
        return p - 1
      })
    }, 1000)
  }

  async function sendSignupOtp() {
    if (!isValidMobile(mobile)) {
      setOtpError('Enter a valid 10-digit mobile number')
      return
    }
    setOtpError('')
    setOtpLoading(true)
    try {
      const res = await fetch(`${API}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: mobile, purpose: 'REGISTER' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP')
      setOtpStep(2)
      startResendTimer()
    } catch (err) {
      setOtpError(err.message)
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    if (otp.length !== 6) {
      setOtpError('Enter the 6-digit OTP')
      return
    }
    setOtpError('')
    setOtpLoading(true)
    try {
      // Same endpoint used for OTP login — the backend auto-creates an
      // account on first verification for a mobile number it hasn't
      // seen before, and logs us straight in.
      const res = await fetch(`${API}/auth/login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: mobile, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Verification failed')
      setSession(data.accessToken, data.user)
      setOtpStep(3)
    } catch (err) {
      setOtpError(err.message)
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleSaveName(e) {
    e.preventDefault()
    if (!otpName.firstName.trim()) {
      setOtpError('Please enter your first name')
      return
    }
    setOtpError('')
    setOtpLoading(true)
    try {
      const res = await fetch(`${API}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstName: otpName.firstName, lastName: otpName.lastName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Could not save your name')
      updateUser({ firstName: data.firstName, lastName: data.lastName })
      toast.success('Welcome to SUCE')
      navigate('/', { replace: true })
    } catch (err) {
      setOtpError(err.message)
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div className="container-suce section" style={{ maxWidth: 480 }}>
      <img src={logoDark} alt="SUCE" className="suce-logo-mark mb-4" />
      <span className="eyebrow">Join SUCE</span>
      <h2 className="mt-1 mb-4">Create your account</h2>

      {/* Tab switcher */}
      <div className="d-flex gap-2 mb-4">
        <button
          type="button"
          className={tab === 'password' ? 'btn-suce-primary' : 'btn-suce-outline'}
          style={{ flex: 1 }}
          onClick={() => setTab('password')}
        >
          Email &amp; password
        </button>
        <button
          type="button"
          className={tab === 'otp' ? 'btn-suce-primary' : 'btn-suce-outline'}
          style={{ flex: 1 }}
          onClick={() => { setTab('otp'); setOtpError('') }}
        >
          Mobile OTP
        </button>
      </div>

      {/* ── EMAIL & PASSWORD SIGNUP ───────────────────────────────── */}
      {tab === 'password' && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label-suce" htmlFor="firstName">First name</label>
              <input
                id="firstName"
                className="form-control-suce"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
              />
              {errors.firstName && <div className="text-danger mt-1" style={{ fontSize: '0.82rem' }}>{errors.firstName}</div>}
            </div>
            <div className="col-6">
              <label className="form-label-suce" htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                className="form-control-suce"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label-suce" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control-suce"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
            {errors.email && <div className="text-danger mt-1" style={{ fontSize: '0.82rem' }}>{errors.email}</div>}
          </div>

          <div className="row g-3">
            <div className="col-6">
              <label className="form-label-suce" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control-suce"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
              {errors.password && <div className="text-danger mt-1" style={{ fontSize: '0.82rem' }}>{errors.password}</div>}
            </div>
            <div className="col-6">
              <label className="form-label-suce" htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control-suce"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
              />
              {errors.confirmPassword && <div className="text-danger mt-1" style={{ fontSize: '0.82rem' }}>{errors.confirmPassword}</div>}
            </div>
          </div>

          <button type="submit" className="btn btn-suce-primary w-100 mt-4" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}

      {/* ── MOBILE OTP SIGNUP ──────────────────────────────────────── */}
      {tab === 'otp' && (
        <>
          {otpError && (
            <div className="mb-3 p-3" style={{ background: '#fbecea', border: '1px solid #e0a39e', borderRadius: 4, fontSize: '0.85rem', color: 'var(--suce-danger)' }}>
              {otpError}
            </div>
          )}

          {/* Step 1: enter mobile number */}
          {otpStep === 1 && (
            <div>
              <label className="form-label-suce" htmlFor="mobile">Mobile number</label>
              <input
                id="mobile"
                type="text"
                inputMode="numeric"
                maxLength={10}
                className="form-control-suce"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                autoFocus
              />
              <p className="text-secondary mt-2" style={{ fontSize: '0.8rem' }}>
                We'll text you a 6-digit code to verify it's you.
              </p>
              <button
                type="button"
                className="btn btn-suce-primary w-100 mt-2"
                disabled={otpLoading}
                onClick={sendSignupOtp}
              >
                {otpLoading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </div>
          )}

          {/* Step 2: enter OTP */}
          {otpStep === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-3 p-3" style={{ background: '#eaf6ef', border: '1px solid #8fc4a8', borderRadius: 4, fontSize: '0.85rem', color: 'var(--suce-success)' }}>
                OTP sent to <strong>+91 {mobile}</strong> via SMS
              </div>

              <label className="form-label-suce" htmlFor="otp">Enter 6-digit OTP</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="form-control-suce text-center"
                style={{ fontSize: '1.4rem', letterSpacing: '0.3em', fontWeight: 600 }}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                autoFocus
              />
              <p className="text-secondary mt-2 text-center" style={{ fontSize: '0.8rem' }}>
                Valid for 10 minutes
              </p>

              <button type="submit" className="btn btn-suce-primary w-100 mt-2" disabled={otpLoading || otp.length !== 6}>
                {otpLoading ? 'Verifying…' : 'Verify & continue'}
              </button>

              <div className="text-center mt-3">
                {resendTimer > 0 ? (
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Resend in {resendTimer}s</span>
                ) : (
                  <button type="button" className="btn-suce-ghost" style={{ fontSize: '0.8rem' }} onClick={() => { setOtp(''); sendSignupOtp() }}>
                    Resend OTP
                  </button>
                )}
                <span className="mx-2 text-secondary">|</span>
                <button
                  type="button"
                  className="btn-suce-ghost"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => { setOtpStep(1); setOtp(''); setOtpError('') }}
                >
                  Change number
                </button>
              </div>
            </form>
          )}

          {/* Step 3: collect name now that the account exists and we're logged in */}
          {otpStep === 3 && (
            <form onSubmit={handleSaveName}>
              <p className="text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                You're verified! What should we call you?
              </p>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label-suce" htmlFor="otpFirstName">First name</label>
                  <input
                    id="otpFirstName"
                    className="form-control-suce"
                    value={otpName.firstName}
                    onChange={(e) => setOtpName((n) => ({ ...n, firstName: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="col-6">
                  <label className="form-label-suce" htmlFor="otpLastName">Last name</label>
                  <input
                    id="otpLastName"
                    className="form-control-suce"
                    value={otpName.lastName}
                    onChange={(e) => setOtpName((n) => ({ ...n, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-suce-primary w-100" disabled={otpLoading}>
                {otpLoading ? 'Saving…' : 'Continue to SUCE'}
              </button>
            </form>
          )}
        </>
      )}

      <p className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  )
}
