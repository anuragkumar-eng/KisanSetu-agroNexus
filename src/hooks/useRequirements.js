/**
 * useRequirements — buyer requirement hooks
 *
 * useRequirements(filters)   → browse demand board     → GET /api/requirements
 * usePostRequirement()       → post new requirement    → POST /api/requirements
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

/**
 * Placeholder mock data.
 * No mockRequirements.js file exists yet — the requirements board is a
 * future UI feature. Returns empty array in mock mode until data is added.
 */
const MOCK_REQUIREMENTS = [];

// ─── useRequirements ──────────────────────────────────────────────────────────

/**
 * Fetch buyer requirements (demand signals visible to farmers).
 *
 * @param {Object} filters  { crop, state, minQty }
 * @returns {{ data, loading, error, refetch }}
 */
export function useRequirements(filters = {}) {
  const [data, setData]       = useState(MOCK_REQUIREMENTS);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError]     = useState(null);

  const filtersKey = JSON.stringify(filters);

  const loadData = useCallback(async () => {
    if (USE_MOCK) { setData(MOCK_REQUIREMENTS); return; }
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams(filters).toString();
      const res = await api.get(`/requirements${qs ? `?${qs}` : ''}`);
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

// ─── usePostRequirement ───────────────────────────────────────────────────────

/**
 * Post a new buyer requirement.
 * In mock mode: returns a simulated response object.
 * In real mode: calls POST /api/requirements.
 *
 * Usage:
 *   const { postRequirement, loading, error } = usePostRequirement();
 *   const result = await postRequirement(formData);
 *
 * @returns {{ postRequirement, loading, error }}
 */
export function usePostRequirement() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function postRequirement(body) {
    if (USE_MOCK) {
      return { _id: `req_mock_${Date.now()}`, status: 'active', ...body };
    }
    setLoading(true); setError(null);
    try {
      const res = await api.post('/requirements', body);
      return res.data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { postRequirement, loading, error };
}
