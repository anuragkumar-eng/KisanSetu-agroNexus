/**
 * useOrders — order tracking hooks
 *
 * useOrders(filters)   → current user's orders   → GET /api/orders
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { orders } from '../data/mockOrders';
import { useAuth } from '../context/AuthContext';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ─── useOrders ────────────────────────────────────────────────────────────────

/**
 * Fetch all orders for the authenticated user.
 * Backend derives user identity from JWT — not from any request param.
 *
 * @param {Object} filters  { status: 'ORDER_CONFIRMED'|'IN_TRANSIT'|'DELIVERED'|... }
 * @returns {{ data, loading, error, refetch }}
 */
export function useOrders(filters = {}) {
  const { user } = useAuth();

  const getMock = () => {
    let result = [...orders];
    if (filters.status) {
      // Mock orders use a different status format; accept both
      result = result.filter(
        (o) => o.status === filters.status || o.statusHi === filters.status
      );
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
      const res = await api.get(`/orders${qs ? `?${qs}` : ''}`);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filtersKey, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  return { data, orders: data, loading, error, refetch: loadData };
}
