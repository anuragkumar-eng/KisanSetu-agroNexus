// Farmer Dashboard — home screen for farmers
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PriceCard from '../../components/farmer/PriceCard';
import LotCard from '../../components/farmer/LotCard';
import { useAuth } from '../../context/AuthContext';
import { mandiPrices, priceRecommendations } from '../../data/mockMandi';
import { lots } from '../../data/mockLots';

function RecommendationCard({ cropKey }) {
  const rec = priceRecommendations[cropKey];
  if (!rec) return null;
  const isSell = rec.action === 'sell';

  return (
    <div
      className={[
        'rounded-2xl p-4 border-l-4',
        isSell
          ? 'bg-green-50 border-green-500'
          : 'bg-yellow-50 border-yellow-400',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{isSell ? '✅' : '⏳'}</span>
        <p className={`font-bold text-lg ${isSell ? 'text-green-700' : 'text-yellow-700'}`}>
          {isSell ? 'अभी बेचें!' : 'थोड़ा इंतज़ार करें'}
        </p>
      </div>
      <p className="text-xs text-gray-600 mt-1">{rec.reasonHi}</p>
      <p className="text-[10px] text-gray-400 mt-0.5 italic">{rec.reason}</p>
    </div>
  );
}

export default function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const myLots = lots.filter(l => l.farmerId === 'f1' && l.status === 'active');
  const topPrices = mandiPrices.slice(0, 4);
  const myCrop = user?.crops?.[0]?.toLowerCase() || 'wheat';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-5 text-white">
          <p className="text-green-100 text-sm">नमस्ते 🙏</p>
          <h2 className="text-2xl font-bold mt-0.5">{user?.nameHi || user?.name}</h2>
          <p className="text-green-100 text-sm mt-1">📍 {user?.location}</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              variant="warning"
              size="sm"
              icon="+"
              onClick={() => navigate('/farmer/create-lot')}
            >
              फसल बेचें
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon="📊"
              onClick={() => navigate('/farmer/mandi')}
              className="!bg-white/20 !text-white hover:!bg-white/30"
            >
              मंडी भाव
            </Button>
          </div>
        </div>

        {/* AI Recommendation */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            🤖 AI सलाह / AI Advice
          </h3>
          <RecommendationCard cropKey={myCrop} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '🌾', value: myLots.length, label: 'सक्रिय लॉट', labelEn: 'Active Lots' },
            { emoji: '🤝', value: myLots.reduce((s, l) => s + l.offerCount, 0), label: 'ऑफर मिले', labelEn: 'Offers' },
            { emoji: '💰', value: '₹2.05L', label: 'कुल बिक्री', labelEn: 'Total Sales' },
          ].map((s) => (
            <Card key={s.label} className="text-center py-3">
              <p className="text-2xl">{s.emoji}</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Today's top mandi prices */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              📊 आज के भाव
            </h3>
            <button
              onClick={() => navigate('/farmer/mandi')}
              className="text-green-600 text-xs font-semibold hover:underline"
            >
              सभी देखें →
            </button>
          </div>
          <div className="space-y-2">
            {topPrices.map((item) => (
              <PriceCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/farmer/trend/${item.cropName.toLowerCase()}`)}
              />
            ))}
          </div>
        </div>

        {/* My active lots */}
        {myLots.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                🌾 मेरे सक्रिय लॉट
              </h3>
              <button
                onClick={() => navigate('/farmer/my-lots')}
                className="text-green-600 text-xs font-semibold hover:underline"
              >
                सभी देखें →
              </button>
            </div>
            <div className="space-y-2">
              {myLots.map((lot) => (
                <LotCard
                  key={lot.id}
                  lot={lot}
                  onClick={() => navigate('/farmer/my-lots')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick action grid — 6 items in 2×3 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            ⚡ त्वरित कार्य
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '📦', label: 'नया लॉट बनाएँ', to: '/farmer/create-lot' },
              { emoji: '🏪', label: 'मंडी भाव देखें', to: '/farmer/mandi' },
              { emoji: '🤝', label: 'मेरे ऑफर',       to: '/farmer/offers'     },
              { emoji: '🏭', label: 'भंडारण / Storage', to: '/farmer/storage'   },
              { emoji: '❓', label: 'मदद / Help',       to: '/help'              },
              { emoji: '👤', label: 'प्रोफाइल',         to: '/farmer/profile'   },
            ].map((q) => (
              <Card
                key={q.label}
                onClick={() => navigate(q.to)}
                className="flex items-center gap-3 py-3"
              >
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
