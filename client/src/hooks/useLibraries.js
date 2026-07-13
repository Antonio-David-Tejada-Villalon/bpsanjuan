import { useState, useEffect, useCallback } from 'react';
import { getLibraries } from '@/api/libraries';

export function useLibraries({ department, search, enabled = true } = {}) {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (department) params.department = department;
      if (search) params.search = search;
      const data = await getLibraries(params);
      setLibraries(Array.isArray(data) ? data : data.libraries ?? []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar bibliotecas');
    } finally {
      setLoading(false);
    }
  }, [department, search, enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return { libraries, loading, error, refresh: fetch };
}
