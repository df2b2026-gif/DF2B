import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Activity, Zap, TrendingUp } from 'lucide-react';
import { useHealthAPI } from '@/hooks/useHealthAPI';
import { useStressAlerts } from '@/hooks/useStressAlerts';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface HealthTrackerProps {
  token?: string;
}

export function HealthTracker({ token }: HealthTrackerProps) {
  const { saveHealthData, getHealthSummary, data: healthSummary, syncGoogleFit, syncAppleHealth } = useHealthAPI(token);
  const { alerts, getAlerts, acknowledgeAlert } = useStressAlerts(token);
  const { requestPermission, registerSubscription, showLocalNotification } = usePushNotifications(token);

  const [heartRate, setHeartRate] = useState('');
  const [steps, setSteps] = useState('');
  const [sleep, setSleep] = useState('');
  const [loading, setLoading] = useState(false);
  const [fitAccessToken, setFitAccessToken] = useState('');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [appleEntriesJson, setAppleEntriesJson] = useState('[]');

  useEffect(() => {
    if (token) {
      getHealthSummary();
      getAlerts(true); // Get unacknowledged alerts
      requestPermission().then(() => registerSubscription());
    }
  }, [token, getHealthSummary, getAlerts, requestPermission, registerSubscription]);

  useEffect(() => {
    const criticalAlerts = alerts.filter((a) => !a.acknowledged && (a.alert_level === 'critical' || a.alert_level === 'high'));
    if (criticalAlerts.length > 0) {
      const latest = criticalAlerts[0];
      showLocalNotification('DF2B: тривожний сигнал', `${latest.trigger_reason} • ${latest.recommended_action}`);
    }
  }, [alerts, showLocalNotification]);

  const handleSyncGoogleFit = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const result = await syncGoogleFit(fitAccessToken, startDate, endDate);
      if (result?.success) {
        setSyncMessage(`Google Fit synced ${result.synced} records`);
      } else {
        setSyncMessage('Google Fit sync completed, але дані не були знайдені.');
      }

      await getHealthSummary();
      await getAlerts(true);
    } catch {
      setSyncMessage('Помилка синхронізації Google Fit.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAppleHealth = async () => {
    if (!token) return;
    setLoading(true);

    try {
      let entries = [];
      try {
        entries = JSON.parse(appleEntriesJson);
      } catch {
        setSyncMessage('Неправильний формат JSON для Apple Health записів.');
        setLoading(false);
        return;
      }

      const result = await syncAppleHealth(entries);
      if (result?.success) {
        setSyncMessage(`Apple Health synced ${result.synced} records`);
      } else {
        setSyncMessage('Apple Health sync completed, але дані не були знайдені.');
      }

      await getHealthSummary();
      await getAlerts(true);
    } catch {
      setSyncMessage('Помилка синхронізації Apple Health.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeartRate = async () => {
    if (!heartRate || !token) return;
    setLoading(true);
    
    await saveHealthData('heart_rate', parseFloat(heartRate), 'bpm');
    setHeartRate('');
    getHealthSummary();
    getAlerts(true);
    
    setLoading(false);
  };

  const handleSaveSteps = async () => {
    if (!steps || !token) return;
    setLoading(true);
    
    await saveHealthData('steps', parseFloat(steps), 'steps');
    setSteps('');
    getHealthSummary();
    
    setLoading(false);
  };

  const handleSaveSleep = async () => {
    if (!sleep || !token) return;
    setLoading(true);
    
    await saveHealthData('sleep', parseFloat(sleep), 'hours');
    setSleep('');
    getHealthSummary();
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Stress Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.alert_level === 'critical' ? 'destructive' : 'default'}>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{alert.trigger_reason}</p>
                    <p className="text-sm mt-1">{alert.recommended_action}</p>
                    <p className="text-xs mt-2">
                      Пульс: {alert.heart_rate_bpm} bpm | Стрес: {alert.stress_score}/100
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="ml-2"
                    >
                      OK
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Health Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Heart Rate Card */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-df2b-text">
              <Heart className="w-4 h-4 text-red-500" />
              Пульс
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-df2b-text">
                {healthSummary?.heart_rate_avg || '--'} bpm
              </p>
              <p className="text-xs text-df2b-text-secondary mt-1">
                {healthSummary?.heart_rate_avg ?? 0 > 100 ? '⚠️ Підвищено' : 'Нормально'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="heart-rate" className="text-xs text-df2b-text">
                Новий вимір (bpm)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="heart-rate"
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="60-100"
                  className="bg-df2b-bg-card border-df2b-accent/20 text-df2b-text"
                />
                <Button
                  size="sm"
                  onClick={handleSaveHeartRate}
                  disabled={loading || !heartRate}
                  className="bg-df2b-accent hover:bg-df2b-accent-light"
                >
                  +
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps Card */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-df2b-text">
              <Activity className="w-4 h-4 text-blue-500" />
              Кроки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-df2b-text">
                {Math.round((healthSummary?.steps || 0) / 1000)}k
              </p>
              <p className="text-xs text-df2b-text-secondary mt-1">
                Мета: 10,000 кроків
              </p>
            </div>
            <div className="w-full bg-df2b-bg-card rounded-full h-2">
              <div
                className="bg-df2b-accent h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(((healthSummary?.steps || 0) / 10000) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="steps" className="text-xs text-df2b-text">
                Додати кроки
              </Label>
              <div className="flex gap-2">
                <Input
                  id="steps"
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder="1000"
                  className="bg-df2b-bg-card border-df2b-accent/20 text-df2b-text"
                />
                <Button
                  size="sm"
                  onClick={handleSaveSteps}
                  disabled={loading || !steps}
                  className="bg-df2b-accent hover:bg-df2b-accent-light"
                >
                  +
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Card */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-df2b-text">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Сон
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-df2b-text">
                {healthSummary?.sleep_hours || '--'} год
              </p>
              <p className="text-xs text-df2b-text-secondary mt-1">
                Рекомендовано: 7-9 годин
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleep" className="text-xs text-df2b-text">
                Години сну
              </Label>
              <div className="flex gap-2">
                <Input
                  id="sleep"
                  type="number"
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  placeholder="6-9"
                  step="0.5"
                  className="bg-df2b-bg-card border-df2b-accent/20 text-df2b-text"
                />
                <Button
                  size="sm"
                  onClick={handleSaveSleep}
                  disabled={loading || !sleep}
                  className="bg-df2b-accent hover:bg-df2b-accent-light"
                >
                  +
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Platform Sync */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-df2b-text">Синхронізація з Health App</CardTitle>
          <CardDescription className="text-df2b-text-secondary">
            Імпорт даних з Google Fit або Apple Health
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <Label className="text-xs text-df2b-text">Google Fit Access Token</Label>
            <Input
              type="password"
              value={fitAccessToken}
              onChange={(e) => setFitAccessToken(e.target.value)}
              placeholder="Вставте OAuth токен Google Fit"
              className="bg-df2b-bg-card border-df2b-accent/20 text-df2b-text"
            />
            <Button
              onClick={handleSyncGoogleFit}
              disabled={loading || !fitAccessToken}
              className="bg-df2b-accent hover:bg-df2b-accent-light"
            >
              Синхронізувати Google Fit
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="text-xs text-df2b-text">Apple Health JSON</Label>
            <Input
              type="text"
              value={appleEntriesJson}
              onChange={(e) => setAppleEntriesJson(e.target.value)}
              className="bg-df2b-bg-card border-df2b-accent/20 text-df2b-text"
            />
            <Button
              onClick={handleSyncAppleHealth}
              disabled={loading}
              className="bg-df2b-accent hover:bg-df2b-accent-light"
            >
              Синхронізувати Apple Health
            </Button>
          </div>

          {syncMessage && (
            <div className="p-3 rounded-lg bg-df2b-bg-card text-df2b-text-secondary">
              {syncMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Recommendations */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-df2b-text">Рекомендації</CardTitle>
          <CardDescription className="text-df2b-text-secondary">
            Основане на ваших показниках здоров'я
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(healthSummary?.heart_rate_avg ?? 0) > 100 && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                💓 Ваш пульс підвищений. Спробуйте дихальну практику 4-7-8 або спокійну прогулянку.
              </p>
            </div>
          )}
          {(healthSummary?.steps ?? 0) < 5000 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                👟 Спробуйте бути активнішими. Кожен крок наближає вас до мети!
              </p>
            </div>
          )}
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">
              ✨ Продовжуйте дихальні практики щодня - це найпотужніший інструмент.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
