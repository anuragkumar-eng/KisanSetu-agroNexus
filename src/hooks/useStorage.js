/**
 * useStorage — storage options hook
 *
 * useStorage(params)   → nearby storage facilities → GET /api/storage/nearby
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { storageOptions } from '../data/mockOrders';
import { useAuth } from '../context/AuthContext';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ─── useStorage ───────────────────────────────────────────────────────────────

/**
 * Fetch nearby storage and cold storage options.
 * In real mode, automatically passes the farmer's district and state
 * so the backend can return geographically relevant results.
 *
 * @param {Object} params  { crop, maxDistance } — optional additional filters
 * @returns {{ data, loading, error, refetch }}
 */
export function useStorage(params = {}) {
  const { user } = useAuth();

  const [data, setData]       = useState(USE_MOCK ? storageOptions : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError]     = useState(null);

  const paramsKey = JSON.stringify(params);

  const loadData = useCallback(async () => {
    if (USE_MOCK) {
      setData(storageOptions);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Location is derived server-side from JWT, but we also send it as
      // a hint so the backend can use it without an extra profile lookup
      const query = {
        district: user?.district || '',
        state:    user?.state    || '',
        ...params,
      };
      const qs = new URLSearchParams(query).toString();
      const res = await api.get(`/storage/nearby${qs ? `?${qs}` : ''}`);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [paramsKey, user?.district, user?.state]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  return { data, loading, error, refetch: loadData };
}
