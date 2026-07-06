import { store, nextId } from './storage'
import { wait, demoError } from './utils'
import { effectivePrice } from './seedData'

function currentUser() {
  const session = store.getSession()
  if (!session) throw demoError('Not signed in', 401)
  return store.getUsers().find((u) => u.id === session.userId) || null
}

const ordersApi = {
  async place(payload) {
    await wait(400)
    const user = currentUser()
    const products = store.getProducts()

    const items = payload.items.map((line) => {
      const product = products.find((p) => p.id === Number(line.productId))
      if (!product) throw demoError('One of the items in your cart is no longer available', 409)
      if (product.stockQuantity < line.quantity) {
        throw demoError(`${product.name} doesn't have enough stock left`, 409)
      }
      return {
        id: `${product.id}-${Date.now()}`,
        product: { id: product.id, name: product.name },
        productName: product.name,
        quantity: line.quantity,
        priceAtPurchase: effectivePrice(product),
      }
    })

    // Decrement stock, same rule the real backend applies at order time.
    store.setProducts(
      products.map((p) => {
        const line = items.find((i) => i.product.id === p.id)
        return line ? { ...p, stockQuantity: Math.max(0, p.stockQuantity - line.quantity) } : p
      }),
    )

    const totalAmount = items.reduce((sum, i) => sum + i.priceAtPurchase * i.quantity, 0)
    const orders = store.getOrders()
    const order = {
      id: nextId(orders),
      orderNumber: `SUCE${100000 + nextId(orders)}`,
      userId: user?.id,
      customerName: user ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'Guest',
      status: 'PENDING',
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentMethod === 'COD' ? 'Pending' : 'Paid',
      shippingAddress: payload.shippingAddress,
      items,
      totalAmount,
      createdAt: new Date().toISOString(),
    }
    store.setOrders([order, ...orders])
    return order
  },

  async list() {
    await wait(200)
    const user = currentUser()
    const mine = store
      .getOrders()
      .filter((o) => o.userId === user?.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return { content: mine }
  },

  async getById(id) {
    await wait(150)
    const order = store.getOrders().find((o) => o.id === Number(id))
    if (!order) throw demoError('Order not found', 404)
    return order
  },

  async cancel(id) {
    await wait()
    const orders = store.getOrders()
    const updated = orders.map((o) => (o.id === Number(id) ? { ...o, status: 'CANCELLED' } : o))
    store.setOrders(updated)
    return updated.find((o) => o.id === Number(id))
  },
}

export default ordersApi
