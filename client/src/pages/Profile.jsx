import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePrompts } from '../hooks/usePrompts'
import ThemeToggle from '../components/ThemeToggle'
import { User, Mail, Calendar, Zap, Star, Tag, FileText } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import api from '../api'

const Profile = () => {
  const { user } = useAuth()
  const { prompts, fetchPrompts, total } = usePrompts()
  const categories = useCategories()
  const [stats, setStats] = useState({ total: 0, favorites: 0, categories: {} })

  // Build a fast lookup map for colors
  const categoryColorMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.value] = cat.color;
      return acc;
    }, {})
  }, [categories])

  useEffect(() => {
    fetchPrompts({ limit: 1000 })
  }, [])

  useEffect(() => {
    const catMap = {}
    let favCount = 0
    prompts.forEach((p) => {
      catMap[p.category] = (catMap[p.category] || 0) + 1
      if (p.isFavorite) favCount++
    })
    setStats({ total: prompts.length, favorites: favCount, categories: catMap })
  }, [prompts])

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A'

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-surface-900 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Profile</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Your account overview</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="max-w-2xl space-y-6">
          {/* Avatar card */}
          <div className="card p-6 flex items-center gap-5">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=128`}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl shadow-md"
            />
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{user?.name}</h2>
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                <Calendar className="w-3 h-3" />
                Member since {joinedDate}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Prompts', value: stats.total, icon: <FileText className="w-5 h-5 text-primary-500" />, bg: 'bg-primary-50 dark:bg-primary-900/20' },
              { label: 'Favorites', value: stats.favorites, icon: <Star className="w-5 h-5 text-amber-400" />, bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { label: 'Categories', value: Object.keys(stats.categories).length, icon: <Tag className="w-5 h-5 text-violet-500" />, bg: 'bg-violet-50 dark:bg-violet-900/20' },
            ].map((s) => (
              <div key={s.label} className="card p-4 flex flex-col items-center text-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                  {s.icon}
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          {Object.keys(stats.categories).length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Prompts by Category</h3>
              <div className="space-y-3">
                {Object.entries(stats.categories)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${categoryColorMap[cat] || 'bg-zinc-400'}`} />
                      <span className="flex-1 text-sm capitalize text-zinc-700 dark:text-zinc-300">{cat}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${categoryColorMap[cat] || 'bg-zinc-400'}`}
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500 w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
