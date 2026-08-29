// MyLots — farmer's crop lot listings
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LotCard from '../../components/farmer/LotCard';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/ui/Button';
import { lots } from '../../data/mockLots';

const STATUS_TABS = [
  { key: 'all',    label: 'सभी' },
  { key: 'active', label: '✅ सक्रिय' },
  { key: 'sold',   label: '🤝 बिक गए' },
];

export default function MyLots() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const myLots = lots.filter((l) => l.farmerId === 'f1');
  const filtered = activeTab === 'all' ? myLots : myLots.filter((l) => l.status === activeTab);

  return (
    <Layout title="मेरी फसल / My Crops" showBack>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Add new lot CTA */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon="+"
          onClick={() => navigate('/farmer/create-lot')}
        >
          नया लॉट बनाएँ / Add New Lot
        </Button>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'कुल लॉट', value: myLots.length },
            { label: 'सक्रिय', value: myLots.filter((l) => l.status === 'active').length },
            { label: 'बिक गए', value: myLots.filter((l) => l.status === 'sold').length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-[0_1px_6px_rgba(0,0,0,0.08)] p-3 text-center">
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Status tabs */}
        <div className="flex gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                activeTab === tab.key
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lot list */}
        {filtered.length === 0 ? (
          <EmptyState
            emoji="🌾"
            title="कोई लॉट नहीं"
            subtitle="अभी तक कोई लॉट नहीं बनाया। नया लॉट बनाएँ।"
            action={
              <Button variant="primary" onClick={() => navigate('/farmer/create-lot')}>
                नया लॉट बनाएँ
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                onClick={() => navigate('/farmer/offers')}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
