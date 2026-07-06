import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import { formatCurrency } from '../../components/PriceTag.jsx'
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function ManageOrders() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  function load() {
    setLoading(true)
    adminService
      .listOrders({ status: statusFilter || undefined, size: 100 })
      .then((res) => setOrders(res.content ?? res))
      .finally(() => setLoading(false))
  }

  useEffect(load, [statusFilter])

  async function handleStatusChange(order, status) {
    const previous = orders
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)))
    try {
      await adminService.updateOrderStatus(order.id, status)
      toast.success(`Order #${order.orderNumber ?? order.id} marked ${status.toLowerCase()}`)
    } catch {
      setOrders(previous)
      toast.error('Could not update order status')
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <span className="eyebrow">Fulfillment</span>
          <h2 className="mt-1 mb-0">Orders</h2>
        </div>
        <select className="form-select-suce" style={{ width: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} height={48} />
      ) : (
        <div className="card-suce" style={{ overflowX: 'auto' }}>
          <table className="table mb-0">
            <thead>
              <tr style={{ fontSize: '0.78rem' }} className="text-secondary">
                <th className="px-3 py-3">Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th className="px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-3 py-3 font-mono">#{o.orderNumber ?? o.id}</td>
                  <td>{o.customerName ?? o.user?.email}</td>
                  <td className="text-secondary" style={{ fontSize: '0.85rem' }}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="font-mono">{formatCurrency(o.totalAmount)}</td>
                  <td className="px-3">
                    <select
                      className="form-select-suce"
                      style={{ width: 160, fontSize: '0.82rem' }}
                      value={o.status}
                      onChange={(e) => handleStatusChange(o, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
