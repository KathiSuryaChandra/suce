import { store } from './storage'
import { wait, demoError } from './utils'

const wishlistApi = {
  async list() {
    await wait(150)
    return store.getWishlist()
  },

  async add(productId) {
    await wait()
    const product = store.getProducts().find((p) => p.id === Number(productId))
    if (!product) throw demoError('Product not found', 404)
    const list = store.getWishlist()
    if (list.some((i) => i.product.id === product.id)) return list
    const next = [...list, { id: `wish-${product.id}`, product }]
    store.setWishlist(next)
    return next
  },

  async remove(productId) {
    await wait()
    const next = store.getWishlist().filter((i) => i.product.id !== Number(productId))
    store.setWishlist(next)
    return next
  },
}

export default wishlistApi
