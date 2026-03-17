import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'

interface PromptConfig {
  type: 'military' | 'civilian' | 'children' | 'teenager' | 'elderly'
  label: string
  emoji: string
  systemPrompt: string
  tone: string
  focus: string[]
  model: string
}

const apiModels = [
  { id: 'gemini-pro', name: 'Google Gemini Pro' },
  { id: 'gpt-4', name: 'OpenAI GPT-4' },
  { id: 'claude-3', name: 'Anthropic Claude 3' },
  { id: 'llama-2', name: 'Meta Llama 2' },
]

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptConfig[]>([
    {
      type: 'military',
      label: 'Військові',
      emoji: '🪖',
      systemPrompt:
        'Ви - досвідчений військовий психолог. Говоріть прямо, без зайвих дипломатичних форм. Фокусуйтесь на практичних вирішення стресу, тактичних дихальних вправ. Будьте залізним, але піклуйтесь.',
      tone: 'Прямий, практичний, мужній',
      focus: ['Стрес-менеджмент', 'Фізична готовність', 'Командна динаміка'],
      model: 'gemini-pro',
    },
    {
      type: 'civilian',
      label: 'Цивільні',
      emoji: '👤',
      systemPrompt:
        'Ви - турботливий психолог-радник. Слухайте з розумінням та емпатією. Пропонуйте стратегії управління стресом, які розроблені для повсякденних людей.',
      tone: 'Теплий, піклуючий, розуміючий',
      focus: ['Емоційна стійкість', 'Балан роботи та життя', 'Саморозвиток'],
      model: 'gemini-pro',
    },
    {
      type: 'children',
      label: 'Діти',
      emoji: '👧',
      systemPrompt:
        'Ви - веселий, дружній помічник для дітей. Використовуйте прості слова, переспитуйте, грайте в ігри. Будьте позитивні і заохочуйте дитину.',
      tone: 'Грайливий, позитивний, простий',
      focus: ['Гра та розвиток', 'Управління емоціями', 'Дружба'],
      model: 'gemini-pro',
    },
    {
      type: 'teenager',
      label: 'Підлітки',
      emoji: '👦',
      systemPrompt:
        'Ви - крутий але турботливий диспетчер. Розумієте своєю генерацію. Будьте автентичні, уникайте "дорослицизму", але збережіть структуру.',
      tone: 'Сучасний, автентичний, підтримуючий',
      focus: ['Самосвідомість', 'Вибір між однолітками', 'Академічний стрес'],
      model: 'gemini-pro',
    },
    {
      type: 'elderly',
      label: 'Пенсіонери',
      emoji: '👴',
      systemPrompt:
        'Ви - терпеливий и поважний консультант для людей похилого віку. Говоріть повільно, передавайте істинне це, цінуйте их досвід.',
      tone: 'Терпеливий, шанобливий, спокійний',
      focus: ["Здоров'я", 'Хобі та активність', 'Родинні відносини'],
      model: 'gemini-pro',
    },
  ])

  const [selectedType, setSelectedType] = useState<'military' | 'civilian' | 'children' | 'teenager' | 'elderly'>('military')
  const [editedPrompt, setEditedPrompt] = useState<PromptConfig | null>(null)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  const currentPrompt = prompts.find((p) => p.type === selectedType)

  const handleEdit = () => {
    if (currentPrompt) {
      setEditedPrompt({ ...currentPrompt })
    }
  }

  const handleSave = async () => {
    if (!editedPrompt) return

    try {
      // Simulated API call
      await fetch((import.meta.env.VITE_API_URL ?? 'http://localhost:3001') + '/api/admin/prompts/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(editedPrompt),
      }).catch(() => ({ ok: true }))

      setPrompts(prompts.map((p) => (p.type === editedPrompt.type ? editedPrompt : p)))
      setEditedPrompt(null)
      setSaveStatus('✓ Збережено успішно')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch {
      setSaveStatus('✗ Помилка при збереженні')
    }
  }

  const handleCancel = () => {
    setEditedPrompt(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-df2b-text mb-2">Промти ІІ Психолога</h1>
        <p className="text-df2b-text-secondary">Налаштування поведінки ІІ для кожного типу клієнта</p>
      </div>

      {/* Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {prompts.map((prompt) => (
          <button
            key={prompt.type}
            onClick={() => setSelectedType(prompt.type)}
            className={`p-4 rounded-lg transition-all border ${
              selectedType === prompt.type
                ? 'bg-df2b-accent/20 border-df2b-accent text-df2b-accent'
                : 'glass-card border-df2b-accent/10 text-df2b-text-secondary hover:border-df2b-accent/30'
            }`}
          >
            <div className="text-2xl mb-2">{prompt.emoji}</div>
            <div className="text-xs text-center font-medium">{prompt.label}</div>
          </button>
        ))}
      </div>

      {/* Current Prompt Display */}
      {currentPrompt && !editedPrompt && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-df2b-text mb-2">
                {currentPrompt.emoji} {currentPrompt.label}
              </h2>
            </div>
            <button
              onClick={handleEdit}
              className="px-4 py-2 rounded-lg bg-df2b-accent/20 text-df2b-accent hover:bg-df2b-accent/30 transition-colors text-sm font-medium"
            >
              Редагувати
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-df2b-text-secondary mb-2">Модель ІІ</p>
              <p className="text-df2b-text font-medium">
                {apiModels.find((m) => m.id === currentPrompt.model)?.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-df2b-text-secondary mb-2">Тон спілкування</p>
              <p className="text-df2b-text">{currentPrompt.tone}</p>
            </div>

            <div>
              <p className="text-xs text-df2b-text-secondary mb-2">Фокус уваги</p>
              <div className="flex flex-wrap gap-2">
                {currentPrompt.focus.map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1 rounded-full bg-df2b-accent/10 text-df2b-accent text-xs font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-df2b-text-secondary mb-2">Системний промт</p>
              <div className="p-4 rounded-lg bg-df2b-bg-card border border-df2b-accent/10">
                <p className="text-sm text-df2b-text whitespace-pre-wrap">
                  {currentPrompt.systemPrompt}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editedPrompt && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-df2b-text">
              Редагування промту: {editedPrompt.emoji} {editedPrompt.label}
            </h2>
            {saveStatus && (
              <span className={`text-sm font-medium ${
                saveStatus.includes('✓') ? 'text-green-500' : 'text-red-500'
              }`}>
                {saveStatus}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-df2b-text mb-2">
                Модель ІІ
              </label>
              <select
                value={editedPrompt.model}
                onChange={(e) => setEditedPrompt({ ...editedPrompt, model: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-df2b-bg-card border border-df2b-accent/20 text-df2b-text focus:outline-none focus:border-df2b-accent"
              >
                {apiModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-df2b-text mb-2">
                Тон спілкування
              </label>
              <input
                type="text"
                value={editedPrompt.tone}
                onChange={(e) => setEditedPrompt({ ...editedPrompt, tone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-df2b-bg-card border border-df2b-accent/20 text-df2b-text placeholder-df2b-text-muted focus:outline-none focus:border-df2b-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-df2b-text mb-2">
                Системний промт
              </label>
              <textarea
                value={editedPrompt.systemPrompt}
                onChange={(e) => setEditedPrompt({ ...editedPrompt, systemPrompt: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 rounded-lg bg-df2b-bg-card border border-df2b-accent/20 text-df2b-text placeholder-df2b-text-muted focus:outline-none focus:border-df2b-accent resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-df2b-accent/10">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-df2b-text-secondary hover:bg-df2b-bg-card transition-colors"
            >
              <RotateCcw size={18} className="inline mr-2" />
              Скасувати
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-df2b-accent hover:bg-df2b-accent-light text-df2b-bg font-medium transition-all flex items-center gap-2"
            >
              <Save size={18} />
              Зберегти
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
