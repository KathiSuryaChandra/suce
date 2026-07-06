import { store, nextId } from './storage'
import { wait, demoError } from './utils'
import { effectivePrice, generateReviews } from './seedData'

// Reviews added during the session live here (not persisted to
// localStorage) — fine for a demo, since this is just UI polish.
const addedReviews = {}

function applySort(list, sort) {
  const sorted = [...list]
  switch (sort) {
    case 'price_asc':
      return sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b))
    case 'price_desc':
      return sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a))
    case 'rating':
      return sorted.sort((a, b) => b.averageRating - a.averageRating)
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}

function paginate(list, page = 0, size = 12) {
  const start = page * size
  const content = list.slice(start, start + size)
  return {
    content,
    totalPages: Math.max(1, Math.ceil(list.length / size)),
    totalElements: list.length,
    page,
    size,
  }
}

const productsApi = {
  async list({ search, categoryId, sort = 'newest', page = 0, size = 12 } = {}) {
    await wait()
    let list = store.getProducts()
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (categoryId) {
      list = list.filter((p) => p.category?.id === Number(categoryId))
    }
    list = applySort(list, sort)
    return paginate(list, page, size)
  },

  async getById(id) {
    await wait(200)
    const product = store.getProducts().find((p) => p.id === Number(id))
    if (!product) throw demoError('Product not found', 404)
    return product
  },

  async getReviews(id) {
    await wait(200)
    const product = store.getProducts().find((p) => p.id === Number(id))
    if (!product) return []
    const extra = addedReviews[id] || []
    return [...extra, ...generateReviews(product)]
  },

  async addReview(id, payload) {
    await wait()
    const review = {
      id: `${id}-new-${Date.now()}`,
      user: { firstName: 'You' },
      rating: payload.rating,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
    }
    addedReviews[id] = [review, ...(addedReviews[id] || [])]
    return review
  },

  async create(payload) {
    await wait()
    const list = store.getProducts()
    const categories = store.getCategories()
    const product = {
      id: nextId(list),
      name: payload.name,
      description: payload.description,
      price: payload.price,
      discountPrice: payload.discountPrice,
      stockQuantity: payload.stockQuantity,
      sku: payload.sku,
      sizes: [],
      category: categories.find((c) => c.id === Number(payload.categoryId)) || null,
      brand: { id: 1, name: 'SUCE Label' },
      images: [], // no upload UI yet — ProductCard falls back to a placeholder icon
      averageRating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    }
    store.setProducts([product, ...list])
    return product
  },

  async update(id, payload) {
    await wait()
    const list = store.getProducts()
    const categories = store.getCategories()
    const updated = list.map((p) =>
      p.id === Number(id)
        ? {
            ...p,
            name: payload.name,
            description: payload.description,
            price: payload.price,
            discountPrice: payload.discountPrice,
            stockQuantity: payload.stockQuantity,
            sku: payload.sku,
            category: categories.find((c) => c.id === Number(payload.categoryId)) || p.category,
          }
        : p,
    )
    store.setProducts(updated)
    return updated.find((p) => p.id === Number(id))
  },

  async remove(id) {
    await wait()
    // Real backend soft-deletes (is_active flag) to preserve order history;
    // the demo just removes it from the local list for simplicity.
    store.setProducts(store.getProducts().filter((p) => p.id !== Number(id)))
    return { success: true }
  },

  async uploadImages() {
    await wait()
    throw demoError('Image upload isn\'t wired up in demo mode yet.', 501)
  },
}

export default productsApi
