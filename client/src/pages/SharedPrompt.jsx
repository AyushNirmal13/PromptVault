import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Copy, Check, Tag, User, Globe, Zap } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'

const SharedPrompt = () => {
  const { shareId } = useParams()
  const [prompt, setPrompt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/prompts/share/${shareId}`)
      .then((res) => setPrompt(res.data.prompt))
      .catch(() => setError('This prompt is not found or not public.'))
      .finally(() => setLoading(false))
  }, [shareId])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content)
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 text-center px-6">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Prompt Not Found</h2>
      <p className="text-zinc-500 dark:text-zinc-400">{error}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-zinc-900 dark:text-white text-lg">PromptVault</span>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="badge bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 capitalize mb-2 inline-flex">
                {prompt.category}
              </span>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{prompt.title}</h1>
              {prompt.description && (
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">{prompt.description}</p>
              )}
            </div>
            <span className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-100 dark:bg-surface-800 px-2 py-1 rounded-full">
              <Globe className="w-3 h-3" />
              Public
            </span>
          </div>

          {prompt.userId && (
            <div className="flex items-center gap-2">
              {prompt.userId.avatar && (
                <img src={prompt.userId.avatar} alt="" className="w-5 h-5 rounded-full" />
              )}
              <span className="text-sm text-zinc-500 dark:text-zinc-400">by {prompt.userId.name}</span>
            </div>
          )}

          <div className="bg-zinc-50 dark:bg-surface-800 rounded-xl p-4 font-mono text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
            {prompt.content}
          </div>

          {prompt.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-surface-800 text-zinc-600 dark:text-zinc-400 rounded-md text-xs">
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <button onClick={handleCopy} className="btn-primary w-full justify-center">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SharedPrompt
