import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tag, Loader2 } from 'lucide-react'
import { usePrompts } from '../hooks/usePrompts'
import { useCategories } from '../hooks/useCategories'
import PromptCard from '../components/PromptCard'
import PromptModal from '../components/PromptModal'
import ThemeToggle from '../components/ThemeToggle'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCat = searchParams.get('cat') || 'all'
  const categories = useCategories()

  const allCategoriesList = [{ label: 'All', value: 'all', color: 'bg-zinc-500', icon: '✦' }, ...categories]

  const {
    prompts, loading, total,
    fetchPrompts, updatePrompt, deletePrompt,
    toggleFavorite, getVersionHistory,
  } = usePrompts()

  const [editingPrompt, setEditingPrompt] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    fetchPrompts({ category: activeCat === 'all' ? undefined : activeCat })
  }, [activeCat])

  const handleSave = async (data) => {
    if (editingPrompt) await updatePrompt(editingPrompt._id, data)
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

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-surface-900 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary-500" />
            Categories
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{total} prompt{total !== 1 ? 's' : ''} in {activeCat === 'all' ? 'all categories' : activeCat}</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {allCategoriesList.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSearchParams({ cat: cat.value })}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                activeCat === cat.value
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-200 dark:shadow-primary-900'
                  : 'bg-white dark:bg-surface-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-primary-200 dark:hover:border-primary-700'
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        )}

        {!loading && prompts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4 text-3xl">
              {allCategoriesList.find((c) => c.value === activeCat)?.icon || '📂'}
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No prompts in this category</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Create a prompt and assign it to this category.</p>
          </div>
        )}

        {!loading && prompts.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt._id}
                prompt={prompt}
                onEdit={(p) => { setEditingPrompt(p); setShowModal(true) }}
                onDelete={handleDelete}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

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

export default Categories
