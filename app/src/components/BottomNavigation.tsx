import { Home, MessageCircle, BookOpen, Headphones, BarChart3 } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

type Screen = 'home' | 'chat' | 'practices' | 'audio' | 'tracker';

interface BottomNavigationProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

const navItems: { id: Screen; icon: typeof Home; label: string }[] = [
  { id: 'home', icon: Home, label: 'Головна' },
  { id: 'chat', icon: MessageCircle, label: 'Чат' },
  { id: 'practices', icon: BookOpen, label: 'Практики' },
  { id: 'audio', icon: Headphones, label: 'Аудіо' },
  { id: 'tracker', icon: BarChart3, label: 'Трекер' },
];

export function BottomNavigation({ currentScreen, onScreenChange }: BottomNavigationProps) {
  const { lightTap } = useHaptics();

  const handleClick = (screen: Screen) => {
    lightTap();
    onScreenChange(screen);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-df2b-bg-secondary/95 backdrop-blur-lg border-t border-df2b-accent/10 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-df2b-accent'
                  : 'text-df2b-text-muted hover:text-df2b-text-secondary'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`relative p-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-df2b-accent/20' : ''
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-df2b-accent" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-df2b-accent' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
