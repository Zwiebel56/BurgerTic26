import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

// GET con estados de carga/error. Con "interval" (ms) refresca en segundo plano,
// lo usamos para el seguimiento de pedidos "en tiempo real" (polling).
export function useApi(path, { interval } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setData(await api(path));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    load();
    if (!interval) return undefined;
    const timer = setInterval(() => load(true), interval);
    return () => clearInterval(timer);
  }, [load, interval]);

  return { data, setData, error, loading, reload: () => load() };
}
