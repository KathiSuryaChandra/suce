import api from './api'

const adminService = {
  dashboardStats: () =>
    api.get('/admin/dashboard/stats').then((r) => r.data),

  listOrders: (params) =>
    api.get('/admin/orders', { params }).then((r) => r.data),

  updateOrderStatus: (id, status) =>
    api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data),

  listUsers: (params) =>
    api.get('/admin/users', { params }).then((r) => r.data),

  setUserEnabled: (id, enabled) =>
    api.patch(`/admin/users/${id}`, { enabled }).then((r) => r.data),
}

export default adminService
