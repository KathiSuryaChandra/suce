import api from './api'

const productService = {
  list: (params) => api.get('/products', { params }).then((r) => r.data),

  getById: (id) => api.get(`/products/${id}`).then((r) => r.data),

  getReviews: (id, params) =>
    api.get(`/products/${id}/reviews`, { params }).then((r) => r.data),

  addReview: (id, payload) =>
    api.post(`/products/${id}/reviews`, payload).then((r) => r.data),

  create: (payload) =>
    api.post('/products', payload).then((r) => r.data),

  update: (id, payload) =>
    api.put(`/products/${id}`, payload).then((r) => r.data),

  remove: (id) =>
    api.delete(`/products/${id}`).then((r) => r.data),

  uploadImages: (id, formData) =>
    api
      .post(`/products/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),
}

export default productService
