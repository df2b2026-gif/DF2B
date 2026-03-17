import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Auth } from '@/components/Auth';
import { BottomNavigation } from '@/components/BottomNavigation';
import { HomeScreen } from '@/sections/HomeScreen';
import { ChatScreen } from '@/sections/ChatScreen';
import { PracticesScreen } from '@/sections/PracticesScreen';
import { TrackerScreen } from '@/sections/TrackerScreen';
import { AudioScreen } from '@/sections/AudioScreen';
import { Onboarding } from '@/sections/Onboarding';
import type { UserProfile } from '@/types';

type Screen = 'home' | 'chat' | 'practices' | 'tracker' | 'audio';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [profile, setProfile] = useState<UserProfile>('civilian');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = (user: User | null) => {
    setUser(user);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (selectedProfile: UserProfile) => {
    setProfile(selectedProfile);
    setShowOnboarding(false);
  };

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (showOnboarding) {
    return <Onboarding onProfileSelect={handleOnboardingComplete} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen profile={profile} onProfileClick={() => setCurrentScreen('chat')} />;
      case 'chat':
        return <ChatScreen profile={profile} />;
      case 'practices':
        return <PracticesScreen />;
      case 'tracker':
        return <TrackerScreen />;
      case 'audio':
        return <AudioScreen />;
      default:
        return <HomeScreen profile={profile} onProfileClick={() => setCurrentScreen('chat')} />;
    }
  };

  return (
    <div className="min-h-screen bg-df2b-bg text-df2b-text">
      <main className="pb-20">
        {renderScreen()}
      </main>
      <BottomNavigation
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
      />
    </div>
  );
}

export default App;
