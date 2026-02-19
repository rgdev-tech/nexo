import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './auth';
import { useSettings } from './settings';
import type { Alert, AlertType, AlertDirection } from '@/types';

type CreateAlertInput = {
  type: AlertType;
  symbol: string;
  threshold: number;
  direction: AlertDirection;
};

export function useAlerts() {
  const { session } = useAuth();
  const { settings } = useSettings();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = settings.apiUrl;
  const accessToken = session?.access_token;

  const headers = useCallback(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) h['Authorization'] = `Bearer ${accessToken}`;
    return h;
  }, [accessToken]);

  const fetchAlerts = useCallback(async () => {
    if (!apiUrl || !accessToken) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const res = await fetch(`${apiUrl}/api/alerts`, {
        headers: headers(),
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as Alert[];
      setAlerts(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      console.warn('[Alerts] fetchAlerts failed:', msg);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, accessToken, headers]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = useCallback(async (input: CreateAlertInput): Promise<Alert | null> => {
    if (!apiUrl || !accessToken) return null;

    try {
      const res = await fetch(`${apiUrl}/api/alerts`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message ?? `HTTP ${res.status}`);
      }

      const newAlert = (await res.json()) as Alert;
      setAlerts((prev) => [newAlert, ...prev]);
      return newAlert;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('[Alerts] createAlert failed:', msg);
      throw e;
    }
  }, [apiUrl, accessToken, headers]);

  const toggleAlert = useCallback(async (alertId: string, enabled: boolean) => {
    if (!apiUrl || !accessToken) return;

    // Actualización optimista
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, enabled } : a)),
    );

    try {
      const res = await fetch(`${apiUrl}/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ enabled }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        // Revertir cambio optimista
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, enabled: !enabled } : a)),
        );
      }
    } catch (e) {
      // Revertir cambio optimista
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, enabled: !enabled } : a)),
      );
      console.warn('[Alerts] toggleAlert failed:', e);
    }
  }, [apiUrl, accessToken, headers]);

  const deleteAlert = useCallback(async (alertId: string) => {
    if (!apiUrl || !accessToken) return;

    // Guardar para revertir
    const previous = alerts;
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));

    try {
      const res = await fetch(`${apiUrl}/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: headers(),
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        setAlerts(previous);
      }
    } catch (e) {
      setAlerts(previous);
      console.warn('[Alerts] deleteAlert failed:', e);
    }
  }, [apiUrl, accessToken, headers, alerts]);

  return {
    alerts,
    loading,
    error,
    isAuthenticated: !!accessToken,
    createAlert,
    toggleAlert,
    deleteAlert,
    refresh: fetchAlerts,
  };
}
