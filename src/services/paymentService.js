import api from './api'

const paymentService = {
  createOrder: (orderId, gateway) =>
    api.post('/payments/create-order', { orderId, gateway }).then((r) => r.data),

  verify: (payload) =>
    api.post('/payments/verify', payload).then((r) => r.data),
}

export default paymentService
