/**
 * useNotifications — notification hooks
 *
 * useNotifications()   → user notifications + unread count
 *                         mock  → GET from mockNotifications.js + AuthContext readNotifIds
 *                         real  → GET /api/notifications
 *
 * markRead(id)         → mock  → AuthContext.markNotifRead(id)
 *                         real  → PATCH /api/notifications/:id/read
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { notifications as mockNotifs } from '../data/mockNotifications';
import { useAuth } from '../context/AuthContext';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ─── useNotifications ─────────────────────────────────────────────────────────

/**
 * Fetch notifications for the authenticated user.
 *
 * In mock mode:
 *   - Returns mockNotifications merged with readNotifIds from AuthContext
 *   - markRead() calls AuthContext.markNotifRead() to persist read state
 *
 * In real mode:
 *   - Fetches from GET /api/notifications
 *   - markRead() calls PATCH /api/notifications/:id/read
 *   - The AuthContext readNotifIds localStorage mechanism is superseded by
 *     the database-persisted `read` field
 *
 * @returns {{ data, unreadCount, loading, error, refetch, markRead }}
 */
export function useNotifications() {
  const { readNotifIds, markNotifRead } = useAuth();

  // Merge server `read` with client-side readNotifIds (mock mode only)
  const getMock = () =>
    mockNotifs.map((n) => ({
      ...n,
      read: n.read || readNotifIds.has(n.id),
    }));

  const computeUnread = (list) => list.filter((n) => !n.read).length;

  const initialData = USE_MOCK ? getMock() : [];

  const [data, setData]             = useState(initialData);
  const [unreadCount, setUnread]    = useState(computeUnread(initialData));
  const [loading, setLoading]       = useState(!USE_MOCK);
  const [error, setError]           = useState(null);

  const loadData = useCallback(async () => {
    if (USE_MOCK) {
      const merged = getMock();
      setData(merged);
      setUnread(computeUnread(merged));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/notifications');
      setData(res.data);
      setUnread(res.meta?.unreadCount ?? computeUnread(res.data));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [readNotifIds]); // re-run when AuthContext read set changes

  useEffect(() => { loadData(); }, [loadData]);

  // markRead — updates both local state and the appropriate persistence layer
  const markRead = useCallback(
    async (id) => {
      if (USE_MOCK) {
        markNotifRead(id); // AuthContext handles localStorage persistence
        return;
      }
      try {
        await api.patch(`/notifications/${id}/read`);
        setData((prev) =>
          prev.map((n) =>
            n.id === id || n._id === id ? { ...n, read: true } : n
          )
        );
        setUnread((prev) => Math.max(0, prev - 1));
      } catch {
        // Non-critical: fail silently — notification read state is cosmetic
      }
    },
    [markNotifRead]
  );

  return { data, unreadCount, loading, error, refetch: loadData, markRead };
}
