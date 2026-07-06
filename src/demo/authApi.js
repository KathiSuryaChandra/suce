import { store, nextId } from './storage'
import { wait, demoError } from './utils'

function fakeToken(user) {
  return `demo-token.${user.id}.${Date.now()}`
}

function findUserByEmail(email) {
  return store.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

const authApi = {
  async login({ email, password }) {
    await wait(350)
    if (!password) throw demoError('Password is required')
    const user = findUserByEmail(email)
    if (!user) {
      throw demoError(
        'No demo account with that email. Try customer@suce.demo or admin@suce.demo (any password works).',
      )
    }
    if (!user.enabled) throw demoError('This account has been disabled', 403)
    store.setSession({ userId: user.id })
    return { accessToken: fakeToken(user), user }
  },

  async register({ firstName, lastName, email, password }) {
    await wait(400)
    if (!password) throw demoError('Password is required')
    if (findUserByEmail(email)) throw demoError('An account with this email already exists')
    const users = store.getUsers()
    const user = {
      id: nextId(users),
      firstName,
      lastName,
      email,
      phone: '',
      role: 'CUSTOMER',
      enabled: true,
      createdAt: new Date().toISOString(),
    }
    store.setUsers([...users, user])
    store.setSession({ userId: user.id })
    return { accessToken: fakeToken(user), user }
  },

  async refresh() {
    await wait(200)
    const session = store.getSession()
    if (!session) throw demoError('No active session', 401)
    const user = store.getUsers().find((u) => u.id === session.userId)
    if (!user || !user.enabled) {
      store.setSession(null)
      throw demoError('Session expired', 401)
    }
    return { accessToken: fakeToken(user), user }
  },

  async logout() {
    await wait(100)
    store.setSession(null)
    return { success: true }
  },

  async me() {
    await wait(150)
    const session = store.getSession()
    if (!session) throw demoError('Not signed in', 401)
    return store.getUsers().find((u) => u.id === session.userId)
  },

  async forgotPassword() {
    await wait(400)
    // Demo always "succeeds" — matches the real backend's intentional
    // behavior of not revealing whether an email is registered.
    return { success: true }
  },

  async resetPassword() {
    await wait(300)
    return { success: true }
  },

  async updateProfile(payload) {
    await wait()
    const session = store.getSession()
    if (!session) throw demoError('Not signed in', 401)
    const updated = store.getUsers().map((u) =>
      u.id === session.userId ? { ...u, ...payload } : u,
    )
    store.setUsers(updated)
    return updated.find((u) => u.id === session.userId)
  },

  async changePassword() {
    await wait(300)
    // No real password is stored in demo mode — this just simulates success.
    return { success: true }
  },
}

export default authApi
