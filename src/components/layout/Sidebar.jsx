// Sidebar — desktop-only navigation sidebar (hidden on mobile)
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notifications } from '../../data/mockNotifications';

const farmerNav = [
  { to: '/farmer',          icon: '🏠', label: 'होम / Home'          },
  { to: '/farmer/mandi',    icon: '📊', label: 'मंडी भाव / Mandi'    },
  { to: '/farmer/my-lots',  icon: '🌾', label: 'मेरी फसल / My Crops' },
  { to: '/farmer/offers',   icon: '🤝', label: 'ऑफर / Offers'         },
  { to: '/farmer/storage',  icon: '🏭', label: 'भंडारण / Storage'     },
  { to: '/farmer/profile',  icon: '👤', label: 'प्रोफाइल / Profile'   },
  { to: '/notifications',   icon: '🔔', label: 'सूचनाएँ / Alerts'     },
  { to: '/help',            icon: '❓', label: 'मदद / Help'            },
];

const buyerNav = [
  { to: '/buyer',             icon: '🏠', label: 'डैशबोर्ड / Dashboard' },
  { to: '/buyer/marketplace', icon: '🛒', label: 'बाज़ार / Marketplace'  },
  { to: '/buyer/offers',      icon: '🤝', label: 'मेरे ऑफर / My Offers' },
  { to: '/buyer/orders',      icon: '📦', label: 'ऑर्डर / Orders'        },
  { to: '/buyer/profile',     icon: '👤', label: 'प्रोफाइल / Profile'    },
  { to: '/notifications',     icon: '🔔', label: 'सूचनाएँ / Alerts'      },
  { to: '/help',              icon: '❓', label: 'मदद / Help'             },
];

export default function Sidebar() {
  const { user, logout, readNotifIds } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === 'buyer' ? buyerNav : farmerNav;

  // Live unread count — updates whenever a notification is marked read
  const unreadCount = notifications.filter((n) => !n.read && !readNotifIds.has(n.id)).length;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 shadow-[1px_0_6px_rgba(0,0,0,0.06)]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <span className="text-3xl">🌾</span>
        <div>
          <p className="text-green-700 font-bold text-lg leading-tight">KisanSetu</p>
          <p className="text-gray-400 text-xs">किसान सेतु</p>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="flex items-center gap-3 px-4 py-4 mx-3 mt-4 bg-green-50 rounded-2xl">
          <span className="text-3xl">{user.avatar}</span>
          <div className="overflow-hidden">
            <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role === 'farmer' ? 'किसान' : 'खरीदार'} • {user.role}</p>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/farmer' || item.to === '/buyer'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium',
                isActive
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-700',
              ].join(' ')
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.to === '/notifications' && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <span className="text-lg">🚪</span>
          लॉगआउट / Logout
        </button>
      </div>
    </aside>
  );
}
