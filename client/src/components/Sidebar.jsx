import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Star, Tag, User, LogOut, Zap, Download, Upload, Plus, X, Loader2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const TAILWIND_COLORS = [
  'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-indigo-500', 
  'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500', 'bg-lime-500'
]

const Sidebar = ({ onExport, onImport }) => {
  const { user, logout, addCustomCategory, removeCategory } = useAuth()
  const categories = useCategories()
  const navigate = useNavigate()

  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState(TAILWIND_COLORS[0])
  const [addingCat, setAddingCat] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return toast.error('Category name required')
    setAddingCat(true)
    try {
      await addCustomCategory(newCatName.trim(), newCatColor)
      toast.success('Category created')
      setNewCatName('')
      setShowAddCat(false)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create category')
    } finally {
      setAddingCat(false)
    }
  }

  return (
    <aside className="w-64 flex-shrink-0 h-screen flex flex-col bg-white dark:bg-surface-900 border-r border-zinc-100 dark:border-zinc-800">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-sm shadow-primary-200 dark:shadow-primary-900">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-zinc-900 dark:text-white text-lg tracking-tight">PromptVault</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <NavLink to="/dashboard" className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}>
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}>
          <Star className="w-4 h-4" /> Favorites
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}>
          <Tag className="w-4 h-4" /> Categories
        </NavLink>

        {/* Categories list */}
        <div className="pt-4 pb-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Categories</p>
            <button 
              onClick={() => setShowAddCat(!showAddCat)} 
              className="text-zinc-400 hover:text-primary-500 transition-colors"
              title="Add custom category"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Category Inline Form */}
          {showAddCat && (
            <form onSubmit={handleAddCategory} className="px-3 mb-3 bg-zinc-50 dark:bg-surface-800 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-700 mx-2 animate-fade-in shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">New Category</span>
                <button type="button" onClick={() => setShowAddCat(false)} className="text-zinc-400 hover:text-zinc-600"><X className="w-3 h-3" /></button>
              </div>
              <input 
                type="text" 
                value={newCatName} 
                onChange={(e) => setNewCatName(e.target.value)} 
                placeholder="Name..." 
                className="w-full text-xs px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-surface-900 text-zinc-900 dark:text-zinc-100 mb-2 focus:outline-none focus:border-primary-500"
                autoFocus
              />
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {TAILWIND_COLORS.map(color => (
                  <button
                    key={color} type="button"
                    onClick={() => setNewCatColor(color)}
                    className={clsx('w-4 h-4 rounded-full', color, newCatColor === color ? 'ring-2 ring-offset-1 ring-primary-500 dark:ring-offset-surface-800' : '')}
                  />
                ))}
              </div>
              <button type="submit" disabled={addingCat} className="w-full btn-primary py-1 text-xs justify-center">
                {addingCat ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
              </button>
            </form>
          )}

          {categories.map((cat) => (
            <div key={cat.value} className="relative group flex items-center">
              <NavLink
                to={`/categories?cat=${cat.value}`}
                className={({ isActive }) => clsx('sidebar-link text-sm py-1.5 flex-1 pr-8', isActive && 'active')}
              >
                <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', cat.color)} />
                <span className="truncate">{cat.label}</span>
              </NavLink>
              <button
                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if(window.confirm(`Hide/Remove "${cat.label}" category?`)) {
                    try {
                      await removeCategory(cat.value)
                      toast.success(`Removed ${cat.label}`)
                    } catch {
                      toast.error('Failed to remove category')
                    }
                  }
                }}
                className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Remove category"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 px-3 py-3 space-y-1">
        <button onClick={onExport} className="sidebar-link w-full">
          <Download className="w-4 h-4" /> Export JSON
        </button>
        <label className="sidebar-link w-full cursor-pointer">
          <Upload className="w-4 h-4" /> Import JSON
          <input type="file" accept=".json" className="hidden" onChange={onImport} />
        </label>
        <NavLink to="/profile" className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}>
          <User className="w-4 h-4" /> Profile
        </NavLink>
      </div>

      {/* User profile footer */}
      {user && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-3 py-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
              alt={user.name}
              className="w-7 h-7 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="text-zinc-400 hover:text-red-500 transition-colors" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
