import { Link } from 'react-router-dom'
import RatingStars from './RatingStars.jsx'
import PriceTag from './PriceTag.jsx'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext.jsx'
import { resolveImageUrl } from '../utils/imageUrl'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const toast = useToast()

  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0]
  const outOfStock = product.stockQuantity <= 0
  const onSale = product.discountPrice != null && product.discountPrice < product.price

  async function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.info('Sign in to add items to your cart')
      return
    }
    try {
      await addItem(product, 1)
      toast.success(`${product.name} added to cart`)
    } catch {
      toast.error('Could not add to cart — try again')
    }
  }

  return (
    <Link to={`/products/${product.id}`} className="product-card fade-in" tabIndex={0}>
      <div className="product-card-media">
        {onSale && <span className="deal-badge">SALE</span>}
        {primaryImage ? (
          <img
            src={resolveImageUrl(primaryImage.url)}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <i className="bi bi-image" />
        )}
      </div>
      <div className="product-card-body">
        <span className="product-category">{product.category?.name ?? 'SUCE'}</span>
        <span className="product-title">{product.name}</span>
        <RatingStars value={product.averageRating ?? 0} count={product.reviewCount ?? 0} />
        <div className="d-flex align-items-center justify-content-between mt-2">
          <PriceTag price={product.price} discountPrice={product.discountPrice} />
          <button
            className="btn btn-suce-ghost"
            style={{ fontSize: '1.1rem' }}
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label={`Add ${product.name} to cart`}
            title={outOfStock ? 'Out of stock' : 'Add to cart'}
          >
            <i className={outOfStock ? 'bi bi-slash-circle' : 'bi bi-bag-plus'} />
          </button>
        </div>
      </div>
    </Link>
  )
}
