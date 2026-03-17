import { useState } from 'react'
import { Lock, Mail, Loader2 } from 'lucide-react'

interface LoginPageProps {
  onLogin: (email: string) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Simulated auth - replace with real API call
      const response = await fetch(
        (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') + '/api/admin/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      ).catch(() => null)

      if (response?.ok) {
        const data = await response.json()
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminEmail', email)
        onLogin(email)
      } else {
        // Demo mode - if no backend, use hardcoded admin
        if (
          email === 'admin@df2b.com' &&
          password === 'DF2B_Admin_123'
        ) {
          localStorage.setItem('adminToken', 'demo-token')
          localStorage.setItem('adminEmail', email)
          onLogin(email)
        } else {
          setError('Невірний email або пароль')
        }
      }
    } catch (err) {
      setError('Помилка при авторизації')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-df2b-bg to-df2b-bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-df2b-accent/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-df2b-accent">DF2B</span>
            </div>
            <h1 className="text-2xl font-bold text-df2b-text mb-2">Admin Panel</h1>
            <p className="text-df2b-text-secondary text-sm">
              Увійдіть як адміністратор для управління системою
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-df2b-text mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-df2b-accent/50" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-df2b-bg-card border border-df2b-accent/20 text-df2b-text placeholder-df2b-text-muted focus:outline-none focus:border-df2b-accent focus:ring-1 focus:ring-df2b-accent/50 transition-all"
                  placeholder="admin@df2b.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-df2b-text mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-df2b-accent/50" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-df2b-bg-card border border-df2b-accent/20 text-df2b-text placeholder-df2b-text-muted focus:outline-none focus:border-df2b-accent focus:ring-1 focus:ring-df2b-accent/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-df2b-accent hover:bg-df2b-accent-light text-df2b-bg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Завантаження...' : 'Увійти'}
            </button>
          </form>

          <div className="pt-4 border-t border-df2b-accent/10">
            <p className="text-xs text-df2b-text-muted text-center">
              Demo: admin@df2b.com / DF2B_Admin_123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
