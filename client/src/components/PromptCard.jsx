import { useState } from 'react'
import {
  Copy, Star, Pencil, Trash2, Share2, Check,
  Clock, ChevronDown, Tag, History,
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import api from '../api'
import { useCategories } from '../hooks/useCategories'

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const PromptCard = ({ prompt, onEdit, onDelete, onToggleFavorite }) => {
  const categories = useCategories()
  const categoryColor = categories.find(c => c.value === prompt.category)?.color || 'bg-zinc-500'
  
  // Custom colors from tailwind usually look like "bg-fuchsia-500". For a badge we might adapt it:
  // For simplicity we just use the raw color class + light text. We can append text-white if it's a solid tailwind color.
  const badgeColorClass = categoryColor.includes('zinc-500') 
    ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
    : `${categoryColor} bg-opacity-20 text-[${categoryColor.replace('bg-', '')}] dark:bg-opacity-30 dark:text-[${categoryColor.replace('bg-', '').replace('500', '400')}] text-primary-700`

  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopied(true)
      // Track usage
      api.put(`/prompts/${prompt._id}/use`).catch(() => {})
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleShare = async () => {
    if (prompt.shareId) {
      const url = `${window.location.origin}/share/${prompt.shareId}`
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied!')
    } else {
      toast.error('Enable sharing in Edit to get a link')
    }
  }

  const isLong = prompt.content.length > 200

  return (
    <div className="card p-5 group transition-all duration-200 hover:shadow-md hover:border-primary-100 dark:hover:border-primary-900/50 animate-fade-in">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={clsx('badge text-white shadow-sm', categoryColor)}>
              {prompt.category}
            </span>
            {prompt.isFavorite && (
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            )}
            {prompt.isPublic && (
              <span className="badge bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                public
              </span>
            )}
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{prompt.title}</h3>
          {prompt.description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{prompt.description}</p>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={() => onToggleFavorite(prompt._id)}
          className={clsx(
            'flex-shrink-0 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100',
            prompt.isFavorite
              ? 'opacity-100 text-amber-400 hover:text-amber-500'
              : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-400'
          )}
          title={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={clsx('w-4 h-4', prompt.isFavorite && 'fill-current')} />
        </button>
      </div>

      {/* Content preview */}
      <div className="mt-3">
        <div
          className={clsx(
            'relative bg-zinc-50 dark:bg-surface-800/60 rounded-lg p-3 text-sm text-zinc-700 dark:text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap break-words',
            !expanded && isLong && 'max-h-24 overflow-hidden'
          )}
        >
          {prompt.content}
          {!expanded && isLong && (
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-50 dark:from-surface-800/60 to-transparent rounded-b-lg" />
          )}
        </div>
        {isLong && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-1 text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <ChevronDown className={clsx('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {prompt.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-surface-800 text-zinc-600 dark:text-zinc-400 rounded-md text-xs">
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
          <Clock className="w-3 h-3" />
          {formatDate(prompt.updatedAt)}
          {prompt.usageCount > 0 && (
            <span className="ml-2">· used {prompt.usageCount}×</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="btn-ghost px-2 py-1.5 text-xs" title="Copy">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={handleShare} className="btn-ghost px-2 py-1.5 text-xs" title="Share">
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onEdit(prompt)} className="btn-ghost px-2 py-1.5 text-xs" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(prompt._id)} className="btn-ghost px-2 py-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PromptCard
