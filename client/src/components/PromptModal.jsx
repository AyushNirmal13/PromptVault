import { useEffect, useState } from 'react'
import { X, Plus, Tag, Loader2, Globe, History, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

import { useCategories } from '../hooks/useCategories'

const DEFAULT_FORM = {
  title: '',
  description: '',
  content: '',
  tags: [],
  category: 'other',
  isFavorite: false,
  isPublic: false,
}

const PromptModal = ({ prompt, onClose, onSave, getVersionHistory }) => {
  const categories = useCategories()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const isEdit = Boolean(prompt)

  useEffect(() => {
    if (prompt) {
      setForm({
        title: prompt.title || '',
        description: prompt.description || '',
        content: prompt.content || '',
        tags: prompt.tags || [],
        category: prompt.category || 'other',
        isFavorite: prompt.isFavorite || false,
        isPublic: prompt.isPublic || false,
      })
    } else {
      setForm(DEFAULT_FORM)
    }
  }, [prompt])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase().replace(/,/g, '')
      if (!form.tags.includes(tag)) {
        setForm((f) => ({ ...f, tags: [...f.tags, tag] }))
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.content.trim()) return toast.error('Prompt content is required')
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const loadHistory = async () => {
    if (!prompt?._id) return
    setLoadingHistory(true)
    try {
      const h = await getVersionHistory(prompt._id)
      setHistory(h || [])
      setShowHistory(true)
    } catch {
      toast.error('Could not load history')
    } finally {
      setLoadingHistory(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {isEdit ? 'Edit Prompt' : 'New Prompt'}
          </h2>
          <div className="flex items-center gap-2">
            {isEdit && (
              <button
                onClick={loadHistory}
                className="btn-ghost text-xs"
                disabled={loadingHistory}
              >
                {loadingHistory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <History className="w-3.5 h-3.5" />}
                History
              </button>
            )}
            <button onClick={onClose} className="btn-ghost p-1.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Version history panel */}
        {showHistory && history.length > 0 && (
          <div className="px-6 py-3 bg-zinc-50 dark:bg-surface-800/50 border-b border-zinc-100 dark:border-zinc-800 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Version History ({history.length})</p>
              <button onClick={() => setShowHistory(false)} className="text-xs text-zinc-400 hover:text-zinc-600">✕</button>
            </div>
            <div className="space-y-2">
              {[...history].reverse().map((v, i) => (
                <div key={i} className="flex items-start justify-between p-2 bg-white dark:bg-surface-800 rounded-lg border border-zinc-100 dark:border-zinc-700 text-xs">
                  <div>
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">{v.title}</p>
                    <p className="text-zinc-400 mt-0.5">{v.content?.slice(0, 60)}...</p>
                  </div>
                  <button
                    className="text-primary-600 hover:underline ml-2 flex-shrink-0"
                    onClick={() => setForm((f) => ({ ...f, title: v.title, content: v.content, description: v.description, tags: v.tags, category: v.category }))}
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input"
              placeholder="e.g. Professional Email Writer"
              maxLength={200}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input"
              placeholder="Brief description of what this prompt does"
              maxLength={500}
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="input"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="label">Prompt Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="input resize-none font-mono text-sm"
              placeholder="Write your AI prompt here... Use {{variable}} for dynamic parts."
              rows={8}
            />
            <p className="text-xs text-zinc-400 mt-1">{form.content.length} characters</p>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags</label>
            <div className="input flex flex-wrap gap-1.5 min-h-[40px] cursor-text" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
              {form.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-md text-xs font-medium">
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400"
                placeholder={form.tags.length === 0 ? 'Add tags (press Enter)' : ''}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFavorite}
                onChange={(e) => setForm((f) => ({ ...f, isFavorite: e.target.checked }))}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Favorite</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Public (shareable link)
              </span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-surface-800/30">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Prompt'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PromptModal
