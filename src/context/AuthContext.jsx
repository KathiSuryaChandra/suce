import { createContext, useCallback, useEffect, useState } from 'react'
import authService from '../services/authService'
import { setAccessToken } from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, try to silently refresh using the httpOnly refresh
  // cookie. If there's no valid session, this just fails quietly and the
  // user lands in a logged-out state — no error shown.
  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      try {
        const { accessToken, user: refreshedUser } = await authService.refresh()
        if (cancelled) return
        setAccessToken(accessToken)
        setUser(refreshedUser)
      } catch {
        setAccessToken(null)
        setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { accessToken, user: loggedInUser } = await authService.login({ email, password })
    setAccessToken(accessToken)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const register = useCallback(async (payload) => {
    const { accessToken, user: newUser } = await authService.register(payload)
    setAccessToken(accessToken)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev))
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
