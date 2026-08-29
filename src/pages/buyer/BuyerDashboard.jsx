// BuyerDashboard — home screen for buyers
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LotCard from '../../components/farmer/LotCard';
import { useAuth } from '../../context/AuthContext';
import { lots } from '../../data/mockLots';
import { buyerOffers } from '../../data/mockOffers';
import { orders } from '../../data/mockOrders';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const activeLots = lots.filter((l) => l.status === 'active').slice(0, 3);
  const pendingOffers = buyerOffers.filter((o) => o.status === 'pending');
  const activeOrders = orders.filter((o) => o.status === 'in_transit');

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white">
          <p className="text-blue-100 text-sm">नमस्ते 🙏</p>
          <h2 className="text-2xl font-bold mt-0.5">{user?.name}</h2>
          <p className="text-blue-100 text-sm mt-0.5">{user?.company}</p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="warning"
              size="sm"
              icon="🛒"
              onClick={() => navigate('/buyer/marketplace')}
            >
              बाज़ार देखें
            </Button>
            <Button
              size="sm"
              icon="📦"
              onClick={() => navigate('/buyer/orders')}
              className="!bg-white/20 !text-white hover:!bg-white/30"
            >
              मेरे ऑर्डर
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '🤝', value: pendingOffers.length, label: 'ऑफर दिए', sub: 'Pending Offers' },
            { emoji: '🚚', value: activeOrders.length, label: 'रास्ते में', sub: 'In Transit' },
            { emoji: '✅', value: '1', label: 'पूर्ण', sub: 'Completed' },
          ].map((s) => (
            <Card key={s.label} className="text-center py-3">
              <p className="text-2xl">{s.emoji}</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Active orders */}
        {activeOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">🚚 सक्रिय ऑर्डर</h3>
              <button onClick={() => navigate('/buyer/orders')} className="text-blue-600 text-xs font-semibold hover:underline">सभी →</button>
            </div>
            {activeOrders.map((order) => (
              <Card key={order.id} onClick={() => navigate('/buyer/orders')} className="flex items-center gap-3">
                <span className="text-2xl">{order.cropEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{order.cropNameHi} — {order.farmerName}</p>
                  <p className="text-xs text-gray-500">📍 {order.farmerLocation}</p>
                  <p className="text-xs text-green-600 font-medium mt-0.5">🚚 {order.statusHi}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400">{order.quantity} क्विं</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recent lots in marketplace */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">🌾 नए लॉट</h3>
            <button onClick={() => navigate('/buyer/marketplace')} className="text-blue-600 text-xs font-semibold hover:underline">सभी देखें →</button>
          </div>
          <div className="space-y-2">
            {activeLots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                showFarmer
                onClick={() => navigate(`/buyer/lot/${lot.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">⚡ त्वरित कार्य</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '🛒', label: 'Marketplace', to: '/buyer/marketplace' },
              { emoji: '🤝', label: 'मेरे ऑफर', to: '/buyer/offers' },
              { emoji: '📦', label: 'ऑर्डर ट्रैक करें', to: '/buyer/orders' },
              { emoji: '❓', label: 'मदद / Help', to: '/help' },
            ].map((q) => (
              <Card key={q.label} onClick={() => navigate(q.to)} className="flex items-center gap-3 py-3">
                <span className="text-2xl">{q.emoji}</span>
                <span className="text-sm font-medium text-gray-700">{q.label}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
