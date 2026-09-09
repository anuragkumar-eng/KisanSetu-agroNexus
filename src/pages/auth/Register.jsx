// Register page — simple registration form
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Button from '../../components/ui/Button';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('farmer'); // 'farmer' or 'buyer'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [userJsonUrl, setUserJsonUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Setup the global listener for Phone.email
    window.phoneEmailListener = (userObj) => {
      setUserJsonUrl(userObj.user_json_url);
    };
    
    // Add the script dynamically
    const script = document.createElement('script');
    script.src = "https://www.phone.email/sign_in_button_v1.js";
    script.async = true;
    document.querySelector('.pe_signin_button')?.appendChild(script);

    return () => {
      delete window.phoneEmailListener;
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!userJsonUrl && !USE_MOCK) {
      setErrorMsg('कृपया अपना फ़ोन नंबर वेरीफाई करें। / Please verify your phone number.');
      setLoading(false);
      return;
    }

    if (USE_MOCK) {
      setSubmitted(true);
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        phone, // Sent as fallback but backend uses user_json_url
        user_json_url: userJsonUrl,
        location,
        state: location.split(',')[1]?.trim() || 'Unknown',
        district: location.split(',')[0]?.trim() || 'Unknown'
      });
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
        navigate(loggedInUser.role === 'buyer' ? '/buyer' : '/farmer', { replace: true });
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">रजिस्ट्रेशन सफल!</h2>
        <p className="text-gray-600 mb-2">Registration Successful!</p>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          अब आप लॉगिन कर सकते हैं।
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
          लॉगिन करें
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🌾</div>
        <h1 className="text-2xl font-bold text-green-700">KisanSetu</h1>
        <p className="text-gray-500 text-sm">नया खाता बनाएं / Create Account</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-6">
        {/* Role selection */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-2">आप कौन हैं? / I am a:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={[
                'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors cursor-pointer',
                role === 'farmer'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-500 hover:border-green-300',
              ].join(' ')}
            >
              <span className="text-3xl">👨‍🌾</span>
              <span className="text-sm font-semibold">किसान / Farmer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={[
                'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors cursor-pointer',
                role === 'buyer'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-500 hover:border-blue-300',
              ].join(' ')}
            >
              <span className="text-3xl">👨‍💼</span>
              <span className="text-sm font-semibold">खरीदार / Buyer</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">पूरा नाम / Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ramesh Kumar"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">मोबाइल नंबर / Mobile</label>
            {userJsonUrl ? (
              <div className="w-full px-4 py-3 rounded-xl border border-green-200 bg-green-50 flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-green-700 font-medium">फ़ोन नंबर वेरीफाई हो गया / Verified</span>
              </div>
            ) : (
              <div className="flex justify-center mt-2">
                <div className="pe_signin_button" data-client-id="18281796168547548473"></div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ईमेल / Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">स्थान / Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="जिला, राज्य / District, State"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">पासवर्ड / Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              placeholder="••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={!userJsonUrl && !USE_MOCK}>
            रजिस्टर करें / Register
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          पहले से खाता है?{' '}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            लॉगिन करें
          </Link>
        </p>
      </div>
    </div>
  );
}
