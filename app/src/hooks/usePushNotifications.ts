import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function usePushNotifications(token?: string) {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setSwRegistration(reg);
        })
        .catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const showLocalNotification = (title: string, body: string) => {
    if (permission !== 'granted') return;

    if (swRegistration) {
      swRegistration.showNotification(title, { body, icon: '/icon-192x192.png', badge: '/icon-72x72.png' });
    } else if ('Notification' in window) {
      new Notification(title, { body, icon: '/icon-192x192.png', badge: '/icon-72x72.png' });
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const registerSubscription = async () => {
    if (!token || !swRegistration || !('PushManager' in window)) return null;
    try {
      const current = await swRegistration.pushManager.getSubscription();
      const subscription =
        current ||
        (await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_FCM_VAPID_KEY ?? ''),
        }));

      if (subscription && token) {
        await fetch(`${API_URL}/api/push/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subscription }),
        });
      }
      return subscription;
    } catch (err) {
      console.error('Failed to register push subscription', err);
      return null;
    }
  };

  return {
    permission,
    requestPermission,
    showLocalNotification,
    registerSubscription,
  };
}
