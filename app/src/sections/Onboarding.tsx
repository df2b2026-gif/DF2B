import { useState } from 'react';
import { Shield, Heart, Star, Briefcase, Sparkles, ChevronRight, MessageCircle, BookOpen, Headphones } from 'lucide-react';
import type { UserProfile } from '@/types';
import { profiles } from '@/data';
import { useHaptics } from '@/hooks/useHaptics';

interface OnboardingProps {
  onProfileSelect: (profile: UserProfile) => void;
}

const iconMap: Record<string, typeof Shield> = {
  Shield,
  Heart,
  TeddyBear: Sparkles,
  Star,
  Briefcase,
};

export function Onboarding({ onProfileSelect }: OnboardingProps) {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [step, setStep] = useState<'welcome' | 'profiles'>('welcome');
  const { mediumTap, success } = useHaptics();

  const handleProfileClick = (profileId: UserProfile) => {
    mediumTap();
    setSelectedProfile(profileId);
  };

  const handleConfirm = () => {
    if (selectedProfile) {
      success();
      onProfileSelect(selectedProfile);
    }
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-df2b-bg-primary flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm">
          {/* Logo Animation */}
          <div className="mb-8">
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-df2b-accent/30 to-df2b-accent/10 flex items-center justify-center mb-6 animate-float">
              <span className="text-5xl font-bold text-df2b-accent font-display">DF2B</span>
            </div>
            <h1 className="text-3xl font-bold text-df2b-text mb-2">
              Don't Forget 2 Breathe
            </h1>
            <p className="text-df2b-text-secondary font-quote text-xl italic">
              "Твій якір у штормі"
            </p>
          </div>

          {/* Description */}
          <div className="bg-df2b-bg-card rounded-2xl p-6 mb-8 shadow-df2b">
            <p className="text-df2b-text-secondary leading-relaxed mb-4">
              DF2B — це твій кишеньковий простір безпеки. Тут ти завжди можеш знайти підтримку, 
              заспокоїтися та просто подихати.
            </p>
            <div className="flex items-center gap-2 text-df2b-accent text-sm">
              <Sparkles size={16} />
              <span>Анонімно. Безпечно. 24/7.</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: Sparkles, text: 'SOS допомога' },
              { icon: MessageCircle, text: 'AI-психолог' },
              { icon: BookOpen, text: 'Дихальні практики' },
              { icon: Headphones, text: 'Аудіо-простір' },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-df2b-bg-secondary rounded-xl p-3 flex items-center gap-2 text-sm text-df2b-text-secondary"
              >
                <feature.icon size={16} className="text-df2b-accent" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => {
              mediumTap();
              setStep('profiles');
            }}
            className="df2b-button-primary w-full flex items-center justify-center gap-2 text-lg"
          >
            Почати
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-df2b-bg-primary flex flex-col p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-df2b-text mb-2">
          Обери свій профіль
        </h2>
        <p className="text-df2b-text-secondary text-sm">
          Це допоможе нам адаптувати досвід під твої потреби
        </p>
      </div>

      {/* Profile Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-24">
        {profiles.map((profile, index) => {
          const Icon = iconMap[profile.icon] || Shield;
          const isSelected = selectedProfile === profile.id;

          return (
            <button
              key={profile.id}
              onClick={() => handleProfileClick(profile.id)}
              className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? 'bg-df2b-accent/20 border-2 border-df2b-accent'
                  : 'bg-df2b-bg-card border-2 border-transparent hover:border-df2b-accent/30'
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-df2b-accent' : 'bg-df2b-bg-secondary'
                  }`}
                >
                  <Icon
                    size={24}
                    className={isSelected ? 'text-df2b-bg-primary' : 'text-df2b-accent'}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-df2b-text mb-1">
                    {profile.nameUk}
                  </h3>
                  <p className="text-sm text-df2b-text-secondary leading-relaxed">
                    {profile.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-df2b-accent flex items-center justify-center shrink-0">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="text-df2b-bg-primary"
                    >
                      <path
                        d="M2 7L5.5 10.5L12 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm Button */}
      {selectedProfile && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-df2b-bg-primary via-df2b-bg-primary to-transparent">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleConfirm}
              className="df2b-button-primary w-full flex items-center justify-center gap-2 text-lg"
            >
              Продовжити
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


