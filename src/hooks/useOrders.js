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
      
      const STATUS_ORDER = [
        'ORDER_CONFIRMED', 'TRANSPORT_PENDING', 'PICKED_UP', 
        'IN_TRANSIT', 'DELIVERED', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED'
      ];
      
      const STATUS_LABELS = [
        { key: 'ORDER_CONFIRMED', labelHi: 'ऑर्डर कंफर्म' },
        { key: 'PICKED_UP', labelHi: 'उठाया गया' },
        { key: 'IN_TRANSIT', labelHi: 'रास्ते में' },
        { key: 'DELIVERED', labelHi: 'पहुंच गया' },
        { key: 'PAYMENT_RECEIVED', labelHi: 'भुगतान हो गया' }
      ];

      const statusMap = {
        'ORDER_CONFIRMED': 'कंफर्म',
        'TRANSPORT_PENDING': 'परिवहन बाकी',
        'PICKED_UP': 'उठाया गया',
        'IN_TRANSIT': 'रास्ते में',
        'DELIVERED': 'पहुंच गया',
        'PAYMENT_PENDING': 'भुगतान बाकी',
        'PAYMENT_RECEIVED': 'भुगतान हो गया'
      };

      const normalized = (res.data || []).map((order) => {
        if (order.steps) return order;
        
        const orderStatusIndex = Math.max(0, STATUS_ORDER.indexOf(order.status));
        
        const steps = STATUS_LABELS.map((s) => {
          const stepIndex = STATUS_ORDER.indexOf(s.key);
          return {
            labelHi: s.labelHi,
            done: orderStatusIndex >= stepIndex,
            date: orderStatusIndex >= stepIndex ? order.updatedAt : null 
          };
        });

        const paymentStatus = order.status === 'PAYMENT_RECEIVED' ? 'paid' : 'pending';
        const paymentStatusHi = paymentStatus === 'paid' ? 'भुगतान हो गया' : 'बाकी';

        return {
          ...order,
          id: order._id || order.id,
          farmerName: order.farmer?.name || order.farmerName || 'Unknown Farmer',
          farmerLocation: order.farmer?.location || order.farmerLocation || 'Unknown Location',
          buyerName: order.buyer?.name || order.buyerName || 'Unknown Buyer',
          statusHi: statusMap[order.status] || order.status,
          paymentStatus,
          paymentStatusHi,
          steps
        };
      });

      setData(normalized);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filtersKey, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  return { data, orders: data, loading, error, refetch: loadData };
}
