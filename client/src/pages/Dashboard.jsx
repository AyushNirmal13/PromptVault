import { useEffect, useState, useCallback } from 'react'
import { Plus, FileText, Loader2 } from 'lucide-react'
import { usePrompts } from '../hooks/usePrompts'
import PromptCard from '../components/PromptCard'
import PromptModal from '../components/PromptModal'
import SearchBar from '../components/SearchBar'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const {
    prompts, loading, total,
    fetchPrompts, searchPrompts,
    createPrompt, updatePrompt, deletePrompt,
    toggleFavorite, getVersionHistory,
  } = usePrompts()

  const [showModal, setShowModal] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    fetchPrompts({ category: activeCategory === 'all' ? undefined : activeCategory })
  }, [activeCategory])

  const handleSearch = useCallback((q, cat) => {
    searchPrompts(q, cat === 'all' ? undefined : cat)
  }, [searchPrompts])

  const handleFilter = useCallback((cat) => {
    setActiveCategory(cat)
    fetchPrompts({ category: cat === 'all' ? undefined : cat })
  }, [fetchPrompts])

  const handleSave = async (data) => {
    if (editingPrompt) {
      await updatePrompt(editingPrompt._id, data)
    } else {
      await createPrompt(data)
    }
  }

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirmDelete === id) {
      await deletePrompt(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
      toast('Click delete again to confirm', { icon: '⚠️' })
    }
  }

  const openCreate = () => {
    setEditingPrompt(null)
    setShowModal(true)
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-surface-900 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {total} prompt{total !== 1 ? 's' : ''} · Welcome back, {user?.name?.split(' ')[0]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={openCreate} className="btn-primary" id="create-prompt-btn">
            <Plus className="w-4 h-4" />
            New Prompt
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Search + Filter */}
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            onFilter={handleFilter}
            activeCategory={activeCategory}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && prompts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No prompts yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 max-w-xs">
              Create your first prompt to start building your AI toolkit.
            </p>
            <button onClick={openCreate} className="btn-primary">
              <Plus className="w-4 h-4" />
              Create your first prompt
            </button>
          </div>
        )}

        {/* Prompt grid */}
        {!loading && prompts.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt._id}
                prompt={prompt}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <PromptModal
          prompt={editingPrompt}
          onClose={() => { setShowModal(false); setEditingPrompt(null) }}
          onSave={handleSave}
          getVersionHistory={getVersionHistory}
        />
      )}
    </div>
  )
}

export default Dashboard
