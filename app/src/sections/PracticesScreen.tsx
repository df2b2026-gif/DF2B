import { useState } from 'react';
import { Clock, Wind, Moon, Activity, Zap, Cloud, X, Play, Pause, RotateCcw } from 'lucide-react';
import { breathingExercises } from '@/data';
import { useHaptics } from '@/hooks/useHaptics';
import { useBreathing } from '@/hooks/useBreathing';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Category = 'all' | 'sleep' | 'anxiety' | 'focus' | 'energy';

const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'Всі' },
  { id: 'sleep', label: 'Для сну' },
  { id: 'anxiety', label: 'Від тривоги' },
  { id: 'focus', label: 'Фокус' },
  { id: 'energy', label: 'Енергія' },
];

const iconMap: Record<string, typeof Wind> = {
  Square: Activity,
  Moon: Moon,
  Wind: Wind,
  Activity: Activity,
  Zap: Zap,
  Cloud: Cloud,
};

export function PracticesScreen() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [selectedExercise, setSelectedExercise] = useState<typeof breathingExercises[0] | null>(null);
  const { lightTap, mediumTap } = useHaptics();

  const filteredExercises =
    activeCategory === 'all'
      ? breathingExercises
      : breathingExercises.filter((e) => e.category === activeCategory);

  return (
    <div className="min-h-full p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-df2b-text mb-2">
          Дихальні практики
        </h1>
        <p className="text-df2b-text-secondary text-sm">
          Обери техніку, яка підходить саме зараз
        </p>
      </header>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              lightTap();
              setActiveCategory(cat.id);
            }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-df2b-accent text-df2b-bg-primary'
                : 'bg-df2b-bg-card text-df2b-text-secondary hover:bg-df2b-accent/20'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Exercise Cards */}
      <div className="grid grid-cols-2 gap-4 pb-20">
        {filteredExercises.map((exercise, index) => {
          const Icon = iconMap[exercise.icon] || Wind;

          return (
            <button
              key={exercise.id}
              onClick={() => {
                mediumTap();
                setSelectedExercise(exercise);
              }}
              className="bg-df2b-bg-card rounded-2xl p-4 text-left hover:bg-df2b-bg-elevated transition-all hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-df2b-accent/20 flex items-center justify-center mb-3">
                <Icon size={24} className="text-df2b-accent" />
              </div>
              <h3 className="font-semibold text-df2b-text mb-1 text-sm">
                {exercise.nameUk}
              </h3>
              <p className="text-df2b-text-muted text-xs mb-3 line-clamp-2">
                {exercise.description}
              </p>
              <div className="flex items-center gap-1 text-df2b-accent text-xs">
                <Clock size={12} />
                <span>
                  {exercise.inhale}-{exercise.hold > 0 ? exercise.hold + '-' : ''}
                  {exercise.exhale}
                  {exercise.holdAfterExhale > 0 ? '-' + exercise.holdAfterExhale : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Exercise Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="bg-df2b-bg-card border-df2b-accent/20 max-w-sm">
          {selectedExercise && (
            <ExercisePlayer
              exercise={selectedExercise}
              onClose={() => setSelectedExercise(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ExercisePlayerProps {
  exercise: typeof breathingExercises[0];
  onClose: () => void;
}

function ExercisePlayer({ exercise, onClose }: ExercisePlayerProps) {
  const { mediumTap } = useHaptics();
  const {
    phase,
    progress,
    cycleCount,
    isActive,
    start,
    stop,
    reset,
    getPhaseText,
    getPhaseColor,
  } = useBreathing({
    inhale: exercise.inhale,
    hold: exercise.hold,
    exhale: exercise.exhale,
    holdAfterExhale: exercise.holdAfterExhale,
  });

  const getCircleScale = () => {
    if (!isActive) return 1;
    
    if (phase === 'inhale') {
      return 1 + progress * 0.3;
    } else if (phase === 'exhale') {
      return 1.3 - progress * 0.3;
    }
    return 1.3;
  };

  const Icon = iconMap[exercise.icon] || Wind;

  return (
    <div className="py-4">
      <DialogHeader>
        <DialogTitle className="text-df2b-text flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-df2b-accent/20 flex items-center justify-center">
            <Icon size={20} className="text-df2b-accent" />
          </div>
          {exercise.nameUk}
        </DialogTitle>
      </DialogHeader>

      <div className="mt-6 flex flex-col items-center">
        {/* Breathing Circle */}
        <div className="relative w-48 h-48 mb-6">
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="rgba(212, 165, 116, 0.1)"
              strokeWidth="4"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke={getPhaseColor()}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
              className="transition-all duration-100"
            />
          </svg>

          {/* Inner circle */}
          <div
            className="absolute inset-4 rounded-full flex items-center justify-center transition-all duration-100"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${getPhaseColor()}30, ${getPhaseColor()}10)`,
              transform: `scale(${getCircleScale()})`,
              boxShadow: isActive ? `0 0 40px ${getPhaseColor()}40` : 'none',
            }}
          >
            <div className="text-center">
              <p
                className="text-2xl font-bold transition-colors duration-300"
                style={{ color: getPhaseColor() }}
              >
                {getPhaseText()}
              </p>
              {isActive && (
                <p className="text-df2b-text-muted text-sm mt-1">
                  Цикл {cycleCount + 1}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              mediumTap();
              reset();
            }}
            className="w-12 h-12 rounded-full bg-df2b-bg-secondary flex items-center justify-center hover:bg-df2b-accent/20 transition-colors"
          >
            <RotateCcw size={20} className="text-df2b-text-secondary" />
          </button>

          <button
            onClick={() => {
              mediumTap();
              if (isActive) {
                stop();
              } else {
                start();
              }
            }}
            className="w-16 h-16 rounded-full bg-df2b-accent flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isActive ? (
              <Pause size={28} className="text-df2b-bg-primary" />
            ) : (
              <Play size={28} className="text-df2b-bg-primary ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              mediumTap();
              onClose();
            }}
            className="w-12 h-12 rounded-full bg-df2b-bg-secondary flex items-center justify-center hover:bg-df2b-error/20 transition-colors"
          >
            <X size={20} className="text-df2b-text-secondary" />
          </button>
        </div>

        {/* Pattern info */}
        <div className="mt-6 flex items-center gap-4 text-sm text-df2b-text-secondary">
          <span className="px-3 py-1 rounded-full bg-df2b-bg-secondary">
            Вдих: {exercise.inhale}s
          </span>
          {exercise.hold > 0 && (
            <span className="px-3 py-1 rounded-full bg-df2b-bg-secondary">
              Затримка: {exercise.hold}s
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-df2b-bg-secondary">
            Видих: {exercise.exhale}s
          </span>
        </div>
      </div>
    </div>
  );
}
