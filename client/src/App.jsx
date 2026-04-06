import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Favorites from './pages/Favorites'
import Categories from './pages/Categories'
import Profile from './pages/Profile'
import SharedPrompt from './pages/SharedPrompt'
import { Loader2 } from 'lucide-react'
import api from './api'
import toast from 'react-hot-toast'

// Protected layout with sidebar
const AppLayout = () => {
  const { user, loading } = useAuth()
  const { dark } = useTheme()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  const handleExport = async () => {
    try {
      const res = await api.get('/prompts/export', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'promptvault-export.json'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Prompts exported!')
    } catch {
      toast.error('Export failed')
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const data = json.prompts || json
      const res = await api.post('/prompts/import', { prompts: data })
      toast.success(`Imported ${res.data.imported} prompts!`)
    } catch {
      toast.error('Import failed — check file format')
    }
    e.target.value = ''
  }

  return (
    <div className={`flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950 ${dark ? 'dark' : ''}`}>
      <Sidebar onExport={handleExport} onImport={handleImport} />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

const AuthGuard = () => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  )
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

const ToasterWithTheme = () => {
  const { dark } = useTheme()
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: dark ? '#27272a' : '#ffffff',
          color: dark ? '#f4f4f5' : '#18181b',
          border: `1px solid ${dark ? '#3f3f46' : '#e4e4e7'}`,
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        },
      }}
    />
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToasterWithTheme />
          <Routes>
            {/* Public routes */}
            <Route path="/share/:shareId" element={<SharedPrompt />} />

            {/* Auth guard — redirect logged-in users away from login */}
            <Route element={<AuthGuard />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected app */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
