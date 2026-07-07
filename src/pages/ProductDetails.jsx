import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import RatingStars from '../components/RatingStars.jsx'
import PriceTag from '../components/PriceTag.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import productService from '../services/productService'
import wishlistService from '../services/wishlistService'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext.jsx'
import { resolveImageUrl } from '../utils/imageUrl'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const toast = useToast()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([productService.getById(id), productService.getReviews(id, { size: 20 })])
      .then(([productRes, reviewsRes]) => {
        if (!active) return
        setProduct(productRes)
        setReviews(reviewsRes.content ?? reviewsRes)
      })
      .catch(() => navigate('/products', { replace: true }))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id, navigate])

  async function handleAddToCart() {
    if (!isAuthenticated) {
      toast.info('Sign in to add items to your cart')
      navigate('/login')
      return
    }
    try {
      await addItem(product, quantity)
      toast.success(`${product.name} added to cart`)
    } catch {
      toast.error('Could not add to cart — try again')
    }
  }

  async function handleBuyNow() {
    if (!isAuthenticated) {
      toast.info('Sign in to continue')
      navigate('/login')
      return
    }
    try {
      await addItem(product, quantity)
      navigate('/checkout')
    } catch {
      toast.error('Could not process — try again')
    }
  }

  async function handleToggleWishlist() {
    if (!isAuthenticated) {
      toast.info('Sign in to save items to your wishlist')
      navigate('/login')
      return
    }
    try {
      if (wishlisted) {
        await wishlistService.remove(product.id)
        setWishlisted(false)
      } else {
        await wishlistService.add(product.id)
        setWishlisted(true)
        toast.success('Saved to wishlist')
      }
    } catch {
      toast.error('Something went wrong — try again')
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setSubmittingReview(true)
    try {
      const newReview = await productService.addReview(id, reviewForm)
      setReviews((prev) => [newReview, ...prev])
      setReviewForm({ rating: 5, comment: '' })
      toast.success('Thanks for your review')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit your review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="container-suce section">
        <LoadingSkeleton rows={1} height={420} />
      </div>
    )
  }
  if (!product) return null

  const images = product.images?.length ? product.images : [{ url: null }]
  const outOfStock = product.stockQuantity <= 0

  return (
    <div className="container-suce section">
      <nav style={{ fontSize: '0.82rem' }} className="text-secondary mb-4">
        <Link to="/products">Shop</Link> / <span>{product.category?.name}</span> / <span>{product.name}</span>
      </nav>

      <div className="row g-5">
        <div className="col-lg-6">
          <div className="product-card-media mb-3" style={{ borderRadius: 4 }}>
            {images[activeImage]?.url ? (
              <img
                src={resolveImageUrl(images[activeImage].url)}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <i className="bi bi-image" style={{ fontSize: '2.5rem' }} />
            )}
          </div>
          {images.length > 1 && (
            <div className="d-flex gap-2" style={{ overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 4 }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className="border-0 p-0"
                  style={{
                    width: 64,
                    height: 64,
                    minWidth: 64,
                    borderRadius: 4,
                    overflow: 'hidden',
                    flexShrink: 0,
                    outline: idx === activeImage ? '2px solid var(--suce-ink)' : '1px solid var(--suce-silver-light)',
                  }}
                >
                  <img src={resolveImageUrl(img.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-6">
          <span className="product-category">{product.brand?.name ?? product.category?.name}</span>
          <h1 className="font-display mt-1 mb-2" style={{ fontSize: '2rem' }}>{product.name}</h1>
          <RatingStars value={product.averageRating ?? 0} count={product.reviewCount ?? 0} size="1rem" />

          <div className="mt-3 mb-4">
            <PriceTag price={product.price} discountPrice={product.discountPrice} size="1.6rem" />
          </div>

          <p className="text-secondary" style={{ lineHeight: 1.7 }}>{product.description}</p>

          <hr className="hairline my-4" />

         <div className="d-flex align-items-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
            <span className={`status-pill ${outOfStock ? 'cancelled' : 'delivered'}`}>
              {outOfStock ? 'Out of stock' : `${product.stockQuantity} in stock`}
            </span>
            {product.sku && <span className="text-secondary font-mono" style={{ fontSize: '0.78rem' }}>SKU {product.sku}</span>}
          </div>

          {/* Quantity selector */}
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="d-flex align-items-center border" style={{ borderColor: 'var(--suce-silver)', borderRadius: 4 }}>
              <button
                className="btn btn-suce-ghost px-3"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >−</button>
              <span className="px-2 font-mono">{quantity}</span>
              <button
                className="btn btn-suce-ghost px-3"
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                aria-label="Increase quantity"
              >+</button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-suce-outline flex-grow-1"
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              <i className="bi bi-bag-plus me-2" /> Add to cart
            </button>
            <button
              className="btn btn-suce-primary flex-grow-1"
              onClick={handleBuyNow}
              disabled={outOfStock}
            >
              <i className="bi bi-lightning-fill me-2" /> Buy now
            </button>
            <button
              className="btn btn-suce-outline"
              onClick={handleToggleWishlist}
              aria-label="Toggle wishlist"
            >
              <i className={wishlisted ? 'bi bi-heart-fill' : 'bi bi-heart'} />
            </button>
          </div>
        </div>
      </div>

      <hr className="hairline my-5" />

      <section style={{ maxWidth: 720 }}>
        <h3 className="mb-4">Reviews ({reviews.length})</h3>

        <form onSubmit={handleSubmitReview} className="card-suce p-4 mb-4">
          <span className="form-label-suce mb-2">Your rating</span>
          <RatingStars value={reviewForm.rating} size="1.3rem" onRate={(r) => setReviewForm((f) => ({ ...f, rating: r }))} />
          <textarea
            className="form-control-suce mt-3"
            rows={3}
            placeholder="Share your thoughts on this product…"
            value={reviewForm.comment}
            onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
          />
          <button type="submit" className="btn btn-suce-primary mt-3 align-self-start" disabled={submittingReview}>
            {submittingReview ? 'Submitting…' : 'Submit review'}
          </button>
        </form>

        {reviews.length === 0 ? (
          <p className="text-secondary">No reviews yet — be the first to share your thoughts.</p>
        ) : (
          <div className="d-flex flex-column gap-4">
            {reviews.map((r) => (
              <div key={r.id}>
               <div className="d-flex align-items-center justify-content-between" style={{ flexWrap: 'wrap', gap: 4 }}>
                  <strong>{r.user?.firstName ?? 'Verified buyer'}</strong>
                  <span className="text-secondary" style={{ fontSize: '0.78rem' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <RatingStars value={r.rating} />
                <p className="mt-2 mb-0 text-secondary">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
