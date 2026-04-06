import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import clsx from 'clsx'

const SearchBar = ({ onSearch, onFilter, activeCategory = 'all' }) => {
  const categories = useCategories()
  const categoryPills = ['all', ...categories.map(c => c.value)]
  const [query, setQuery] = useState('')

  const handleSearch = (val) => {
    setQuery(val)
    onSearch(val, activeCategory)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('', activeCategory)
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search prompts by title, tags, or content..."
          className="input pl-9 pr-9"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {categoryPills.map((cat) => (
          <button
            key={cat}
            onClick={() => onFilter(cat)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium capitalize transition-all duration-150',
              activeCategory === cat
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-surface-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-surface-700'
            )}
          >
            {cat === 'all' ? '✦ All' : cat}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SearchBar
