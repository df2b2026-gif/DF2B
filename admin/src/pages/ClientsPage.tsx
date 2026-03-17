import { useState } from 'react'
import { Search, Eye, MessageSquare, Trash2 } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  type: 'military' | 'civilian' | 'children' | 'teenager' | 'elderly'
  joinDate: string
  lastActive: string
  sessionsCount: number
  status: 'active' | 'inactive'
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Іван Петренко',
      email: 'ivan@example.com',
      type: 'military',
      joinDate: '15 Січня 2026',
      lastActive: '17 Березня 08:30',
      sessionsCount: 24,
      status: 'active',
    },
    {
      id: '2',
      name: 'Марія Коваленко',
      email: 'maria@example.com',
      type: 'civilian',
      joinDate: '20 Січня 2026',
      lastActive: '16 Березня 16:45',
      sessionsCount: 18,
      status: 'active',
    },
    {
      id: '3',
      name: 'Олег Сидоренко',
      email: 'oleg@example.com',
      type: 'elderly',
      joinDate: '05 Лютого 2026',
      lastActive: '10 Березня 14:20',
      sessionsCount: 32,
      status: 'inactive',
    },
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || client.type === filterType
    return matchesSearch && matchesType
  })

  const typeLabels: Record<string, string> = {
    military: '🪖 Військовий',
    civilian: '👤 Цивільний',
    children: '👧 Дитина',
    teenager: '👦 Підліток',
    elderly: '👴 Пенсіонер',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-df2b-text mb-2">Клієнти</h1>
        <p className="text-df2b-text-secondary">Управління користувачами системи</p>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-df2b-accent/50" size={20} />
            <input
              type="text"
              placeholder="Пошук за імям або email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-df2b-bg-card border border-df2b-accent/20 text-df2b-text placeholder-df2b-text-muted focus:outline-none focus:border-df2b-accent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg bg-df2b-bg-card border border-df2b-accent/20 text-df2b-text focus:outline-none focus:border-df2b-accent"
          >
            <option value="all">Всі типи</option>
            <option value="military">Військові</option>
            <option value="civilian">Цивільні</option>
            <option value="children">Діти</option>
            <option value="teenager">Підлітки</option>
            <option value="elderly">Пенсіонери</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-df2b-accent/10 bg-df2b-bg-secondary/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-df2b-text">Ім'я</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-df2b-text">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-df2b-text">Тип</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-df2b-text">Сеанси</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-df2b-text">Статус</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-df2b-text">Дія</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-df2b-accent/5">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-df2b-bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-df2b-text font-medium">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-df2b-text-secondary">
                    {client.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-block px-3 py-1 rounded-full bg-df2b-accent/10 text-df2b-accent text-xs font-medium">
                      {typeLabels[client.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-df2b-text">
                    {client.sessionsCount}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        client.status === 'active'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-df2b-text-muted/20 text-df2b-text-muted'
                      }`}
                    >
                      {client.status === 'active' ? '● Активний' : '● Неактивний'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-df2b-bg-card rounded-lg transition-colors text-df2b-accent/70 hover:text-df2b-accent">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 hover:bg-df2b-bg-card rounded-lg transition-colors text-df2b-accent/70 hover:text-df2b-accent">
                        <MessageSquare size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setClients(clients.filter((c) => c.id !== client.id))
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500/70 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-df2b-text-secondary">Клієнтів не знайдено</p>
        </div>
      )}
    </div>
  )
}
