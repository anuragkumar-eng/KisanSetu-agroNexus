/**
 * useOffers — offer hooks
 *
 * useOffers(filters)     → offers for current user (role-aware)
 *                            farmer → GET /api/offers/farmer
 *                            buyer  → GET /api/offers/buyer
 * useOfferActions()      → accept / reject / counter mutations
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { offers, buyerOffers } from '../data/mockOffers';
import { useAuth } from '../context/AuthContext';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ─── useOffers ────────────────────────────────────────────────────────────────

/**
 * Fetch offers for the current user.
 * Role is read from AuthContext — no prop needed.
 *
 * @param {Object} filters  { status: 'pending'|'accepted'|'rejected'|'countered' }
 * @returns {{ data, loading, error, refetch }}
 */
export function useOffers(filters = {}) {
  const { user } = useAuth();
  const isBuyer  = user?.role === 'buyer';

  const getMock = () => {
    if (isBuyer) return buyerOffers;
    const farmerId = user?.id || 'f1';
    let result = offers.filter((o) => o.farmerId === farmerId);
    if (filters.status) result = result.filter((o) => o.status === filters.status);
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
      const endpoint = isBuyer ? '/offers/buyer' : '/offers/farmer';
      const qs = new URLSearchParams(filters).toString();
      const res = await api.get(`${endpoint}${qs ? `?${qs}` : ''}`);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isBuyer, filtersKey, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

// ─── useOfferActions ──────────────────────────────────────────────────────────

/**
 * Offer mutation actions for farmers: accept, reject, counter.
 * In mock mode: returns simulated responses without modifying mock state.
 *
 * @returns {{ acceptOffer, rejectOffer, counterOffer, loading, error }}
 */
export function useOfferActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function acceptOffer(offerId) {
    if (USE_MOCK) return { offer: { status: 'accepted' }, order: { status: 'ORDER_CONFIRMED' } };
    setLoading(true); setError(null);
    try {
      const res = await api.patch(`/offers/${offerId}/accept`);
      return res.data;
    } catch (err) {
      setError(err); return null;
    } finally { setLoading(false); }
  }

  async function rejectOffer(offerId, reason = '') {
    if (USE_MOCK) return { status: 'rejected' };
    setLoading(true); setError(null);
    try {
      const res = await api.patch(`/offers/${offerId}/reject`, { reason });
      return res.data;
    } catch (err) {
      setError(err); return null;
    } finally { setLoading(false); }
  }

  async function counterOffer(offerId, counterPrice, message = '') {
    if (USE_MOCK) return { status: 'countered', counterPrice };
    setLoading(true); setError(null);
    try {
      const res = await api.patch(`/offers/${offerId}/counter`, { counterPrice, message });
      return res.data;
    } catch (err) {
      setError(err); return null;
    } finally { setLoading(false); }
  }

  return { acceptOffer, rejectOffer, counterOffer, loading, error };
}
