-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- ======== TABLE: messages ========
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  profile TEXT DEFAULT 'civilian',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ======== TABLE: user_profiles ========
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  profile_type TEXT DEFAULT 'civilian' CHECK (profile_type IN ('civilian', 'student', 'parent', 'medical', 'crisis')),
  bio_auth_enabled BOOLEAN DEFAULT FALSE,
  health_api_connected BOOLEAN DEFAULT FALSE,
  health_provider TEXT, -- 'google_fit' or 'apple_health'
  avatar_url TEXT,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'uk',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ======== TABLE: health_data ========
CREATE TABLE public.health_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT CHECK (data_type IN ('steps', 'heart_rate', 'sleep', 'stress', 'breathing')),
  value FLOAT NOT NULL,
  unit TEXT NOT NULL, -- 'steps', 'bpm', 'hours', 'percentage', 'cycles_per_min'
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  synced_from TEXT, -- 'google_fit', 'apple_health', 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health data" ON public.health_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health data" ON public.health_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for health_data queries
CREATE INDEX idx_health_data_user_id ON public.health_data(user_id);
CREATE INDEX idx_health_data_recorded_at ON public.health_data(recorded_at);

-- ======== TABLE: stress_alerts ========
CREATE TABLE public.stress_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_level TEXT CHECK (alert_level IN ('low', 'medium', 'high', 'critical')),
  trigger_reason TEXT,
  heart_rate_bpm INT,
  stress_score FLOAT,
  recommended_action TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.stress_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stress alerts" ON public.stress_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stress alerts" ON public.stress_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stress alerts" ON public.stress_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_stress_alerts_user_id ON public.stress_alerts(user_id);

-- ======== TABLE: biometric_auth ========
CREATE TABLE public.biometric_auth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_type TEXT CHECK (auth_type IN ('fingerprint', 'face', 'password')),
  is_enrolled BOOLEAN DEFAULT TRUE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.biometric_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own biometric auth" ON public.biometric_auth
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own biometric auth" ON public.biometric_auth
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ======== TABLE: push_subscriptions ========
CREATE TABLE public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push subscriptions" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions" ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions" ON public.push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- ======== TABLE: breathing_sessions ========
CREATE TABLE public.breathing_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_seconds INT NOT NULL,
  cycles_completed INT NOT NULL,
  audio_type TEXT, -- 'nature', 'silence', 'music'
  effectiveness_score INT, -- 1-10
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.breathing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own breathing sessions" ON public.breathing_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own breathing sessions" ON public.breathing_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_breathing_sessions_user_id ON public.breathing_sessions(user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, profile)
  VALUES (NEW.id, 'civilian');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;