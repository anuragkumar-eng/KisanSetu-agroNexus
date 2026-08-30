/**
 * useBuyers — buyer profile hooks
 *
 * useBuyers(filters)       → list of buyer profiles    → GET /api/buyers
 * useBuyerDetail(id)       → single buyer profile      → GET /api/buyers/:id
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { buyers } from '../data/mockBuyers';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ─── useBuyers ────────────────────────────────────────────────────────────────

/**
 * Fetch a list of buyer profiles (used by farmer to browse buyers).
 *
 * @param {Object} filters  { crop, state, verified, minRating }
 * @returns {{ data, loading, error, refetch }}
 */
export function useBuyers(filters = {}) {
  const getMock = () => {
    let result = [...buyers];
    if (filters.crop) {
      result = result.filter((b) =>
        b.crops?.some(
          (c) => c.toLowerCase() === filters.crop.toLowerCase()
        )
      );
    }
    if (filters.verified) {
      result = result.filter((b) => b.verified);
    }
    return result;
  };

  const [data, setData]       = useState(USE_MOCK ? getMock() : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError]     = useState(null);

  const filtersKey = JSON.stringify(filters);

  const loadData = useCallback(async () => {
    if (USE_MOCK) { setData(getMock()); return; }
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams(filters).toString();
      const res = await api.get(`/buyers${qs ? `?${qs}` : ''}`);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filtersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

// ─── useBuyerDetail ───────────────────────────────────────────────────────────

/**
 * Fetch a single buyer's full profile.
 * Used by BuyerDetail.jsx and LotDetail.jsx.
 *
 * @param {string} id  Buyer ID
 * @returns {{ data, loading, error, refetch }}
 */
export function useBuyerDetail(id) {
  // Mock uses `id` field; real API uses `_id`
  const getMock = () => buyers.find((b) => b.id === id) ?? null;

  const [data, setData]       = useState(USE_MOCK ? getMock() : null);
  const [loading, setLoading] = useState(!USE_MOCK && !!id);
  const [error, setError]     = useState(null);

  const loadData = useCallback(async () => {
    if (USE_MOCK) { setData(getMock()); return; }
    if (!id) return;
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/buyers/${id}`);
      setData(res.data.buyer);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  return { data, loading, error, refetch: loadData };
}
