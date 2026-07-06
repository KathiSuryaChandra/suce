import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { ProductCardSkeleton } from '../components/LoadingSkeleton.jsx'
import CategoryFilter from '../components/CategoryFilter.jsx'
import Pagination from '../components/Pagination.jsx'
import EmptyState from '../components/EmptyState.jsx'
import productService from '../services/productService'
import categoryService from '../services/categoryService'
import { useDebounce } from '../hooks/useDebounce'

const PAGE_SIZE = 12

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category') ? Number(searchParams.get('category')) : null
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page') || 0)

  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 400)

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateParams({ search: debouncedSearch || undefined, page: undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  useEffect(() => {
    let active = true
    setLoading(true)
    productService
      .list({
        search: search || undefined,
        categoryId: categoryId || undefined,
        sort,
        page,
        size: PAGE_SIZE,
      })
      .then((res) => {
        if (!active) return
        setProducts(res.content ?? res)
        setTotalPages(res.totalPages ?? 1)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [search, categoryId, sort, page])

  function updateParams(patch) {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') next.delete(key)
      else next.set(key, value)
    })
    setSearchParams(next)
  }

  const heading = useMemo(() => {
    if (search) return `Results for "${search}"`
    const cat = categories.find((c) => c.id === categoryId)
    return cat ? cat.name : 'All products'
  }, [search, categoryId, categories])

  return (
    <div className="container-suce section">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <span className="eyebrow">Catalog</span>
          <h2 className="mt-1 mb-0">{heading}</h2>
        </div>
        <button className="btn btn-suce-outline d-lg-none" onClick={() => setFiltersOpen((o) => !o)}>
          <i className="bi bi-sliders" /> Filters
        </button>
      </div>

      <div className="row g-4">
        <aside className={`col-lg-3 ${filtersOpen ? '' : 'd-none d-lg-block'}`}>
          <div className="mb-4">
            <label className="form-label-suce" htmlFor="search">Search</label>
            <input
              id="search"
              className="form-control-suce"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <CategoryFilter
            categories={categories}
            selectedId={categoryId}
            onSelect={(id) => updateParams({ category: id ?? undefined, page: undefined })}
          />
        </aside>

        <section className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
              {loading ? 'Loading…' : `${products.length} of ${totalPages * PAGE_SIZE} shown`}
            </span>
            <select
              className="form-select-suce"
              style={{ width: 180 }}
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value, page: undefined })}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          {!loading && products.length === 0 ? (
            <EmptyState
              icon="bi-search"
              title="No products found"
              message="Try a different search term or clear your filters."
            />
          ) : (
            <div className="row g-4">
              {(loading ? Array.from({ length: PAGE_SIZE }) : products).map((p, i) => (
                <div key={p?.id ?? i} className="col-6 col-md-4">
                  {loading ? <ProductCardSkeleton /> : <ProductCard product={p} />}
                </div>
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParams({ page: p })} />
        </section>
      </div>
    </div>
  )
}
