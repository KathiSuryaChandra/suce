import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function ManageUsers() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  function load() {
    setLoading(true)
    adminService
      .listUsers({ search: search || undefined, size: 100 })
      .then((res) => setUsers(res.content ?? res))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const handle = setTimeout(load, 300)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function toggleEnabled(user) {
    const previous = users
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, enabled: !u.enabled } : u)))
    try {
      await adminService.setUserEnabled(user.id, !user.enabled)
      toast.success(`${user.firstName ?? user.email} ${user.enabled ? 'disabled' : 'enabled'}`)
    } catch {
      setUsers(previous)
      toast.error('Could not update this user')
    }
  }

  return (
    <div>
      <span className="eyebrow">Accounts</span>
      <h2 className="mt-1 mb-4">Users</h2>

      <input
        className="form-control-suce mb-4"
        style={{ maxWidth: 320 }}
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <LoadingSkeleton rows={6} height={48} />
      ) : (
        <div className="card-suce" style={{ overflowX: 'auto' }}>
          <table className="table mb-0">
            <thead>
              <tr style={{ fontSize: '0.78rem' }} className="text-secondary">
                <th className="px-3 py-3">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th className="px-3 text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-3 py-3">{u.firstName} {u.lastName}</td>
                  <td className="text-secondary" style={{ fontSize: '0.85rem' }}>{u.email}</td>
                  <td><span className="status-pill">{u.role}</span></td>
                  <td className="text-secondary" style={{ fontSize: '0.85rem' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-3 text-end">
                    <button
                      className={`btn ${u.enabled ? 'btn-suce-outline' : 'btn-suce-primary'}`}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.9rem' }}
                      onClick={() => toggleEnabled(u)}
                      disabled={u.role === 'ADMIN'}
                      title={u.role === 'ADMIN' ? 'Admin accounts cannot be disabled here' : undefined}
                    >
                      {u.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
