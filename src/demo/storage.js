// ───────────────────────────────────────────────────────────────────────
// Tiny localStorage-backed "database" used only in demo mode, so cart,
// wishlist, orders, and admin edits persist across page refreshes during
// development without needing a real backend.
//
// WHERE TO CHANGE: nothing here needs editing to go live — once
// VITE_DEMO_MODE=false, none of this code path runs. To reset demo data
// during development, run `window.__suceResetDemo()` in the browser
// console, or clear localStorage keys prefixed `suce_demo_`.
// ───────────────────────────────────────────────────────────────────────

import { CATEGORIES, PRODUCTS, DEMO_USERS } from './seedData'

const KEYS = {
  products: 'suce_demo_products',
  categories: 'suce_demo_categories',
  cart: 'suce_demo_cart',
  wishlist: 'suce_demo_wishlist',
  orders: 'suce_demo_orders',
  users: 'suce_demo_users',
  session: 'suce_demo_session',
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private mode / quota) — demo state just
    // won't persist across refreshes, which is fine for a demo.
  }
  return value
}

function ensureSeeded() {
  if (localStorage.getItem(KEYS.products) === null) writeJSON(KEYS.products, PRODUCTS)
  if (localStorage.getItem(KEYS.categories) === null) writeJSON(KEYS.categories, CATEGORIES)
  if (localStorage.getItem(KEYS.users) === null) writeJSON(KEYS.users, DEMO_USERS)
  if (localStorage.getItem(KEYS.cart) === null) writeJSON(KEYS.cart, [])
  if (localStorage.getItem(KEYS.wishlist) === null) writeJSON(KEYS.wishlist, [])
  if (localStorage.getItem(KEYS.orders) === null) writeJSON(KEYS.orders, [])
}

ensureSeeded()

export const store = {
  getProducts: () => readJSON(KEYS.products, PRODUCTS),
  setProducts: (list) => writeJSON(KEYS.products, list),

  getCategories: () => readJSON(KEYS.categories, CATEGORIES),
  setCategories: (list) => writeJSON(KEYS.categories, list),

  getCart: () => readJSON(KEYS.cart, []),
  setCart: (list) => writeJSON(KEYS.cart, list),

  getWishlist: () => readJSON(KEYS.wishlist, []),
  setWishlist: (list) => writeJSON(KEYS.wishlist, list),

  getOrders: () => readJSON(KEYS.orders, []),
  setOrders: (list) => writeJSON(KEYS.orders, list),

  getUsers: () => readJSON(KEYS.users, DEMO_USERS),
  setUsers: (list) => writeJSON(KEYS.users, list),

  getSession: () => readJSON(KEYS.session, null),
  setSession: (session) => writeJSON(KEYS.session, session),
}

export function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

export function resetDemoData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  ensureSeeded()
}

if (typeof window !== 'undefined') {
  window.__suceResetDemo = resetDemoData
}
