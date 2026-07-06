import api from './api'

const orderService = {
  place: (payload) =>
    api.post('/orders', payload).then((r) => r.data),

  list: (params) =>
    api.get('/orders', { params }).then((r) => r.data),

  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),

  cancel: (id) =>
    api.patch(`/orders/${id}/cancel`).then((r) => r.data),
}

export default orderService
