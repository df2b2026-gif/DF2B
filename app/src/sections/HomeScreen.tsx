import { useState, useCallback } from 'react';
import { User } from 'lucide-react';
import type { UserProfile } from '@/types';
import { profiles } from '@/data';
import { useHaptics } from '@/hooks/useHaptics';
import { useBreathing } from '@/hooks/useBreathing';

interface HomeScreenProps {
  profile: UserProfile;
  onProfileClick: () => void;
}

export function HomeScreen({ profile, onProfileClick }: HomeScreenProps) {
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const { mediumTap, sosPattern } = useHaptics();

  const profileData = profiles.find((p) => p.id === profile);

  const {
    phase,
    progress,
    cycleCount,
    isActive,
    start,
    stop,
    getPhaseText,
    getPhaseColor,
  } = useBreathing({
    inhale: 5.5,
    hold: 0,
    exhale: 5.5,
    holdAfterExhale: 0,
    enabled: isBreathingActive,
  });

  const handleStartBreathing = useCallback(() => {
    sosPattern();
    setIsBreathingActive(true);
    start();
  }, [sosPattern, start]);

  const handleStopBreathing = useCallback(() => {
    mediumTap();
    setIsBreathingActive(false);
    stop();
  }, [mediumTap, stop]);

  // Calculate circle scale based on phase and progress
  const getCircleScale = () => {
    if (!isActive) return 1;
    
    if (phase === 'inhale') {
      return 1 + progress * 0.25;
    } else if (phase === 'exhale') {
      return 1.25 - progress * 0.25;
    }
    return 1.25;
  };

  // Calculate circle shadow based on phase
  const getCircleShadow = () => {
    const scale = getCircleScale();
    const intensity = (scale - 1) * 200 + 30;
    return `0 0 ${intensity}px ${getPhaseColor()}40`;
  };

  return (
    <div className="min-h-full p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-df2b-text-muted text-sm mb-1">Привіт,</p>
          <h1 className="text-2xl font-bold text-df2b-text">ти в безпеці</h1>
        </div>
        <button
          onClick={onProfileClick}
          className="w-12 h-12 rounded-full bg-df2b-bg-card flex items-center justify-center hover:bg-df2b-accent/20 transition-colors"
          aria-label="Змінити профіль"
        >
          <User size={22} className="text-df2b-accent" />
        </button>
      </header>

      {/* Profile Badge */}
      <div className="flex items-center gap-2 mb-8">
        <span className="px-3 py-1.5 rounded-full bg-df2b-accent/20 text-df2b-accent text-sm font-medium">
          {profileData?.nameUk}
        </span>
      </div>

      {/* Breathing Circle */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="relative">
          {/* Outer glow rings */}
          {isActive && (
            <>
              <div
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  background: `radial-gradient(circle, ${getPhaseColor()}20 0%, transparent 70%)`,
                  transform: `scale(${getCircleScale() * 1.5})`,
                  transition: 'transform 0.1s linear',
                }}
              />
              <div
                className="absolute inset-0 rounded-full opacity-20"
                style={{
                  background: `radial-gradient(circle, ${getPhaseColor()}15 0%, transparent 60%)`,
                  transform: `scale(${getCircleScale() * 2})`,
                  transition: 'transform 0.1s linear',
                }}
              />
            </>
          )}

          {/* Main breathing circle */}
          <button
            onClick={isActive ? handleStopBreathing : handleStartBreathing}
            className="relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-100"
            style={{
              background: isActive
                ? `radial-gradient(circle at 30% 30%, ${getPhaseColor()}40, ${getPhaseColor()}20)`
                : 'radial-gradient(circle at 30% 30%, rgba(212, 165, 116, 0.3), rgba(212, 165, 116, 0.1))',
              transform: `scale(${getCircleScale()})`,
              boxShadow: isActive ? getCircleShadow() : '0 0 30px rgba(212, 165, 116, 0.2)',
              border: `2px solid ${isActive ? getPhaseColor() : 'rgba(212, 165, 116, 0.3)'}`,
            }}
          >
            {/* Inner content */}
            <div className="text-center">
              {isActive ? (
                <>
                  <p
                    className="text-3xl font-bold mb-2 transition-colors duration-300"
                    style={{ color: getPhaseColor() }}
                  >
                    {getPhaseText()}
                  </p>
                  <p className="text-df2b-text-secondary text-sm">
                    Цикл {cycleCount + 1}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-df2b-accent mb-2">
                    Давай дихати
                  </p>
                  <p className="text-df2b-text-secondary text-sm">
                    Натисни, щоб почати
                  </p>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Hint text */}
        <p className="mt-8 text-center text-df2b-text-muted text-sm max-w-xs">
          {isActive
            ? 'Притисни телефон до грудей і дихай разом з ним'
            : '5.5 секунд вдих, 5.5 секунд видих'}
        </p>
      </div>

      {/* Quick Techniques */}
      {!isActive && (
        <div className="space-y-3">
          <h3 className="text-df2b-text-secondary text-sm font-medium mb-3">
            Швидкі техніки
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Квадратне', duration: '4-4-4-4', color: '#D4A574' },
              { name: '4-7-8', duration: 'для сну', color: '#7A9B76' },
              { name: 'SOS', duration: 'тут і зараз', color: '#C9A227' },
            ].map((tech, index) => (
              <button
                key={index}
                onClick={() => mediumTap()}
                className="bg-df2b-bg-card rounded-xl p-4 text-center hover:bg-df2b-bg-elevated transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${tech.color}20` }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tech.color }}
                  />
                </div>
                <p className="text-df2b-text text-sm font-medium">{tech.name}</p>
                <p className="text-df2b-text-muted text-xs">{tech.duration}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quote */}
      <div className="mt-8 text-center">
        <p className="font-quote text-lg text-df2b-text-secondary italic">
          "Я тут. Ти в безпеці. Давай подихаємо разом."
        </p>
      </div>
    </div>
  );
}
