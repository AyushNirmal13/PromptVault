import { useEffect, useState } from 'react'
import { Star, Loader2, Inbox } from 'lucide-react'
import { usePrompts } from '../hooks/usePrompts'
import PromptCard from '../components/PromptCard'
import PromptModal from '../components/PromptModal'
import ThemeToggle from '../components/ThemeToggle'
import toast from 'react-hot-toast'

const Favorites = () => {
  const {
    prompts, loading,
    fetchPrompts, updatePrompt, deletePrompt,
    toggleFavorite, getVersionHistory,
  } = usePrompts()

  const [showModal, setShowModal] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    fetchPrompts({ favorite: true })
  }, [])

  const handleSave = async (data) => {
    if (editingPrompt) await updatePrompt(editingPrompt._id, data)
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

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-surface-900 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            Favorites
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{prompts.length} starred prompt{prompts.length !== 1 ? 's' : ''}</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        )}

        {!loading && prompts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No favorites yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs">
              Star your most-used prompts to find them quickly here.
            </p>
          </div>
        )}

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

export default Favorites
