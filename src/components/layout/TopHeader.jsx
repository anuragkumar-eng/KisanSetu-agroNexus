// TopHeader — mobile top bar with back button, title, and notification bell
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notifications } from '../../data/mockNotifications';

export default function TopHeader({ title, showBack = false, rightElement }) {
  const navigate = useNavigate();
  const { readNotifIds } = useAuth();

  // Count notifications that are neither permanently read nor marked read this session
  const unreadCount = notifications.filter((n) => !n.read && !readNotifIds.has(n.id)).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: back button or logo */}
        <div className="flex items-center gap-2 min-w-[40px]">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Back"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">🌾</span>
              <span className="text-green-700 font-bold text-base">KisanSetu</span>
            </div>
          )}
        </div>

        {/* Center: page title */}
        {title && (
          <h1 className="text-base font-semibold text-gray-800 truncate max-w-[180px]">
            {title}
          </h1>
        )}

        {/* Right: notifications or custom element */}
        <div className="flex items-center gap-2 min-w-[40px] justify-end">
          {rightElement || (
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
