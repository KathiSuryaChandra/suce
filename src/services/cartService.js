import api from './api'

const cartService = {
  get: () => api.get('/cart').then((r) => r.data),

  addItem: (productId, quantity = 1) =>
    api.post('/cart/items', { productId, quantity }).then((r) => r.data),

  updateItem: (itemId, quantity) =>
    api.put(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),

  removeItem: (itemId) =>
    api.delete(`/cart/items/${itemId}`).then((r) => r.data),

  clear: () => api.delete('/cart').then((r) => r.data),
}

export default cartService