// Notifications — all notifications for both roles
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { timeAgo } from '../../utils/helpers';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export default function Notifications() {
  const navigate = useNavigate();
  const { user, readNotifIds, markNotifRead } = useAuth();
  const { data: notifications, loading, error } = useNotifications();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  // A notification is considered read if it was always read OR marked read this session
  function isRead(n) {
    return n.read || readNotifIds.has(n.id);
  }

  // Pick the correct destination route based on the logged-in user's role
  function getLinkForUser(n) {
    return user?.role === 'buyer' ? n.buyerLink : n.farmerLink;
  }

  function handleNotifClick(n) {
    // 1. Mark as read in shared context (updates bell count immediately)
    markNotifRead(n.id);
    // 2. Navigate to the role-appropriate destination
    navigate(getLinkForUser(n));
  }

  const unread = notifications.filter((n) => !isRead(n));
  const read   = notifications.filter((n) =>  isRead(n));

  return (
    <Layout title="सूचनाएँ / Notifications" showBack>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {notifications.length === 0 ? (
          <EmptyState
            emoji="🔔"
            title="कोई सूचना नहीं"
            subtitle="कोई नई सूचना नहीं है।"
          />
        ) : (
          <>
            {unread.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  🔴 नई सूचनाएँ ({unread.length})
                </p>
                <div className="space-y-2">
                  {unread.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className="bg-green-50 border border-green-100 rounded-2xl p-4 cursor-pointer hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                        {/* Unread indicator dot */}
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {read.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  पुरानी सूचनाएँ
                </p>
                <div className="space-y-2">
                  {read.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3 opacity-70">
                        <span className="text-2xl">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-700 text-sm">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
