// BuyerProfile — buyer's profile page
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProfileRow from '../../components/common/ProfileRow';
import { useAuth } from '../../context/AuthContext';

export default function BuyerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  if (!user) return null;

  return (
    <Layout title="प्रोफाइल / Profile" showBack>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Avatar + name */}
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-5xl mb-3 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
            {user.avatar}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.company}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="blue">खरीदार / Buyer</Badge>
            {user.verified && <Badge variant="green">✅ सत्यापित</Badge>}
          </div>
        </div>

        {/* Info */}
        <Card>
          <p className="font-semibold text-gray-700 mb-2">👤 जानकारी / Details</p>
          <ProfileRow emoji="🏢" label="कंपनी / Company"       value={user.company} />
          <ProfileRow emoji="📍" label="स्थान / Location"      value={user.location} />
          <ProfileRow emoji="📱" label="मोबाइल / Mobile"       value={user.phone} />
          <ProfileRow emoji="📧" label="ईमेल / Email"          value={user.email} />
          <ProfileRow emoji="📅" label="सदस्यता / Member Since" value={user.memberSince} />
        </Card>

        {/* Verification */}
        <Card>
          <p className="font-semibold text-gray-700 mb-3">🔒 सत्यापन / Verification</p>
          {[
            { label: 'GST नंबर / GST',    done: user.gstLinked },
            { label: 'पैन कार्ड / PAN Card', done: true },
            { label: 'KYC पूर्ण / KYC Done', done: user.verified },
          ].map((v) => (
            <div key={v.label} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <span className={v.done ? 'text-green-500' : 'text-gray-300'}>
                {v.done ? '✅' : '⬜'}
              </span>
              <span className="text-sm text-gray-700">{v.label}</span>
              {!v.done && (
                <span className="ml-auto text-xs text-blue-600 font-medium cursor-pointer hover:underline">
                  जोड़ें →
                </span>
              )}
            </div>
          ))}
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '🤝', value: '2',   label: 'ऑफर दिए' },
            { emoji: '📦', value: '2',   label: 'ऑर्डर' },
            { emoji: '⭐', value: '4.7', label: 'रेटिंग' },
          ].map((s) => (
            <Card key={s.label} className="text-center py-3">
              <p className="text-xl">{s.emoji}</p>
              <p className="font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button variant="outline" size="lg" fullWidth icon="❓" onClick={() => navigate('/help')}>
            मदद / Help & Support
          </Button>
          <Button variant="danger" size="lg" fullWidth icon="🚪" onClick={handleLogout}>
            लॉगआउट / Logout
          </Button>
        </div>
      </div>
    </Layout>
  );
}
