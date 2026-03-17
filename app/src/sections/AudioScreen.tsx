import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Trees, CloudRain, Waves, Radio, Moon, Clock, Volume2 } from 'lucide-react';
import { soundscapes } from '@/data';
import { useHaptics } from '@/hooks/useHaptics';
import { Slider } from '@/components/ui/slider';

const iconMap: Record<string, typeof Trees> = {
  Trees,
  CloudRain,
  Waves,
  Radio,
  Moon,
};

export function AudioScreen() {
  const [activeSoundscape, setActiveSoundscape] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [timer, setTimer] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { mediumTap, lightTap } = useHaptics();

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (timer > 0 && prev >= timer * 60) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, timer]);

  const handlePlay = (id: string) => {
    mediumTap();
    if (activeSoundscape === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveSoundscape(id);
      setIsPlaying(true);
      setElapsed(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeSound = soundscapes.find((s) => s.id === activeSoundscape);

  return (
    <div className="min-h-full p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-df2b-text mb-2">
          Аудіо-простір
        </h1>
        <p className="text-df2b-text-secondary text-sm">
          Безпечні звукові ландшафти для відпочинку
        </p>
      </header>

      {/* Active Player */}
      {activeSound && (
        <div className="bg-df2b-bg-card rounded-2xl p-5 mb-6 animate-fade-in-up">
          {/* Visualizer */}
          <div className="flex items-center justify-center gap-1 h-16 mb-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 rounded-full transition-all duration-300 ${
                  isPlaying ? 'animate-equalizer' : ''
                }`}
                style={{
                  backgroundColor: activeSound.color,
                  height: isPlaying ? undefined : '20%',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Soundscape Info */}
          <div className="text-center mb-4">
            <h3 className="font-semibold text-df2b-text text-lg">
              {activeSound.nameUk}
            </h3>
            <p className="text-df2b-text-muted text-sm">
              {activeSound.description}
            </p>
          </div>

          {/* Timer */}
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-df2b-accent font-mono">
              {formatTime(elapsed)}
            </span>
            {timer > 0 && (
              <span className="text-df2b-text-muted text-sm ml-2">
                / {timer} хв
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => {
                lightTap();
                setElapsed(0);
              }}
              className="w-10 h-10 rounded-full bg-df2b-bg-secondary flex items-center justify-center hover:bg-df2b-accent/20 transition-colors"
            >
              <Clock size={18} className="text-df2b-text-secondary" />
            </button>

            <button
              onClick={() => handlePlay(activeSound.id)}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105"
              style={{ backgroundColor: activeSound.color }}
            >
              {isPlaying ? (
                <Pause size={28} className="text-df2b-bg-primary" />
              ) : (
                <Play size={28} className="text-df2b-bg-primary ml-1" />
              )}
            </button>

            <button
              onClick={() => {
                lightTap();
                setActiveSoundscape(null);
                setIsPlaying(false);
                setElapsed(0);
              }}
              className="w-10 h-10 rounded-full bg-df2b-bg-secondary flex items-center justify-center hover:bg-df2b-error/20 transition-colors"
            >
              <span className="text-df2b-text-secondary text-lg">×</span>
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <Volume2 size={18} className="text-df2b-text-muted" />
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-df2b-text-muted text-sm w-10 text-right">
              {volume}%
            </span>
          </div>
        </div>
      )}

      {/* Timer Presets */}
      <div className="mb-6">
        <h3 className="text-df2b-text-secondary text-sm font-medium mb-3">
          Таймер сну
        </h3>
        <div className="flex gap-2">
          {[15, 30, 60, 90].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                lightTap();
                setTimer(timer === mins ? 0 : mins);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                timer === mins
                  ? 'bg-df2b-accent text-df2b-bg-primary'
                  : 'bg-df2b-bg-card text-df2b-text-secondary hover:bg-df2b-accent/20'
              }`}
            >
              {mins} хв
            </button>
          ))}
        </div>
      </div>

      {/* Soundscape List */}
      <div className="space-y-3 pb-20">
        <h3 className="text-df2b-text-secondary text-sm font-medium mb-3">
          Звукові ландшафти
        </h3>
        {soundscapes.map((sound, index) => {
          const Icon = iconMap[sound.icon] || Trees;
          const isActive = activeSoundscape === sound.id;

          return (
            <button
              key={sound.id}
              onClick={() => handlePlay(sound.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all animate-fade-in-up ${
                isActive
                  ? 'bg-df2b-accent/20 border border-df2b-accent/30'
                  : 'bg-df2b-bg-card hover:bg-df2b-bg-elevated'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${sound.color}20` }}
              >
                <Icon size={24} style={{ color: sound.color }} />
              </div>

              <div className="flex-1 text-left">
                <h4 className="font-medium text-df2b-text">{sound.nameUk}</h4>
                <p className="text-df2b-text-muted text-sm">
                  {sound.description}
                </p>
              </div>

              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive && isPlaying
                    ? 'bg-df2b-accent'
                    : 'bg-df2b-bg-secondary'
                }`}
              >
                {isActive && isPlaying ? (
                  <Pause size={18} className="text-df2b-bg-primary" />
                ) : (
                  <Play size={18} className="text-df2b-text-secondary ml-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
