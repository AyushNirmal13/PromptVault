import { useAuth } from '../context/AuthContext'
import { useMemo } from 'react'

export const DEFAULT_CATEGORIES = [
  { label: 'Coding', value: 'coding', color: 'bg-blue-500', icon: '💻' },
  { label: 'Content', value: 'content', color: 'bg-green-500', icon: '✍️' },
  { label: 'Marketing', value: 'marketing', color: 'bg-orange-500', icon: '📣' },
  { label: 'Design', value: 'design', color: 'bg-purple-500', icon: '🎨' },
  { label: 'Research', value: 'research', color: 'bg-yellow-500', icon: '🔬' },
  { label: 'Productivity', value: 'productivity', color: 'bg-red-500', icon: '⚡' },
  { label: 'Other', value: 'other', color: 'bg-zinc-500', icon: '📦' },
]

export const useCategories = () => {
  const { user } = useAuth()
  
  const categories = useMemo(() => {
    let custom = [];
    if (user && Array.isArray(user.customCategories)) {
      custom = user.customCategories.map(c => ({
        label: c.label,
        value: c.value,
        color: c.color,
        icon: '📌'
      }));
    }
    
    // Filter out categories that the user has hidden
    const hidden = user?.hiddenCategories || [];
    const allMerged = [...DEFAULT_CATEGORIES, ...custom];
    
    return allMerged.filter(cat => !hidden.includes(cat.value));
  }, [user])

  return categories
}
