import { useState } from 'react'
import { Users, Activity, TrendingUp, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface ClientStats {
  type: string
  count: number
  active: number
}

interface DailyStats {
  date: string
  sessions: number
  avgDuration: number
}

export default function DashboardPage() {
  const [stats] = useState<ClientStats[]>([
    { type: 'Військові', count: 234, active: 156 },
    { type: 'Цивільні', count: 445, active: 312 },
    { type: 'Підлітки', count: 189, active: 98 },
    { type: 'Діти', count: 67, active: 34 },
    { type: 'Пенсіонери', count: 123, active: 91 },
  ])

  const [dailyStats] = useState<DailyStats[]>([
    { date: '12 Бер', sessions: 234, avgDuration: 12 },
    { date: '13 Бер', sessions: 321, avgDuration: 14 },
    { date: '14 Бер', sessions: 289, avgDuration: 13 },
    { date: '15 Бер', sessions: 456, avgDuration: 15 },
    { date: '16 Бер', sessions: 512, avgDuration: 16 },
    { date: '17 Бер', sessions: 625, avgDuration: 17 },
  ])

  const totalClients = stats.reduce((sum, s) => sum + s.count, 0)
  const activeClients = stats.reduce((sum, s) => sum + s.active, 0)
  const totalSessions = dailyStats.reduce((sum, d) => sum + d.sessions, 0)
  const avgDuration = Math.round(dailyStats.reduce((sum, d) => sum + d.avgDuration, 0) / dailyStats.length)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-df2b-text mb-2">Статистика</h1>
        <p className="text-df2b-text-secondary">Огляд активності користувачів і сеансів</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Всього клієнтів', value: totalClients, icon: Users, color: 'blue' },
          { label: 'Активні зараз', value: activeClients, icon: Activity, color: 'green' },
          { label: 'Всього сеансів', value: totalSessions, icon: TrendingUp, color: 'purple' },
          { label: 'Середня тривалість', value: `${avgDuration} хв`, icon: Clock, color: 'orange' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-xl p-6 space-y-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              color === 'blue' ? 'bg-blue-500/20' :
              color === 'green' ? 'bg-green-500/20' :
              color === 'purple' ? 'bg-purple-500/20' :
              'bg-orange-500/20'
            }`}>
              <Icon className={`${
                color === 'blue' ? 'text-blue-500' :
                color === 'green' ? 'text-green-500' :
                color === 'purple' ? 'text-purple-500' :
                'text-orange-500'
              }`} size={24} />
            </div>
            <div>
              <p className="text-sm text-df2b-text-secondary">{label}</p>
              <p className="text-2xl font-bold text-df2b-text">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients by Type */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-df2b-text">Клієнти за типами</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D4A574" opacity={0.1} />
              <XAxis dataKey="type" tick={{ fill: '#B8B0A4', fontSize: 12 }} />
              <YAxis tick={{ fill: '#B8B0A4', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#252B33',
                  border: '1px solid #D4A574',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#F5F0E8' }}
              />
              <Legend />
              <Bar dataKey="count" fill="#D4A574" name="Всього" />
              <Bar dataKey="active" fill="#10B981" name="Активні" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Activity */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-df2b-text">Щоденна активність</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D4A574" opacity={0.1} />
              <XAxis dataKey="date" tick={{ fill: '#B8B0A4', fontSize: 12 }} />
              <YAxis tick={{ fill: '#B8B0A4', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#252B33',
                  border: '1px solid #D4A574',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#F5F0E8' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="#D4A574"
                name="Сеанси"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
