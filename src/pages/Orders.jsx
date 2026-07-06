import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import orderService from '../services/orderService'
import { formatCurrency } from '../components/PriceTag.jsx'
import EmptyState from '../components/EmptyState.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService
      .list({ size: 50 })
      .then((res) => setOrders(res.content ?? res))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-suce section">
      <span className="eyebrow">Your account</span>
      <h2 className="mt-1 mb-4">Order history</h2>

      {loading ? (
        <LoadingSkeleton rows={4} height={64} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="bi-receipt"
          title="No orders yet"
          message="Once you place an order, you'll be able to track it here."
          actionLabel="Shop the catalog"
          actionTo="/products"
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="card-suce p-4 d-flex flex-row align-items-center justify-content-between flex-wrap gap-3"
            >
              <div>
                <span className="font-mono text-secondary" style={{ fontSize: '0.78rem' }}>
                  Order #{order.orderNumber ?? order.id}
                </span>
                <div style={{ fontSize: '0.95rem' }}>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</div>
              </div>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                {order.items?.length ?? order.itemCount} item{(order.items?.length ?? order.itemCount) !== 1 ? 's' : ''}
              </span>
              <span className={`status-pill ${order.status?.toLowerCase()}`}>{order.status}</span>
              <strong className="font-mono">{formatCurrency(order.totalAmount)}</strong>
              <i className="bi bi-chevron-right text-secondary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
