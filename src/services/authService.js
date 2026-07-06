import api from './api'

const authService = {
  register: (payload) =>
    api.post('/auth/register', payload).then((r) => r.data),

  login: (payload) =>
    api.post('/auth/login', payload).then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  refresh: () => api.post('/auth/refresh', {}).then((r) => r.data),

  me: () => api.get('/auth/me').then((r) => r.data),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (payload) =>
    api.post('/auth/reset-password', payload).then((r) => r.data),

  updateProfile: (payload) =>
    api.put('/users/me', payload).then((r) => r.data),

  changePassword: (payload) =>
    api.put('/users/me/password', payload).then((r) => r.data),
}

export default authService
