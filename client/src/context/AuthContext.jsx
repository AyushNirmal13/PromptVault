import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pv_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('pv_token')
    if (!token) {
      setLoading(false)
      return
    }
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user)
        localStorage.setItem('pv_user', JSON.stringify(res.data.user))
      })
      .catch(() => {
        localStorage.removeItem('pv_token')
        localStorage.removeItem('pv_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credential) => {
    const res = await api.post('/auth/google', { credential })
    const { token, user } = res.data
    localStorage.setItem('pv_token', token)
    localStorage.setItem('pv_user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('pv_token')
    localStorage.removeItem('pv_user')
    setUser(null)
  }, [])

  const addCustomCategory = useCallback(async (label, color) => {
    const res = await api.post('/auth/categories', { label, color })
    const newCategory = res.data.category
    setUser(prev => {
      const updated = { ...prev, customCategories: [...(prev.customCategories || []), newCategory] }
      localStorage.setItem('pv_user', JSON.stringify(updated))
      return updated
    })
    return newCategory
  }, [])

  const removeCategory = useCallback(async (value) => {
    await api.delete(`/auth/categories/${value}`)
    setUser(prev => {
      const isCustom = prev.customCategories?.some(c => c.value === value);
      let updated;
      if (isCustom) {
        updated = {
          ...prev,
          customCategories: prev.customCategories.filter(c => c.value !== value)
        }
      } else {
        updated = {
          ...prev,
          hiddenCategories: [...(prev.hiddenCategories || []), value]
        }
      }
      localStorage.setItem('pv_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, addCustomCategory, removeCategory }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
