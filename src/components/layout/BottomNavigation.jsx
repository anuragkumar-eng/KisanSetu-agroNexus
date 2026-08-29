// BottomNavigation — mobile-only bottom tab bar
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notifications } from '../../data/mockNotifications';

// Farmer nav — 5 items (no notification tab; badge appears on profile bell instead)
const farmerNav = [
  { to: '/farmer',          icon: '🏠', label: 'होम',       isNotif: false },
  { to: '/farmer/mandi',    icon: '📊', label: 'मंडी',      isNotif: false },
  { to: '/farmer/my-lots',  icon: '🌾', label: 'मेरी फसल',  isNotif: false },
  { to: '/farmer/offers',   icon: '🤝', label: 'ऑफर',       isNotif: false },
  { to: '/notifications',   icon: '🔔', label: 'सूचनाएँ',   isNotif: true  },
];

// Buyer nav — 5 items
const buyerNav = [
  { to: '/buyer',             icon: '🏠', label: 'होम',       isNotif: false },
  { to: '/buyer/marketplace', icon: '🛒', label: 'बाज़ार',    isNotif: false },
  { to: '/buyer/offers',      icon: '🤝', label: 'ऑफर',       isNotif: false },
  { to: '/buyer/orders',      icon: '📦', label: 'ऑर्डर',     isNotif: false },
  { to: '/notifications',     icon: '🔔', label: 'सूचनाएँ',   isNotif: true  },
];

export default function BottomNavigation() {
  const { user, readNotifIds } = useAuth();
  const navItems = user?.role === 'buyer' ? buyerNav : farmerNav;

  // Live unread count — same calculation as TopHeader and Sidebar
  const unreadCount = notifications.filter((n) => !n.read && !readNotifIds.has(n.id)).length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div
        className="grid h-16"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/farmer' || item.to === '/buyer'}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-0.5 transition-colors',
                'text-xs font-medium',
                isActive ? 'text-green-600' : 'text-gray-400',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {/* Icon with optional notification badge */}
                <span className="relative">
                  <span
                    className={[
                      'text-xl leading-none p-1 rounded-xl transition-all inline-block',
                      isActive ? 'bg-green-50 scale-110' : '',
                    ].join(' ')}
                  >
                    {item.icon}
                  </span>
                  {item.isNotif && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <span className={isActive ? 'text-green-600' : 'text-gray-400'}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      {/* iOS safe area */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  );
}
