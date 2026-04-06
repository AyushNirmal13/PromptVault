import { useState, useCallback } from 'react'
import api from '../api'
import toast from 'react-hot-toast'

export const usePrompts = () => {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchPrompts = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await api.get('/prompts', { params })
      setPrompts(res.data.prompts)
      setTotal(res.data.total)
    } catch (err) {
      toast.error('Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }, [])

  const searchPrompts = useCallback(async (q, category) => {
    if (!q.trim()) return fetchPrompts({ category })
    setLoading(true)
    try {
      const res = await api.get('/prompts/search', { params: { q, category } })
      setPrompts(res.data.prompts)
      setTotal(res.data.prompts.length)
    } catch (err) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }, [fetchPrompts])

  const createPrompt = useCallback(async (data) => {
    const res = await api.post('/prompts', data)
    setPrompts((prev) => [res.data.prompt, ...prev])
    setTotal((t) => t + 1)
    toast.success('Prompt created!')
    return res.data.prompt
  }, [])

  const updatePrompt = useCallback(async (id, data) => {
    const res = await api.put(`/prompts/${id}`, data)
    setPrompts((prev) => prev.map((p) => (p._id === id ? res.data.prompt : p)))
    toast.success('Prompt updated!')
    return res.data.prompt
  }, [])

  const deletePrompt = useCallback(async (id) => {
    await api.delete(`/prompts/${id}`)
    setPrompts((prev) => prev.filter((p) => p._id !== id))
    setTotal((t) => t - 1)
    toast.success('Prompt deleted')
  }, [])

  const toggleFavorite = useCallback(async (id) => {
    const res = await api.put(`/prompts/${id}/favorite`)
    setPrompts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isFavorite: res.data.isFavorite } : p))
    )
  }, [])

  const exportPrompts = useCallback(async () => {
    const res = await api.get('/prompts/export', { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'promptvault-export.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Prompts exported!')
  }, [])

  const importPrompts = useCallback(async (file) => {
    const text = await file.text()
    const json = JSON.parse(text)
    const data = json.prompts || json
    const res = await api.post('/prompts/import', { prompts: data })
    toast.success(`Imported ${res.data.imported} prompts!`)
    return res.data.imported
  }, [])

  const sharePrompt = useCallback(async (id, isPublic) => {
    const res = await api.put(`/prompts/${id}`, { isPublic })
    setPrompts((prev) => prev.map((p) => (p._id === id ? res.data.prompt : p)))
    return res.data.prompt
  }, [])

  const getVersionHistory = useCallback(async (id) => {
    const res = await api.get(`/prompts/${id}/history`)
    return res.data.history
  }, [])

  return {
    prompts, loading, total,
    fetchPrompts, searchPrompts,
    createPrompt, updatePrompt, deletePrompt,
    toggleFavorite, exportPrompts, importPrompts,
    sharePrompt, getVersionHistory,
  }
}
