import { useGoogleLogin } from '@react-oauth/google'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Zap, Sparkles, Shield, BookOpen } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import toast from 'react-hot-toast'

const FEATURES = [
  { icon: <BookOpen className="w-5 h-5 text-primary-500" />, title: 'Organize Prompts', desc: 'Store & categorize all your AI prompts in one place' },
  { icon: <Sparkles className="w-5 h-5 text-violet-500" />, title: 'Instant Access', desc: 'Inject prompts into ChatGPT, Gemini & Claude via extension' },
  { icon: <Shield className="w-5 h-5 text-green-500" />, title: 'Secure & Private', desc: 'Google OAuth with JWT — your prompts stay yours' },
]

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSuccess = async (credentialResponse) => {
    try {
      await login(credentialResponse.credential)
      navigate('/dashboard')
    } catch (err) {
      toast.error('Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-800 p-12 text-white relative overflow-hidden">
        {/* Abstract decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight">PromptVault</span>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <h1 className="text-5xl font-bold leading-tight">
            Your AI prompt<br />
            <span className="text-primary-200">command center.</span>
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed max-w-sm">
            Create, organize, and instantly reuse your best AI prompts across every platform.
          </p>

          <div className="space-y-4 mt-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-primary-200 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-primary-300 text-sm">© 2024 PromptVault · Built for developers</p>
      </div>

      {/* Right — login */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm space-y-8 animate-slide-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-white text-xl">PromptVault</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Welcome back</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Sign in to access your prompt library</p>
          </div>

          {/* Google sign-in */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => toast.error('Google login failed')}
                theme="outline"
                size="large"
                width="100%"
                text="signin_with_google"
                shape="rectangular"
              />
            </div>

            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:underline">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
            </p>
          </div>

          {/* Feature list for mobile */}
          <div className="lg:hidden space-y-2.5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                {f.icon}
                <span>{f.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
