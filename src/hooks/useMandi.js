/**
 * useMandi — mandi price data hooks
 *
 * useMandi(params)           → current price list    → GET /api/mandi
 * useMandiHistory(cropKey)   → 14-day history        → GET /api/mandi/:id/history
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { mandiPrices, priceTrends } from '../data/mockMandi';

/**
 * USE_MOCK: true  → use local mock data (no backend required)
 *           false → call real API
 * Defaults to true when VITE_USE_MOCK is not set.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ─── useMandi ─────────────────────────────────────────────────────────────────

/**
 * Fetch current mandi prices.
 * @param {Object} params  Optional query filters: { crop, state, district, date }
 * @returns {{ data, loading, error, refetch }}
 */
export function useMandi(params = {}) {
  const [data, setData]       = useState(USE_MOCK ? mandiPrices : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError]     = useState(null);

  // Stable key so useCallback only re-creates when params actually change
  const paramsKey = JSON.stringify(params);

  const loadData = useCallback(async () => {
    if (USE_MOCK) {
      setData(mandiPrices);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await api.get(`/mandi${qs ? `?${qs}` : ''}`);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

// ─── useMandiHistory ──────────────────────────────────────────────────────────

/**
 * Fetch 14-day price history for a crop.
 *
 * Mock mode:  looks up priceTrends[cropKey] from mockMandi.js
 * Real mode:  calls GET /api/mandi/:mandiId/history?days=<days>
 *
 * Note: the real API uses a mandiId, not a cropKey. When integrating the
 * real backend, first resolve the crop to its mandiId via GET /api/mandi?crop=<cropKey>,
 * then pass that id here. For now the hook stores the cropKey only.
 *
 * @param {string} cropKey  Lowercase crop name (e.g. 'wheat')
 * @param {number} days     Days of history to request (default 14)
 * @returns {{ data, loading, error, refetch }}
 */
export function useMandiHistory(cropKey, days = 14) {
  const cropNorm    = cropKey?.toLowerCase();
  const initialData = USE_MOCK ? (priceTrends[cropNorm] ?? []) : [];

  const [data, setData]       = useState(initialData);
  const [loading, setLoading] = useState(!USE_MOCK && !!cropKey);
  const [error, setError]     = useState(null);

  const loadData = useCallback(async () => {
    if (USE_MOCK) {
      setData(priceTrends[cropNorm] ?? []);
      return;
    }
    if (!cropKey) return;
    setLoading(true);
    setError(null);
    try {
      // TODO (Phase 5): resolve cropKey → mandiId first, then fetch history.
      // Placeholder path until mandiId is available in the UI:
      const res = await api.get(`/mandi/crop/${cropNorm}/history?days=${days}`);
      setData(res.data?.history ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [cropNorm, days]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  return { data, loading, error, refetch: loadData };
}
