// FarmerOffers — offers received on farmer's lots
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import OfferCard from '../../components/farmer/OfferCard';
import EmptyState from '../../components/common/EmptyState';
import { offers as initialOffers } from '../../data/mockOffers';

const STATUS_TABS = [
  { key: 'all',       label: 'सभी' },
  { key: 'pending',   label: '⏳ नए' },
  { key: 'accepted',  label: '✅ स्वीकृत' },
  { key: 'completed', label: '🤝 पूर्ण' },
];

export default function FarmerOffers() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [offerList, setOfferList] = useState(initialOffers.filter((o) => o.farmerId === 'f1'));

  function handleAccept(offerId) {
    setOfferList((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'accepted' } : o))
    );
  }

  function handleReject(offerId) {
    setOfferList((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'rejected' } : o))
    );
  }

  const filtered =
    activeTab === 'all'
      ? offerList
      : offerList.filter((o) => o.status === activeTab);

  const pendingCount = offerList.filter((o) => o.status === 'pending').length;

  return (
    <Layout title="मेरे ऑफर / My Offers" showBack>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Pending alert */}
        {pendingCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            <p className="text-sm text-yellow-800 font-medium">
              {pendingCount} नए ऑफर आपका इंतज़ार कर रहे हैं!
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                activeTab === tab.key
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Offer list */}
        {filtered.length === 0 ? (
          <EmptyState
            emoji="🤝"
            title="कोई ऑफर नहीं"
            subtitle="अभी कोई ऑफर नहीं आया है। अपने लॉट सक्रिय रखें।"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onAccept={handleAccept}
                onReject={handleReject}
                onViewBuyer={() => navigate(`/buyer-profile/${offer.buyerId}`)}
                showActions
              />
            ))}
          </div>
        )}

        {/* Tip */}
        <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 border border-blue-100">
          💡 <strong>सलाह:</strong> ऑफर स्वीकार करने से पहले खरीदार की रेटिंग और समीक्षाएँ जरूर देखें।
        </div>
      </div>
    </Layout>
  );
}
