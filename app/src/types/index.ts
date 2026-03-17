// User Profile Types
export type UserProfile = 'military' | 'elderly' | 'children' | 'teenager' | 'civilian';

export interface Profile {
  id: UserProfile;
  name: string;
  nameUk: string;
  icon: string;
  description: string;
  tone: string;
  focus: string[];
}

// Chat Types
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  quickReplies?: string[];
}

// Breathing Exercise Types
export interface BreathingExercise {
  id: string;
  name: string;
  nameUk: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfterExhale: number;
  category: 'sleep' | 'anxiety' | 'focus' | 'energy';
  icon: string;
}

// Audio Soundscape Types
export interface Soundscape {
  id: string;
  name: string;
  nameUk: string;
  description: string;
  icon: string;
  color: string;
}

// Mood Tracker Types
export interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  color: string;
  note?: string;
}

export interface MoodOption {
  value: number;
  color: string;
  label: string;
  emoji: string;
}

// App State
export interface AppState {
  currentProfile: UserProfile | null;
  hasCompletedOnboarding: boolean;
  messages: Message[];
  moodEntries: MoodEntry[];
  favoriteExercises: string[];
  audioSettings: {
    volume: number;
    timer: number;
  };
}
