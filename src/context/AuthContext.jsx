import { createContext, useContext, useState } from 'react';

// Demo accounts — replace with real API auth later
const DEMO_ACCOUNTS = {
  'farmer@demo.com': {
    id: 'f1',
    email: 'farmer@demo.com',
    password: '1234',
    name: 'Ramesh Kumar',
    nameHi: 'रमेश कुमार',
    role: 'farmer',
    location: 'Karnal, Haryana',
    phone: '+91 98765 11111',
    crops: ['Wheat', 'Rice', 'Mustard'],
    cropsHi: ['गेहूँ', 'धान', 'सरसों'],
    avatar: '👨‍🌾',
    memberSince: '2024',
    bankLinked: true,
    aadhaarVerified: true,
  },
  'buyer@demo.com': {
    id: 'b1',
    email: 'buyer@demo.com',
    password: '1234',
    name: 'Ramesh Agarwal',
    nameHi: 'रमेश अग्रवाल',
    role: 'buyer',
    company: 'Agarwal Traders Pvt. Ltd.',
    location: 'Delhi',
    phone: '+91 98765 43210',
    avatar: '👨‍💼',
    memberSince: '2021',
    gstLinked: true,
    verified: true,
  },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Try loading persisted user from localStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kisansetu_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [error, setError] = useState('');

  // Notification read state — persisted to localStorage within session
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem('kisansetu_read_notifs');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Login — returns the user object on success, false on failure.
  // Callers must use returnedUser.role for redirect — never infer from email.
  function login(email, password) {
    setError('');
    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (!account) {
      setError('Email नहीं मिला। / Email not found.');
      return false;
    }
    if (account.password !== password) {
      setError('गलत पासवर्ड। / Wrong password.');
      return false;
    }
    const { password: _p, ...safeUser } = account;
    setUser(safeUser);
    localStorage.setItem('kisansetu_user', JSON.stringify(safeUser));
    return safeUser; // return user object so caller reads .role directly
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('kisansetu_user');
    // Clear read-notification cache on logout so next session starts fresh
    setReadNotifIds(new Set());
    localStorage.removeItem('kisansetu_read_notifs');
  }

  // Mark a single notification as read (by id)
  function markNotifRead(id) {
    setReadNotifIds((prev) => {
      if (prev.has(id)) return prev; // already read — skip re-render
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('kisansetu_read_notifs', JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, error, setError, readNotifIds, markNotifRead }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming auth context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
