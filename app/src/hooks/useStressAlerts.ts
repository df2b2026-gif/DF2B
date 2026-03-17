import { useState, useCallback } from 'react';

interface StressAlert {
  id: string;
  alert_level: 'low' | 'medium' | 'high' | 'critical';
  trigger_reason: string;
  heart_rate_bpm: number;
  stress_score: number;
  recommended_action: string;
  acknowledged: boolean;
  created_at: string;
}

interface BreathingSession {
  id: string;
  duration_seconds: number;
  cycles_completed: number;
  audio_type: string;
  effectiveness_score?: number;
  completed_at: string;
}

interface BreathingStats {
  total_sessions: number;
  total_minutes: number;
  avg_effectiveness: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useStressAlerts(token?: string) {
  const [alerts, setAlerts] = useState<StressAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAlerts = useCallback(async (unacknowledged: boolean = false) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/alerts?unacknowledged=${unacknowledged}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error('Failed to fetch alerts');
      const result = await response.json();
      setAlerts(result.data);
      return result.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to acknowledge alert');
      const result = await response.json();
      
      // Update local state
      setAlerts(alerts.map(a => a.id === alertId ? result.data[0] : a));
      return result.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, alerts]);

  return {
    alerts,
    loading,
    error,
    getAlerts,
    acknowledgeAlert,
  };
}

export function useBreathingSession(token?: string) {
  const [sessions, setSessions] = useState<BreathingSession[]>([]);
  const [stats, setStats] = useState<BreathingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSession = useCallback(
    async (
      durationSeconds: number,
      cyclesCompleted: number,
      audioType: string = 'silence',
      effectivenessScore?: number,
    ) => {
      if (!token) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/breathing/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            duration_seconds: durationSeconds,
            cycles_completed: cyclesCompleted,
            audio_type: audioType,
            effectiveness_score: effectivenessScore,
          }),
        });

        if (!response.ok) throw new Error('Failed to save breathing session');
        const result = await response.json();
        if (Array.isArray(result.data)) {
          setSessions((prev) => [...prev, ...result.data]);
        }
        return result.data;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const getStats = useCallback(
    async (days: number = 30) => {
      if (!token) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/breathing/stats?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch breathing stats');
        const result = await response.json();
        setStats(result);
        return result;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  return {
    sessions,
    stats,
    loading,
    error,
    saveSession,
    getStats,
  };
}
