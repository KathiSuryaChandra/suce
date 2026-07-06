import { useEffect, useState } from 'react'
import wishlistService from '../services/wishlistService'
import ProductCard from '../components/ProductCard.jsx'
import { ProductCardSkeleton } from '../components/LoadingSkeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    wishlistService
      .list()
      .then((items) => setProducts(items.map((i) => i.product ?? i)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-suce section">
      <span className="eyebrow">Saved for later</span>
      <h2 className="mt-1 mb-4">Your wishlist</h2>

      {!loading && products.length === 0 ? (
        <EmptyState
          icon="bi-heart"
          title="Nothing saved yet"
          message="Tap the heart on any product to save it here."
          actionLabel="Shop the catalog"
          actionTo="/products"
        />
      ) : (
        <div className="row g-4">
          {(loading ? Array.from({ length: 4 }) : products).map((p, i) => (
            <div key={p?.id ?? i} className="col-6 col-md-4 col-lg-3">
              {loading ? <ProductCardSkeleton /> : <ProductCard product={p} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
