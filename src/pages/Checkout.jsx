import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency } from '../components/PriceTag.jsx'
import orderService from '../services/orderService'
import { useToast } from '../context/ToastContext.jsx'

const PAYMENT_METHODS = [
  { id: 'RAZORPAY', label: 'Razorpay', icon: 'bi-credit-card' },
  { id: 'STRIPE', label: 'Card (Stripe)', icon: 'bi-credit-card-2-front' },
  { id: 'COD', label: 'Cash on delivery', icon: 'bi-cash-coin' },
]

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [address, setAddress] = useState({
    fullName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY')
  const [placing, setPlacing] = useState(false)

  const shipping = subtotal > 5000 ? 0 : 199
  const total = subtotal + shipping

  function update(field, value) {
    setAddress((a) => ({ ...a, [field]: value }))
  }

  function isValid() {
    return address.fullName && address.line1 && address.city && address.state && address.postalCode && address.phone
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()
    if (!isValid()) {
      toast.error('Fill in your full shipping address')
      return
    }
    setPlacing(true)
    try {
      const order = await orderService.place({
        shippingAddress: address,
        paymentMethod,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      })
      await clear()
      toast.success('Order placed')
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place your order — try again')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart', { replace: true })
    return null
  }

  return (
    <div className="container-suce section">
      <span className="eyebrow">Final step</span>
      <h2 className="mt-1 mb-4">Checkout</h2>

      <form onSubmit={handlePlaceOrder} className="row g-5">
        <div className="col-lg-8">
          <h5 className="mb-3">Shipping address</h5>
          <div className="row g-3 mb-4">
            <div className="col-12">
              <label className="form-label-suce">Full name</label>
              <input className="form-control-suce" value={address.fullName} onChange={(e) => update('fullName', e.target.value)} required />
            </div>
            <div className="col-12">
              <label className="form-label-suce">Address line 1</label>
              <input className="form-control-suce" value={address.line1} onChange={(e) => update('line1', e.target.value)} required />
            </div>
            <div className="col-12">
              <label className="form-label-suce">Address line 2 (optional)</label>
              <input className="form-control-suce" value={address.line2} onChange={(e) => update('line2', e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label-suce">City</label>
              <input className="form-control-suce" value={address.city} onChange={(e) => update('city', e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label-suce">State</label>
              <input className="form-control-suce" value={address.state} onChange={(e) => update('state', e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label-suce">Postal code</label>
              <input className="form-control-suce" value={address.postalCode} onChange={(e) => update('postalCode', e.target.value)} required />
            </div>
            <div className="col-12">
              <label className="form-label-suce">Phone</label>
              <input className="form-control-suce" value={address.phone} onChange={(e) => update('phone', e.target.value)} required />
            </div>
          </div>

          <h5 className="mb-3">Payment method</h5>
          <div className="d-flex flex-column gap-2">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.id}
                className="d-flex align-items-center gap-3 p-3"
                style={{
                  border: `1px solid ${paymentMethod === m.id ? 'var(--suce-ink)' : 'var(--suce-silver-light)'}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === m.id}
                  onChange={() => setPaymentMethod(m.id)}
                />
                <i className={`bi ${m.icon}`} />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-suce p-4">
            <h5 className="mb-4">Order summary</h5>
            <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: 220, overflowY: 'auto' }}>
              {items.map((i) => (
                <div key={i.id} className="d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
                  <span className="text-secondary">{i.product.name} × {i.quantity}</span>
                  <span className="font-mono">
                    {formatCurrency((i.product.discountPrice ?? i.product.price) * i.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <hr className="hairline mb-3" />
            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
              <span className="text-secondary">Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3" style={{ fontSize: '0.9rem' }}>
              <span className="text-secondary">Shipping</span>
              <span className="font-mono">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <hr className="hairline mb-3" />
            <div className="d-flex justify-content-between mb-4">
              <strong>Total</strong>
              <strong className="font-mono">{formatCurrency(total)}</strong>
            </div>
            <button type="submit" className="btn btn-suce-primary w-100" disabled={placing}>
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
