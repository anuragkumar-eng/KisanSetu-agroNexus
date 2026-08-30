/**
 * useConfig — static configuration hooks
 *
 * useCropTypes()       → crop type list      → GET /api/config/crops
 * useQualityGrades()   → quality grade list  → GET /api/config/quality-grades
 *
 * These are public, rarely-changing config endpoints.
 * In mock mode: reads directly from mockLots.js (no async needed).
 * In real mode: fetches from backend; falls back to mock data on error so
 *               CreateLot and Marketplace never break due to a config failure.
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { cropTypes, qualityGrades } from '../data/mockLots';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ─── useCropTypes ─────────────────────────────────────────────────────────────

/**
 * Fetch the supported crop type list.
 * Each item: { value, label, labelHi, emoji }
 *
 * @returns {{ data, loading, error }}
 */
export function useCropTypes() {
  const [data, setData]       = useState(cropTypes); // always initialise with mock
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError]     = useState(null);

  const loadData = useCallback(async () => {
    if (USE_MOCK) { setData(cropTypes); return; }
    setLoading(true); setError(null);
    try {
      const res = await api.get('/config/crops');
      setData(res.data);
    } catch (err) {
      setError(err);
      setData(cropTypes); // graceful fallback — never leave CreateLot unusable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { data, loading, error };
}

// ─── useQualityGrades ─────────────────────────────────────────────────────────

/**
 * Fetch the quality grade option list.
 * Each item: { value, label, labelHi, description, descriptionHi }
 *
 * @returns {{ data, loading, error }}
 */
export function useQualityGrades() {
  const [data, setData]       = useState(qualityGrades); // always initialise with mock
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError]     = useState(null);

  const loadData = useCallback(async () => {
    if (USE_MOCK) { setData(qualityGrades); return; }
    setLoading(true); setError(null);
    try {
      const res = await api.get('/config/quality-grades');
      setData(res.data);
    } catch (err) {
      setError(err);
      setData(qualityGrades); // graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { data, loading, error };
}
