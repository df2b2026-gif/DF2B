import { useState, useCallback } from 'react';

interface HealthData {
  steps?: number;
  heartRate?: number;
  heart_rate_avg?: number;
  sleep?: number;
  sleep_hours?: number;
  stress?: number;
  breathing?: number;
}

interface HealthEntry {
  data_type: string;
  value: number;
  unit: string;
  recorded_at?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useHealthAPI(token?: string) {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHealthData = useCallback(async (dataType?: string, days: number = 7) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ days: days.toString() });
      if (dataType) params.append('data_type', dataType);

      const response = await fetch(`${API_URL}/api/health/data?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch health data');
      const result = await response.json();
      setData(result.data);
      return result.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const saveHealthData = useCallback(
    async (dataType: string, value: number, unit: string, syncedFrom: string = 'manual') => {
      if (!token) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/health/data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data_type: dataType,
            value,
            unit,
            synced_from: syncedFrom,
            recorded_at: new Date().toISOString(),
          }),
        });

        if (!response.ok) throw new Error('Failed to save health data');
        return await response.json();
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

  const getHealthSummary = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/health/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch health summary');
      const result = await response.json();
      setData(result);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const syncGoogleFit = useCallback(async (accessToken: string, startDate: string, endDate: string, entries?: HealthEntry[]) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = { accessToken, startDate, endDate };
      if (entries && Array.isArray(entries)) {
        payload.entries = entries;
      }

      const response = await fetch(`${API_URL}/api/health/sync/google-fit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to sync Google Fit data');
      }
      return await response.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const syncAppleHealth = useCallback(async (entries: HealthEntry[]) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/health/sync/apple-health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to sync Apple Health data');
      }
      return await response.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    data,
    loading,
    error,
    getHealthData,
    saveHealthData,
    getHealthSummary,
    syncGoogleFit,
    syncAppleHealth,
  };
}
