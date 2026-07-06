import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import authService from '../services/authService'
import { useToast } from '../context/ToastContext.jsx'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('details')

  const [details, setDetails] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
  })
  const [savingDetails, setSavingDetails] = useState(false)

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleSaveDetails(e) {
    e.preventDefault()
    setSavingDetails(true)
    try {
      const updated = await authService.updateProfile(details)
      updateUser(updated)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile')
    } finally {
      setSavingDetails(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setSavingPassword(true)
    try {
      await authService.changePassword(passwords)
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="container-suce section" style={{ maxWidth: 640 }}>
      <span className="eyebrow">Your account</span>
      <h2 className="mt-1 mb-4">Profile</h2>

      <div className="d-flex gap-4 mb-4" style={{ borderBottom: '1px solid var(--suce-silver-light)' }}>
        {['details', 'security'].map((t) => (
          <button
            key={t}
            className="btn btn-suce-ghost px-0 pb-2"
            style={{
              borderBottom: tab === t ? '2px solid var(--suce-ink)' : '2px solid transparent',
              borderRadius: 0,
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'var(--suce-ink)' : undefined,
            }}
            onClick={() => setTab(t)}
          >
            {t === 'details' ? 'Personal details' : 'Security'}
          </button>
        ))}
      </div>

      {tab === 'details' ? (
        <form onSubmit={handleSaveDetails}>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label-suce">First name</label>
              <input
                className="form-control-suce"
                value={details.firstName}
                onChange={(e) => setDetails((d) => ({ ...d, firstName: e.target.value }))}
              />
            </div>
            <div className="col-6">
              <label className="form-label-suce">Last name</label>
              <input
                className="form-control-suce"
                value={details.lastName}
                onChange={(e) => setDetails((d) => ({ ...d, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label-suce">Email</label>
            <input className="form-control-suce" value={user?.email ?? ''} disabled style={{ background: '#f4f4f5' }} />
          </div>
          <div className="mb-4">
            <label className="form-label-suce">Phone</label>
            <input
              className="form-control-suce"
              value={details.phone}
              onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-suce-primary" disabled={savingDetails}>
            {savingDetails ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleChangePassword}>
          <div className="mb-3">
            <label className="form-label-suce">Current password</label>
            <input
              type="password"
              className="form-control-suce"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
            />
          </div>
          <div className="row g-3 mb-4">
            <div className="col-6">
              <label className="form-label-suce">New password</label>
              <input
                type="password"
                className="form-control-suce"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              />
            </div>
            <div className="col-6">
              <label className="form-label-suce">Confirm new password</label>
              <input
                type="password"
                className="form-control-suce"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-suce-primary" disabled={savingPassword}>
            {savingPassword ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </div>
  )
}
