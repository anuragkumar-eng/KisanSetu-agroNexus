// MandiPrices — full mandi price listing with search and filter
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import CropGroupCard from '../../components/farmer/CropGroupCard';
import EmptyState from '../../components/common/EmptyState';
import { useMandi } from '../../hooks/useMandi';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

const FILTERS = [
  { key: 'all',    label: 'सभी' },
  { key: 'up',     label: '📈 बढ़ा' },
  { key: 'down',   label: '📉 घटा' },
  { key: 'stable', label: '➡️ स्थिर' },
];

export default function MandiPrices() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const { prices: mandiPrices, loading, error } = useMandi();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  const filtered = (mandiPrices || []).filter((item) => {
    const matchSearch =
      item.cropName.toLowerCase().includes(search.toLowerCase()) ||
      (item.cropNameHi && item.cropNameHi.includes(search)) ||
      (item.mandi && item.mandi.toLowerCase().includes(search.toLowerCase())) ||
      (item.market && item.market.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'all' || item.trend === filter;
    return matchSearch && matchFilter;
  });

  const grouped = filtered.reduce((acc, item) => {
    const key = item.cropName.toLowerCase();
    if (!acc[key]) {
      acc[key] = {
        cropName: item.cropName,
        cropNameHi: item.cropNameHi || item.cropName,
        cropEmoji: item.cropEmoji || '🌾',
        markets: [],
      };
    }
    acc[key].markets.push(item);
    return acc;
  }, {});

  const groupedArray = Object.values(grouped).sort((a, b) => a.cropName.localeCompare(b.cropName));

  return (
    <Layout title="मंडी भाव / Mandi Prices" showBack>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="फसल या मंडी खोजें... / Search crop or mandi"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm bg-white"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={[
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                filter === f.key
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Info banner */}
        <div className="bg-green-50 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-green-700">
          <span>🕒</span>
          <span>भाव आज सुबह अपडेट हुए। / Prices updated this morning.</span>
        </div>

        {/* Price list */}
        {groupedArray.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="कुछ नहीं मिला"
            subtitle="कृपया दूसरे शब्द से खोजें।"
          />
        ) : (
          <div className="space-y-3">
            {groupedArray.map((group) => (
              <CropGroupCard key={group.cropName} group={group} />
            ))}
          </div>
        )}

        {/* MSP note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
          <p className="font-semibold mb-1">📌 MSP (न्यूनतम समर्थन मूल्य) क्या है?</p>
          <p>MSP वह न्यूनतम मूल्य है जो सरकार किसानों को देने की गारंटी देती है। अगर बाज़ार भाव MSP से कम हो तो सरकारी खरीद केंद्र पर जाएँ।</p>
        </div>
      </div>
    </Layout>
  );
}
