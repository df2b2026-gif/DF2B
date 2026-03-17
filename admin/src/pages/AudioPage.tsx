import { useState } from 'react'
import { Upload, Trash2, Play, Plus } from 'lucide-react'

interface AudioTrack {
  id: string
  name: string
  category: 'noise' | 'nature' | 'music' | 'meditation'
  duration: number
  url: string
  filesize: number
  active: boolean
}

export default function AudioPage() {
  const [tracks, setTracks] = useState<AudioTrack[]>([
    {
      id: '1',
      name: 'Дощ',
      category: 'nature',
      duration: 300,
      url: '/audio/rain.mp3',
      filesize: 2400,
      active: true,
    },
    {
      id: '2',
      name: 'Костер',
      category: 'nature',
      duration: 300,
      url: '/audio/fire.mp3',
      filesize: 2100,
      active: true,
    },
    {
      id: '3',
      name: 'Нічні звуки',
      category: 'nature',
      duration: 300,
      url: '/audio/night.mp3',
      filesize: 2300,
      active: false,
    },
    {
      id: '4',
      name: 'Класична музика',
      category: 'music',
      duration: 600,
      url: '/audio/classical.mp3',
      filesize: 4500,
      active: true,
    },
  ])

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'noise' | 'nature' | 'music' | 'meditation'>('all')
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  const categories = [
    { id: 'all', label: 'Всі' },
    { id: 'nature', label: '🌿 Природа' },
    { id: 'music', label: '🎵 Музика' },
    { id: 'noise', label: '🌊 Білий шум' },
    { id: 'meditation', label: '🧘 Медитація' },
  ]

  const filteredTracks = tracks.filter(
    (track) => selectedCategory === 'all' || track.category === selectedCategory
  )

  const categoryLabels: Record<string, string> = {
    nature: '🌿 Природа',
    music: '🎵 Музика',
    noise: '🌊 Білий шум',
    meditation: '🧘 Медитація',
  }

  const handleToggleActive = (id: string) => {
    setTracks(
      tracks.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    )
  }

  const handleDelete = (id: string) => {
    setTracks(tracks.filter((t) => t.id !== id))
    setUploadStatus('✓ Трек видалено')
    setTimeout(() => setUploadStatus(null), 3000)
  }

  const handleUpload = () => {
    setUploadStatus('✓ Трек завантажено успішно')
    setTimeout(() => setUploadStatus(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-df2b-text mb-2">Аудіо Треки</h1>
        <p className="text-df2b-text-secondary">Управління звуковими ландшафтами та музикою</p>
      </div>

      {/* Upload Section */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-df2b-text flex items-center gap-2">
          <Plus size={20} />
          Додати новий трек
        </h2>
        <div className="border-2 border-dashed border-df2b-accent/30 rounded-lg p-8 text-center space-y-4">
          <Upload className="mx-auto text-df2b-accent/50" size={32} />
          <div>
            <p className="text-df2b-text font-medium">Перетягніть файл сюди</p>
            <p className="text-sm text-df2b-text-secondary">або clicніть для вибору</p>
          </div>
          <button
            onClick={handleUpload}
            className="px-4 py-2 rounded-lg bg-df2b-accent text-df2b-bg font-medium hover:bg-df2b-accent-light transition-colors"
          >
            Вибрати файл
          </button>
        </div>
        {uploadStatus && (
          <p className="text-center text-sm font-medium text-green-500">{uploadStatus}</p>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium ${
              selectedCategory === id
                ? 'bg-df2b-accent text-df2b-bg'
                : 'glass-card text-df2b-text-secondary hover:text-df2b-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tracks List */}
      <div className="space-y-3">
        {filteredTracks.map((track) => (
          <div
            key={track.id}
            className="glass-card rounded-lg p-4 flex items-center justify-between hover:bg-df2b-bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <button className="p-3 rounded-lg bg-df2b-accent/20 text-df2b-accent hover:bg-df2b-accent/30 transition-colors">
                <Play size={20} />
              </button>
              <div className="flex-1">
                <h3 className="font-medium text-df2b-text">{track.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-df2b-accent/10 text-df2b-accent">
                    {categoryLabels[track.category]}
                  </span>
                  <span className="text-xs text-df2b-text-muted">
                    {(track.duration / 60).toFixed(1)} хв • {(track.filesize / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={track.active}
                  onChange={() => handleToggleActive(track.id)}
                  className="w-4 h-4 rounded accent-df2b-accent"
                />
                <span className="text-xs text-df2b-text-secondary">Активний</span>
              </label>
              <button
                onClick={() => handleDelete(track.id)}
                className="p-2 rounded-lg text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-df2b-text-secondary">Треків у цій категорії не знайдено</p>
        </div>
      )}

      {/* Audio Settings Info */}
      <div className="glass-card rounded-xl p-6 space-y-3">
        <h3 className="font-semibold text-df2b-text">💡 Поради для аудіотреків</h3>
        <ul className="text-sm text-df2b-text-secondary space-y-2">
          <li>• Формати: MP3, WAV, OGG (до 10 MB)</li>
          <li>• Тривалість: від 1-5 хвилин для коротких вправ, до 30 хвилин для медитацій</li>
          <li>• Гармонійні та розслабляючі звуки прискорюють效果 дихальних вправ</li>
          <li>• Звуки на нижніх частотах (50-150 Hz) більш заспокійливі</li>
          <li>• Рекомендується мати вибір природних звуків та музики</li>
        </ul>
      </div>
    </div>
  )
}
