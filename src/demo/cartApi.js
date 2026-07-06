import { store } from './storage'
import { wait, demoError } from './utils'

function currentProduct(productId) {
  const product = store.getProducts().find((p) => p.id === Number(productId))
  if (!product) throw demoError('Product not found', 404)
  return product
}

const cartApi = {
  async get() {
    await wait(150)
    return { items: store.getCart() }
  },

  async addItem(productId, quantity = 1) {
    await wait()
    const product = currentProduct(productId)
    const cart = store.getCart()
    const existing = cart.find((i) => i.product.id === product.id)
    const next = existing
      ? cart.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        )
      : [...cart, { id: `cart-${product.id}`, product, quantity }]
    store.setCart(next)
    return { items: next }
  },

  async updateItem(itemId, quantity) {
    await wait()
    const next = store.getCart().map((i) => (i.id === itemId ? { ...i, quantity } : i))
    store.setCart(next)
    return { items: next }
  },

  async removeItem(itemId) {
    await wait()
    const next = store.getCart().filter((i) => i.id !== itemId)
    store.setCart(next)
    return { items: next }
  },

  async clear() {
    await wait()
    store.setCart([])
    return { items: [] }
  },
}

export default cartApi
