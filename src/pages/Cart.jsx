import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import PriceTag, { formatCurrency } from '../components/PriceTag.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { resolveImageUrl } from '../utils/imageUrl'

export default function Cart() {
  const { items, subtotal, updateItem, removeItem } = useCart()
  const navigate = useNavigate()
  const toast = useToast()

  async function handleQuantityChange(itemId, quantity, max) {
    if (quantity < 1 || quantity > max) return
    try {
      await updateItem(itemId, quantity)
    } catch {
      toast.error('Could not update quantity')
    }
  }

  async function handleRemove(itemId) {
    try {
      await removeItem(itemId)
    } catch {
      toast.error('Could not remove item')
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-suce section">
        <EmptyState
          icon="bi-bag"
          title="Your cart is empty"
          message="Browse the catalog and add something you'll actually use."
          actionLabel="Shop the catalog"
          actionTo="/products"
        />
      </div>
    )
  }

  const shipping = subtotal > 5000 ? 0 : 199
  const total = subtotal + shipping

  return (
    <div className="container-suce section">
      <span className="eyebrow">{items.length} item{items.length > 1 ? 's' : ''}</span>
      <h2 className="mt-1 mb-4">Your cart</h2>

      <div className="row g-5">
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-4">
            {items.map((item) => (
              <div key={item.id} className="d-flex gap-3 pb-4" style={{ borderBottom: '1px solid var(--suce-silver-light)' }}>
                <div
                  className="product-card-media flex-shrink-0"
                  style={{ width: 96, height: 96, borderRadius: 4 }}
                >
                  {item.product.images?.[0]?.url ? (
                    <img
                      src={resolveImageUrl(item.product.images[0].url)}
                      alt={item.product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <i className="bi bi-image" />
                  )}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <Link to={`/products/${item.product.id}`} className="product-title">{item.product.name}</Link>
                    <button className="btn btn-suce-ghost p-0" onClick={() => handleRemove(item.id)} aria-label="Remove item">
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                  <span className="product-category">{item.product.category?.name}</span>
                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <div className="d-flex align-items-center border" style={{ borderColor: 'var(--suce-silver)', borderRadius: 4 }}>
                      <button
                        className="btn btn-suce-ghost px-2"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.product.stockQuantity)}
                      >−</button>
                      <span className="px-2 font-mono">{item.quantity}</span>
                      <button
                        className="btn btn-suce-ghost px-2"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.product.stockQuantity)}
                      >+</button>
                    </div>
                    <PriceTag price={item.product.price} discountPrice={item.product.discountPrice} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-suce p-4">
            <h5 className="mb-4">Order summary</h5>
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
            <button className="btn btn-suce-primary w-100" onClick={() => navigate('/checkout')}>
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
