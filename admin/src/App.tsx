import { useState, useEffect } from 'react'
import { LogOut, BarChart3, Music, Settings, Users } from 'lucide-react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import PromptsPage from './pages/PromptsPage'
import AudioPage from './pages/AudioPage'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('adminToken')
  })
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    const email = localStorage.getItem('adminEmail')
    if (email) setAdminEmail(email)
  }, [isLoggedIn])

  const handleLogin = (email: string) => {
    setAdminEmail(email)
    setIsLoggedIn(true)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    setIsLoggedIn(false)
    setAdminEmail('')
    setCurrentPage('dashboard')
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-df2b-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-df2b-bg-secondary border-r border-df2b-accent/10 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-df2b-accent">DF2B</h1>
          <p className="text-xs text-df2b-text-secondary mt-2">Admin Panel v1.0</p>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', label: 'Статистика', icon: BarChart3 },
            { id: 'clients', label: 'Клієнти', icon: Users },
            { id: 'prompts', label: 'Промти', icon: Settings },
            { id: 'audio', label: 'Аудіо треки', icon: Music },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === id
                  ? 'bg-df2b-accent/20 text-df2b-accent border border-df2b-accent/30'
                  : 'text-df2b-text-secondary hover:bg-df2b-bg-card'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-df2b-accent/10">
          <div className="px-4 py-3 rounded-lg bg-df2b-bg-card mb-4">
            <p className="text-xs text-df2b-text-secondary">Адміністратор</p>
            <p className="text-sm font-medium text-df2b-text truncate">{adminEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-df2b-text-secondary hover:bg-df2b-bg-card hover:text-df2b-accent transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Вийти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'clients' && <ClientsPage />}
          {currentPage === 'prompts' && <PromptsPage />}
          {currentPage === 'audio' && <AudioPage />}
        </div>
      </main>
    </div>
  )
}
