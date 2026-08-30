// Login page — role-based demo login
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function Login() {
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // login() is async — works for both mock demo login and real API login
    const loggedInUser = await login(email.trim(), password);
    setLoading(false);
    if (loggedInUser) {
      // Use the actual role from the authenticated user — never infer from email
      navigate(loggedInUser.role === 'buyer' ? '/buyer' : '/farmer', { replace: true });
    }
  }

  function fillDemo(role) {
    setError('');
    if (role === 'farmer') {
      setEmail('farmer@demo.com');
      setPassword('1234');
    } else {
      setEmail('buyer@demo.com');
      setPassword('1234');
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🌾</div>
        <h1 className="text-3xl font-bold text-green-700">KisanSetu</h1>
        <p className="text-gray-500 text-sm mt-1">किसान सेतु — आपका बाज़ार</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">लॉगिन करें / Login</h2>

        {/* Demo quick login */}
        <div className="mb-6 p-3 bg-green-50 rounded-2xl space-y-2">
          <p className="text-xs text-gray-500 font-medium text-center mb-2">⚡ Demo — एक क्लिक में लॉगिन</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('farmer')}
              className="flex flex-col items-center gap-1 p-2.5 bg-white rounded-xl border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer"
            >
              <span className="text-2xl">👨‍🌾</span>
              <span className="text-xs font-semibold text-green-700">किसान</span>
              <span className="text-[10px] text-gray-400">Farmer</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('buyer')}
              className="flex flex-col items-center gap-1 p-2.5 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <span className="text-2xl">👨‍💼</span>
              <span className="text-xs font-semibold text-blue-700">खरीदार</span>
              <span className="text-[10px] text-gray-400">Buyer</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ईमेल / Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="farmer@demo.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              पासवर्ड / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2 border border-red-200">
              ⚠️ {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            लॉगिन करें / Login
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          नया खाता?{' '}
          <Link to="/register" className="text-green-600 font-semibold hover:underline">
            रजिस्टर करें
          </Link>
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        Smart India Hackathon 2026 — KisanSetu Demo
      </p>
    </div>
  );
}
