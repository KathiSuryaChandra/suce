import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { ProductCardSkeleton } from '../components/LoadingSkeleton.jsx'
import categoryService from '../services/categoryService'
import productService from '../services/productService'

const TRUST_ITEMS = [
  { icon: 'bi-truck', label: 'Free shipping over ₹999' },
  { icon: 'bi-arrow-repeat', label: '7-day easy returns' },
  { icon: 'bi-cash-coin', label: 'Cash on delivery available' },
  { icon: 'bi-shield-check', label: '100% secure payments' },
]

const TESTIMONIALS = [
  { quote: "The cotton saree fits like it was tailored — I've already reordered two more colors.", name: 'Ananya R.', tag: 'Verified buyer · Sarees' },
  { quote: 'Ordered the kids festive lehenga for a wedding — held up through an entire day of dancing.', name: 'Naveen K.', tag: 'Verified buyer · Kids Wear' },
  { quote: 'Finally a kurti brand that fits true to size. The fabric feels properly mid-weight, not see-through.', name: 'Priya S.', tag: 'Verified buyer · Kurtis & Suits' },
]

function effectivePrice(p) {
  return p.discountPrice ?? p.price
}

function ProductRow({ title, subtitle, linkTo, linkLabel, loading, products, scroll }) {
  return (
    <section className="section pt-0">
      <div className="container-suce">
        <div className="d-flex align-items-end justify-content-between mb-4">
          <div>
            {subtitle && <span className="eyebrow">{subtitle}</span>}
            <h2 className="mt-1 mb-0">{title}</h2>
          </div>
          {linkTo && (
            <Link to={linkTo} className="suce-nav-link" style={{ color: 'var(--suce-ink)' }}>
              {linkLabel || 'View all'} <i className="bi bi-arrow-right ms-1" />
            </Link>
          )}
        </div>
        {scroll ? (
          <div className="scroll-row">
            {(loading ? Array.from({ length: 6 }) : products).map((p, i) => (
              <div key={p ? p.id : i}>{loading ? <ProductCardSkeleton /> : <ProductCard product={p} />}</div>
            ))}
          </div>
        ) : (
          <div className="row g-4">
            {(loading ? Array.from({ length: 8 }) : products).map((p, i) => (
              <div key={p ? p.id : i} className="col-6 col-md-4 col-lg-3">
                {loading ? <ProductCardSkeleton /> : <ProductCard product={p} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default function Home() {
  const [categories, setCategories] = useState([])
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productService.list({ page: 0, size: 60, sort: 'newest' }),
          categoryService.list(),
        ])
        if (!active) return
        setCatalog(productsRes.content || productsRes)
        setCategories(categoriesRes)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const newArrivals     = catalog.slice(0, 8)
  const underBudget     = catalog.filter((p) => effectivePrice(p) <= 499).slice(0, 8)
  const premiumEdit     = catalog.filter((p) => effectivePrice(p) >= 999).slice(0, 8)
  const trending        = [...catalog]
    .sort((a, b) => b.averageRating * b.reviewCount - a.averageRating * a.reviewCount)
    .slice(0, 6)

  return (
    <div>
      <Hero categories={categories} />

      {/* ── Trust strip ─────────────────────────────────────────── */}
      <section className="section pb-0">
        <div className="container-suce">
          <div className="trust-strip">
            {TRUST_ITEMS.map((t) => (
              <div className="trust-item" key={t.label}>
                <i className={'bi ' + t.icon} />
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category pills ──────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="section pb-0">
          <div className="container-suce">
            <span className="eyebrow">Shop by category</span>
            <div className="d-flex flex-wrap gap-2 mt-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={'/products?category=' + c.id}
                  className="btn btn-suce-outline"
                  style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── New arrivals grid ───────────────────────────────────── */}
      <ProductRow
        title="New arrivals"
        subtitle="Just in"
        linkTo="/products?sort=newest"
        loading={loading}
        products={newArrivals}
      />

      {/* ── Under ₹499 scroller ─────────────────────────────────── */}
      <section className="section pt-0 pb-2">
        <div className="container-suce">
          <div
            className="d-flex align-items-center gap-4 p-4 mb-4"
            style={{ background: 'var(--suce-ink)', borderRadius: 4 }}
          >
            <div className="flex-grow-1">
              <span className="eyebrow" style={{ color: '#b8bcc2' }}>Everyday edit</span>
              <h3 className="mt-1 mb-1" style={{ color: '#fff' }}>Under ₹499</h3>
              <p className="mb-0" style={{ color: '#b8bcc2', fontSize: '0.88rem' }}>
                Sarees, kurtis, kids wear — dressed well, spent sensibly.
              </p>
            </div>
            <Link
              to="/products?sort=price_asc"
              className="btn flex-shrink-0"
              style={{ background: '#fff', color: 'var(--suce-ink)', borderRadius: 2, fontSize: '0.85rem' }}
            >
              Shop all
            </Link>
          </div>
        </div>
      </section>
      <ProductRow
        title=""
        loading={loading}
        products={underBudget}
        scroll
      />

      {/* ── Premium edit grid ───────────────────────────────────── */}
      <ProductRow
        title="The premium edit"
        subtitle="₹999 and up"
        linkTo="/products?sort=price_desc"
        linkLabel="Shop premium"
        loading={loading}
        products={premiumEdit}
      />

      {/* ── Trending scroller ───────────────────────────────────── */}
      <ProductRow
        title="Trending now"
        subtitle="Most loved"
        linkTo="/products?sort=rating"
        loading={loading}
        products={trending}
        scroll
      />

      {/* ── Brand statement ─────────────────────────────────────── */}
      <section className="section pt-0">
        <div className="container-suce">
          <div className="surface-charcoal rounded p-5 text-center">
            <span className="eyebrow" style={{ color: '#b8bcc2' }}>The SUCE standard</span>
            <h3 className="mt-2 mb-3" style={{ color: '#fff' }}>Every piece earns its place</h3>
            <p style={{ color: '#b8bcc2', maxWidth: 520, margin: '0 auto' }}>
              From everyday cottons to festive silks, each piece is chosen for fabric,
              fit, and finishing that holds up well past the first wash.
            </p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section className="section pt-0">
        <div className="container-suce">
          <div className="text-center mb-4">
            <span className="eyebrow">Customer love</span>
            <h2 className="mt-1 mb-0">What people are saying</h2>
          </div>
          <div className="row g-4">
            {TESTIMONIALS.map((t) => (
              <div className="col-md-4" key={t.name}>
                <div className="testimonial-card">
                  <i className="bi bi-quote" style={{ fontSize: '1.4rem', color: 'var(--suce-silver)' }} />
                  <p className="testimonial-quote my-3">"{t.quote}"</p>
                  <span className="eyebrow">{t.name} — {t.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
