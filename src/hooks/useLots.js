/**
 * useLots — crop lot hooks
 *
 * useMyLots(filters)    → farmer's own lots      → GET /api/lots/my
 * useLots(filters)      → marketplace listing    → GET /api/lots
 * useCreateLot()        → create a new lot       → POST /api/lots
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { lots } from '../data/mockLots';
import { useAuth } from '../context/AuthContext';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ─── useMyLots ────────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated farmer's own lots.
 * Mock mode uses farmerId from AuthContext (falls back to 'f1' for demo).
 *
 * @param {Object} filters  { status: 'active'|'sold'|'expired'|'all' }
 * @returns {{ data, loading, error, refetch }}
 */
export function useMyLots(filters = {}) {
  const { user } = useAuth();

  const getMock = () => {
    const farmerId = user?._id || user?.id || 'f1';
    let result = lots.filter((l) => l.farmerId === farmerId);
    if (filters.status && filters.status !== 'all') {
      result = result.filter((l) => l.status === filters.status);
    }
    return result;
  };

  const [data, setData]       = useState(USE_MOCK ? getMock() : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError]     = useState(null);

  const filtersKey = JSON.stringify(filters);

  const loadData = useCallback(async () => {
    if (USE_MOCK) {
      setData(getMock());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams(filters).toString();
      const res = await api.get(`/lots/my${qs ? `?${qs}` : ''}`);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filtersKey, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  return { data, lots: data, loading, error, refetch: loadData };
}

// ─── useLots ──────────────────────────────────────────────────────────────────

/**
 * Fetch all active lots for the buyer marketplace.
 *
 * @param {Object} filters  { crop, search, minPrice, maxPrice, quality, sort }
 * @returns {{ data, lots, loading, error, refetch }}
 */
export function useLots(filters = {}) {
  const getActiveMock = () => {
    let result = lots.filter((l) => l.status === 'active');
    if (filters.crop) {
      result = result.filter(
        (l) => l.cropName.toLowerCase() === filters.crop.toLowerCase()
      );
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.cropName.toLowerCase().includes(s) ||
          l.cropNameHi.includes(filters.search) ||
          l.location.toLowerCase().includes(s)
      );
    }
    return result;
  };

  const [data, setData]       = useState(USE_MOCK ? getActiveMock() : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError]     = useState(null);

  const filtersKey = JSON.stringify(filters);

  const loadData = useCallback(async () => {
    if (USE_MOCK) {
      setData(getActiveMock());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams(filters).toString();
      const res = await api.get(`/lots${qs ? `?${qs}` : ''}`);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filtersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  return { data, lots: data, loading, error, refetch: loadData };
}

// ─── useCreateLot ─────────────────────────────────────────────────────────────

/**
 * Returns a `createLot(formData)` mutation function.
 * In mock mode: simulates success and returns a fake lot object.
 * In real mode: calls POST /api/lots.
 *
 * Usage:
 *   const { createLot, loading, error } = useCreateLot();
 *   const newLot = await createLot(formData);
 *
 * @returns {{ createLot, loading, error }}
 */
export function useCreateLot() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function createLot(formData) {
    if (USE_MOCK) {
      // Simulate a successful backend response
      return {
        _id:        `lot_mock_${Date.now()}`,
        farmerId:   'f1',
        status:     'active',
        offerCount: 0,
        createdAt:  new Date().toISOString(),
        ...formData,
      };
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/lots', formData);
      return res.data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { createLot, loading, error };
}
