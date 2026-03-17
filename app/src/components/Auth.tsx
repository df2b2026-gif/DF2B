import { useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Fingerprint, User as UserIcon, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthProps {
  onAuthSuccess: (user: SupabaseUser | null) => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bioAuthAvailable, setBioAuthAvailable] = useState({
    fingerprint: false,
    face: false,
  });

  // Check for available biometric authentication
  useEffect(() => {
    checkBioAuthSupport();
  }, []);

  const checkBioAuthSupport = async () => {
    // Check for WebAuthn support (fingerprint and face recognition)
    if (window.PublicKeyCredential !== undefined) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available) {
          setBioAuthAvailable({
            fingerprint: true,
            face: true,
          });
        }
      } catch (err) {
        console.log('Platform authenticator check failed:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        
        // Автоматический вход после регистрации (без подтверждения почты)
        if (data.user) {
          onAuthSuccess(data.user);
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://df2b-app.netlify.app',
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-df2b-bg p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <CardTitle className="text-center text-df2b-text">
            {isLogin ? 'Вхід' : 'Реєстрація'}
          </CardTitle>
          <CardDescription className="text-center text-df2b-text-secondary">
            DF2B - ментальна підтримка 24/7
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-df2b-bg-card">
              <TabsTrigger value="password" className="text-df2b-text">
                <Lock className="w-4 h-4" />
              </TabsTrigger>
              {bioAuthAvailable.fingerprint && (
                <TabsTrigger value="fingerprint" className="text-df2b-text">
                  <Fingerprint className="w-4 h-4" />
                </TabsTrigger>
              )}
              {bioAuthAvailable.face && (
                <TabsTrigger value="face" className="text-df2b-text">
                  <UserIcon className="w-4 h-4" />
                </TabsTrigger>
              )}
            </TabsList>

            {/* Password Auth Tab */}
            <TabsContent value="password" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-df2b-text">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-df2b-bg-card border-df2b-accent/20 text-df2b-text"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-df2b-text">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-df2b-bg-card border-df2b-accent/20 text-df2b-text"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-df2b-accent hover:bg-df2b-accent-light text-df2b-bg"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLogin ? 'Увійти' : 'Зареєструватися'}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-df2b-accent/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-df2b-bg-card px-2 text-df2b-text-secondary">або</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                variant="outline"
                className="w-full border-df2b-accent/20 text-df2b-text hover:bg-df2b-accent/10"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                🔐 Увійти через Google
              </Button>
            </TabsContent>

            {/* Fingerprint Auth Tab - временно отключена */}

          </Tabs>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-df2b-accent hover:text-df2b-accent-light text-sm"
            >
              {isLogin ? 'Немає акаунту? Зареєструватися' : 'Вже маєте акаунт? Увійти'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
