// Marketplace — buyer browses available crop lots
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LotCard from '../../components/farmer/LotCard';
import EmptyState from '../../components/common/EmptyState';
import { lots } from '../../data/mockLots';
import { cropTypes } from '../../data/mockLots';

export default function Marketplace() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const activeLots = lots.filter((l) => l.status === 'active');

  const filtered = activeLots
    .filter((lot) => {
      const matchSearch =
        lot.cropName.toLowerCase().includes(search.toLowerCase()) ||
        lot.cropNameHi.includes(search) ||
        lot.location.toLowerCase().includes(search.toLowerCase());
      const matchCrop =
        selectedCrop === 'all' || lot.cropName.toLowerCase() === selectedCrop;
      return matchSearch && matchCrop;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.askingPrice - b.askingPrice;
      if (sortBy === 'price_desc') return b.askingPrice - a.askingPrice;
      if (sortBy === 'quantity') return b.quantity - a.quantity;
      // newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const cropFilters = [
    { value: 'all', label: 'सभी', emoji: '🌿' },
    ...cropTypes.filter((c) =>
      activeLots.some((l) => l.cropName.toLowerCase() === c.value)
    ),
  ];

  return (
    <Layout title="बाज़ार / Marketplace" showBack>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="फसल, स्थान खोजें... / Search crop, location"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm bg-white"
          />
        </div>

        {/* Crop filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {cropFilters.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedCrop(c.value)}
              className={[
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-colors',
                selectedCrop === c.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50',
              ].join(' ')}
            >
              <span>{c.emoji}</span>
              <span>{c.labelHi || c.label}</span>
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{filtered.length} लॉट उपलब्ध</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500"
          >
            <option value="newest">नए पहले</option>
            <option value="price_asc">कम दाम पहले</option>
            <option value="price_desc">ज़्यादा दाम पहले</option>
            <option value="quantity">अधिक मात्रा</option>
          </select>
        </div>

        {/* Lot list */}
        {filtered.length === 0 ? (
          <EmptyState
            emoji="🛒"
            title="कोई लॉट नहीं मिला"
            subtitle="कृपया दूसरे शब्द से खोजें।"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                showFarmer
                onClick={() => navigate(`/buyer/lot/${lot.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
