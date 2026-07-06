import { store } from './storage'
import { wait } from './utils'

function within30Days(dateStr) {
  const d = new Date(dateStr)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  return d >= cutoff
}

const adminApi = {
  async dashboardStats() {
    await wait(250)
    const orders = store.getOrders()
    const products = store.getProducts()
    const users = store.getUsers()

    const recent30 = orders.filter((o) => within30Days(o.createdAt))
    const revenueLast30Days = recent30.reduce((sum, o) => sum + o.totalAmount, 0)

    const unitsByProduct = {}
    orders.forEach((o) =>
      o.items.forEach((i) => {
        unitsByProduct[i.product.id] = (unitsByProduct[i.product.id] || 0) + i.quantity
      }),
    )
    const hasRealSales = Object.keys(unitsByProduct).length > 0

    const topProducts = [...products]
      .sort((a, b) =>
        hasRealSales
          ? (unitsByProduct[b.id] || 0) - (unitsByProduct[a.id] || 0)
          : b.reviewCount - a.reviewCount,
      )
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, unitsSold: hasRealSales ? unitsByProduct[p.id] || 0 : p.reviewCount }))

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        status: o.status,
        totalAmount: o.totalAmount,
      }))

    return {
      revenueLast30Days,
      revenueTrend: orders.length ? '+12% from last month' : null,
      ordersLast30Days: recent30.length,
      ordersTrend: orders.length ? '+4 from last month' : null,
      totalCustomers: users.filter((u) => u.role === 'CUSTOMER').length,
      lowStockCount: products.filter((p) => p.stockQuantity < 10).length,
      recentOrders,
      topProducts,
    }
  },

  async listOrders({ status } = {}) {
    await wait(250)
    let list = [...store.getOrders()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (status) list = list.filter((o) => o.status === status)
    return { content: list }
  },

  async updateOrderStatus(id, status) {
    await wait()
    const updated = store.getOrders().map((o) => (o.id === Number(id) ? { ...o, status } : o))
    store.setOrders(updated)
    return updated.find((o) => o.id === Number(id))
  },

  async listUsers({ search } = {}) {
    await wait(250)
    let list = store.getUsers()
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          `${u.firstName} ${u.lastName ?? ''}`.toLowerCase().includes(q),
      )
    }
    return { content: list }
  },

  async setUserEnabled(id, enabled) {
    await wait()
    const updated = store.getUsers().map((u) => (u.id === Number(id) ? { ...u, enabled } : u))
    store.setUsers(updated)
    return updated.find((u) => u.id === Number(id))
  },
}

export default adminApi
