/**
 * AuthContext — authentication state for KisanSetu
 *
 * Mock mode  (VITE_USE_MOCK=true):
 *   login() validates against DEMO_ACCOUNTS and returns the user object.
 *   No network call is made. Token is set to a static placeholder string.
 *
 * Real mode  (VITE_USE_MOCK=false):
 *   login() calls POST /api/auth/login.
 *   JWT from the response is stored in localStorage under 'kisansetu_token'.
 *   api.js reads this token automatically on every subsequent request.
 *
 * In both modes login() is async and returns:
 *   - the user object on success  (callers use returnedUser.role for redirect)
 *   - false on failure
 *
 * SECURITY RULE: Never infer role from the email address string.
 * Always read role from the returned user object.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { api, ApiError } from '../services/api';

// ─── Demo accounts (mock mode only) ──────────────────────────────────────────

const DEMO_ACCOUNTS = {
  'farmer@demo.com': {
    id:             'f1',
    email:          'farmer@demo.com',
    password:       '1234',
    name:           'Ramesh Kumar',
    nameHi:         'रमेश कुमार',
    role:           'farmer',
    location:       'Kanpur, Uttar Pradesh',
    state:          'Uttar Pradesh',
    district:       'Kanpur',
    phone:          '+91 98765 11111',
    crops:          ['Wheat', 'Rice', 'Mustard'],
    cropsHi:        ['गेहूँ', 'धान', 'सरसों'],
    avatar:         '👨‍🌾',
    memberSince:    '2024',
    bankLinked:     true,
    aadhaarVerified: true,
  },
  'buyer@demo.com': {
    id:          'b1',
    email:       'buyer@demo.com',
    password:    '1234',
    name:        'Ramesh Agarwal',
    nameHi:      'रमेश अग्रवाल',
    role:        'buyer',
    company:     'Agarwal Traders Pvt. Ltd.',
    location:    'Delhi',
    state:       'Delhi',
    district:    'New Delhi',
    phone:       '+91 98765 43210',
    avatar:      '👨‍💼',
    memberSince: '2021',
    gstLinked:   true,
    verified:    true,
  },
};

/**
 * Whether to use mock auth.
 * Defaults to true when VITE_USE_MOCK is unset (safe for development).
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  // ── Persisted user ──────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kisansetu_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Clean up bad nested data from previous sessions
      return parsed.user ? parsed.user : parsed;
    } catch {
      return null;
    }
  });

  // ── JWT token — read by api.js from localStorage directly ──────────────────
  // We also keep it in React state so consumers can react to login/logout.
  // Note: api.js reads localStorage.getItem('kisansetu_token') independently —
  //       it does NOT need the React token state to be passed via props.
  const [token, setToken] = useState(() =>
    localStorage.getItem('kisansetu_token') ?? null
  );

  // ── Auth error message (shown on login form) ────────────────────────────────
  const [error, setError] = useState('');

  // ─── Notification read-state (mock mode only) ──────────────────────────────
  // In real mode, read state is persisted in MongoDB and returned by
  // GET /api/notifications. The Set below is only used when USE_MOCK=true.
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem('kisansetu_read_notifs');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // ─── Restore user from backend on mount ────────────────────────────────────
  useEffect(() => {
    if (!USE_MOCK && token) {
      api.get('/auth/me')
        .then(res => {
          // Unify the data shape regardless of nesting level
          const payload = res.data || res;
          const freshUser = payload.user || payload;
          
          setUser(freshUser);
          localStorage.setItem('kisansetu_user', JSON.stringify(freshUser));
        })
        .catch(err => {
          // If token is invalid/expired, log them out
          if (err instanceof ApiError && err.status === 401) {
            logout();
          }
        });
    }
  }, [token]);

  // ─── login() ─────────────────────────────────────────────────────────────────
  /**
   * Authenticate the user.
   * Always async — works with await in both mock and real mode.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Object|false} User object on success, false on failure.
   */
  async function login(email, password) {
    setError('');

    // ── Mock path ──────────────────────────────────────────────────────────────
    if (USE_MOCK) {
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

      // Store user (no real JWT in mock mode — use a placeholder token)
      const mockToken = `mock_token_${safeUser.role}_${Date.now()}`;
      setUser(safeUser);
      setToken(mockToken);
      localStorage.setItem('kisansetu_user',  JSON.stringify(safeUser));
      localStorage.setItem('kisansetu_token', mockToken);
      return safeUser;
    }

    // ── Real API path ──────────────────────────────────────────────────────────
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // Robustly handle data shape variations
      const payload = res.data || res;
      const apiUser = payload.user || payload;
      const jwt = payload.token;

      setUser(apiUser);
      setToken(jwt);
      localStorage.setItem('kisansetu_user',  JSON.stringify(apiUser));
      localStorage.setItem('kisansetu_token', jwt);
      return apiUser;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isUnauthorized) {
          setError('गलत Email या पासवर्ड। / Invalid email or password.');
        } else if (err.isForbidden) {
          setError('खाता निलंबित है। / Account is suspended.');
        } else if (err.isNetworkError) {
          setError('नेटवर्क से कनेक्ट नहीं हो सका। / Network error.');
        } else {
          setError(err.message || 'लॉगिन विफल। / Login failed.');
        }
      } else {
        setError('लॉगिन विफल। / Login failed.');
      }
      return false;
    }
  }

  // ─── loginWithPhone() ──────────────────────────────────────────────────────────
  /**
   * Authenticate the user using Phone.email JSON URL.
   *
   * @param {string} user_json_url
   * @returns {Object|false} User object on success, false on failure.
   */
  async function loginWithPhone(user_json_url) {
    setError('');

    if (USE_MOCK) {
      setError('Phone login not supported in demo mode.');
      return false;
    }

    try {
      const res = await api.post('/auth/phone-login', { user_json_url });
      
      const payload = res.data || res;
      const apiUser = payload.user || payload;
      const jwt = payload.token;

      setUser(apiUser);
      setToken(jwt);
      localStorage.setItem('kisansetu_user',  JSON.stringify(apiUser));
      localStorage.setItem('kisansetu_token', jwt);
      return apiUser;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isUnauthorized) {
          setError('यूज़र नहीं मिला। कृपया पहले रजिस्टर करें। / User not found.');
        } else {
          setError(err.message || 'लॉगिन विफल। / Login failed.');
        }
      } else {
        setError('लॉगिन विफल। / Login failed.');
      }
      return false;
    }
  }

  // ─── Email OTP Methods ──────────────────────────────────────────────────────────
  async function sendEmailOtp(email) {
    try {
      const res = await api.post('/auth/email-otp/send', { email });
      return { success: true, message: res.data?.message || res.message || 'OTP sent' };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to send OTP' };
    }
  }

  async function verifyEmailOtp(email, otp) {
    setError('');

    if (USE_MOCK) {
      setError('Email OTP login not supported in demo mode.');
      return false;
    }

    try {
      const res = await api.post('/auth/email-otp/verify', { email, otp });
      
      const payload = res.data || res;
      const apiUser = payload.user || payload;
      const jwt = payload.token;

      setUser(apiUser);
      setToken(jwt);
      localStorage.setItem('kisansetu_user',  JSON.stringify(apiUser));
      localStorage.setItem('kisansetu_token', jwt);
      return apiUser;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid OTP.');
      } else {
        setError('Invalid OTP.');
      }
      return false;
    }
  }

  // ─── logout() ────────────────────────────────────────────────────────────────
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kisansetu_user');
    localStorage.removeItem('kisansetu_token');
    // Clear notification read cache so next login starts fresh
    setReadNotifIds(new Set());
    localStorage.removeItem('kisansetu_read_notifs');
  }

  // ── markNotifRead() — mock mode notification read state ─────────────────────
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
      value={{
        user,
        token,
        login,
        loginWithPhone,
        sendEmailOtp,
        verifyEmailOtp,
        logout,
        error,
        setError,
        readNotifIds,
        markNotifRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── useAuth ──────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
