import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import orderService from '../services/orderService'
import { formatCurrency } from '../components/PriceTag.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useToast } from '../context/ToastContext.jsx'

const STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    orderService
      .getById(id)
      .then(setOrder)
      .catch(() => navigate('/orders', { replace: true }))
      .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleCancel() {
    try {
      const updated = await orderService.cancel(id)
      setOrder(updated)
      toast.success('Order cancelled')
    } catch {
      toast.error('Could not cancel this order')
    } finally {
      setCancelOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="container-suce section">
        <LoadingSkeleton rows={1} height={320} />
      </div>
    )
  }
  if (!order) return null

  const stepIndex = STEPS.indexOf(order.status)
  const cancellable = ['PENDING', 'CONFIRMED'].includes(order.status)

  return (
    <div className="container-suce section">
      <Link to="/orders" className="text-secondary" style={{ fontSize: '0.85rem' }}>
        <i className="bi bi-arrow-left me-1" /> Back to orders
      </Link>

      <div className="d-flex align-items-center justify-content-between mt-3 mb-4 flex-wrap gap-2">
        <div>
          <span className="eyebrow">Order #{order.orderNumber ?? order.id}</span>
          <h2 className="mt-1 mb-0">
            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </h2>
        </div>
        <span className={`status-pill ${order.status?.toLowerCase()}`} style={{ fontSize: '0.8rem' }}>{order.status}</span>
      </div>

      {order.status !== 'CANCELLED' && (
        <div className="d-flex align-items-center mb-5">
          {STEPS.map((step, i) => (
            <div key={step} className="d-flex align-items-center flex-grow-1">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: i <= stepIndex ? 'var(--suce-ink)' : 'var(--suce-silver-light)',
                  color: i <= stepIndex ? '#fff' : 'var(--suce-steel)',
                  fontSize: '0.75rem',
                }}
              >
                {i < stepIndex ? <i className="bi bi-check" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-grow-1" style={{ height: 1, background: i < stepIndex ? 'var(--suce-ink)' : 'var(--suce-silver-light)' }} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="row g-5">
        <div className="col-lg-8">
          <h5 className="mb-3">Items</h5>
          <div className="d-flex flex-column gap-3 mb-4">
            {order.items?.map((item) => (
              <div key={item.id} className="d-flex justify-content-between pb-3" style={{ borderBottom: '1px solid var(--suce-silver-light)' }}>
                <div>
                  <div className="product-title">{item.productName ?? item.product?.name}</div>
                  <span className="text-secondary" style={{ fontSize: '0.82rem' }}>Qty {item.quantity}</span>
                </div>
                <span className="font-mono">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
              </div>
            ))}
          </div>

          {cancellable && (
            <button className="btn btn-suce-danger" onClick={() => setCancelOpen(true)}>
              Cancel order
            </button>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card-suce p-4 mb-4">
            <h6 className="mb-3">Shipping address</h6>
            <p className="text-secondary mb-0" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
              {order.shippingAddress?.fullName}<br />
              {order.shippingAddress?.line1}<br />
              {order.shippingAddress?.line2 && <>{order.shippingAddress.line2}<br /></>}
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
              {order.shippingAddress?.phone}
            </p>
          </div>
          <div className="card-suce p-4">
            <h6 className="mb-3">Payment</h6>
            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.88rem' }}>
              <span className="text-secondary">Method</span>
              <span>{order.paymentMethod}</span>
            </div>
            <div className="d-flex justify-content-between mb-3" style={{ fontSize: '0.88rem' }}>
              <span className="text-secondary">Status</span>
              <span>{order.paymentStatus ?? 'Pending'}</span>
            </div>
            <hr className="hairline mb-3" />
            <div className="d-flex justify-content-between">
              <strong>Total</strong>
              <strong className="font-mono">{formatCurrency(order.totalAmount)}</strong>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={cancelOpen}
        title="Cancel this order?"
        message="This can't be undone. Refunds (if applicable) are processed within 5–7 business days."
        confirmLabel="Cancel order"
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  )
}
