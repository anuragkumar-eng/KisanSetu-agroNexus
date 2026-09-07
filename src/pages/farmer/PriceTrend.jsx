// PriceTrend — 14-day price chart + AI recommendation for a specific crop
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import { Sparkline, DayLabels } from '../../components/farmer/Sparkline';
import { useMandi, useMandiHistory } from '../../hooks/useMandi';
import { priceRecommendations } from '../../data/mockMandi'; // Kept for AI advice
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export default function PriceTrend() {
  const { crop } = useParams();
  const navigate = useNavigate();

  const cropKey = crop?.toLowerCase();
  
  const { prices: mandiPrices, loading: pricesLoading, error: pricesError } = useMandi();
  const { data: trendData, loading: trendLoading, error: trendError } = useMandiHistory(cropKey);
  
  const priceData = (mandiPrices || []).find(
    (m) => m.cropName.toLowerCase() === cropKey
  );
  const rec = priceRecommendations[cropKey];

  if (pricesLoading || trendLoading) return <LoadingState />;
  if (pricesError || trendError) return <ErrorState message={pricesError?.message || trendError?.message} />;

  if (!priceData) {
    return (
      <Layout title="ट्रेंड" showBack>
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-gray-600">इस फसल का डेटा उपलब्ध नहीं है।</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>वापस जाएँ</Button>
        </div>
      </Layout>
    );
  }

  const isSell = rec?.action === 'sell';
  const latestPrice = trendData?.[trendData.length - 1] ?? priceData.price;
  const firstPrice = trendData?.[0] ?? priceData.price;
  const changePct = (((latestPrice - firstPrice) / firstPrice) * 100).toFixed(1);
  const isUp = latestPrice >= firstPrice;

  return (
    <Layout title={`${priceData.cropNameHi} — ट्रेंड`} showBack>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.08)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{priceData.cropEmoji}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{priceData.cropNameHi}</h2>
              <p className="text-gray-500 text-sm">{priceData.cropName} • {priceData.mandiHi}</p>
            </div>
          </div>

          {/* Current price */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-bold text-gray-900">
              ₹{latestPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-gray-500">/क्विंटल</span>
            <span className={`text-sm font-semibold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
              {isUp ? '+' : ''}{changePct}% (14 दिन)
            </span>
          </div>

          {/* MSP */}
          {priceData.msp && (
            <p className="text-xs text-gray-500 mb-4">
              MSP: ₹{priceData.msp.toLocaleString('en-IN')}/क्विंटल
              {priceData.price < priceData.msp ? (
                <span className="ml-1 text-red-500 font-medium">⚠️ MSP से नीचे</span>
              ) : (
                <span className="ml-1 text-green-600 font-medium">✅ MSP से ऊपर</span>
              )}
            </p>
          )}

          {/* Sparkline chart — now imported from shared component */}
          {trendData && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-2">📈 पिछले 14 दिन का भाव</p>
              <Sparkline data={trendData} />
              <DayLabels count={trendData.length} />
            </div>
          )}
        </div>

        {/* Price range */}
        {trendData && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'न्यूनतम', value: Math.min(...trendData), color: 'text-red-500' },
              { label: 'औसत', value: Math.round(trendData.reduce((a, b) => a + b) / trendData.length), color: 'text-gray-700' },
              { label: 'अधिकतम', value: Math.max(...trendData), color: 'text-green-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.08)] p-3 text-center">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-base font-bold ${s.color}`}>
                  ₹{s.value.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* AI Recommendation */}
        {rec && (
          <div
            className={[
              'rounded-2xl p-4 border-l-4',
              isSell ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-400',
            ].join(' ')}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🤖</span>
              <p className="font-bold text-gray-700">AI सलाह</p>
            </div>
            <p className={`text-xl font-bold ${isSell ? 'text-green-700' : 'text-yellow-700'}`}>
              {isSell ? '✅ अभी बेचें!' : '⏳ थोड़ा इंतज़ार करें'}
            </p>
            <p className="text-sm text-gray-600 mt-1">{rec.reasonHi}</p>
            <p className="text-xs text-gray-400 mt-0.5 italic">{rec.reason}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon="🌾"
            onClick={() => navigate('/farmer/create-lot')}
          >
            फसल बेचें
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            icon="📊"
            onClick={() => navigate('/farmer/mandi')}
          >
            सभी भाव
          </Button>
        </div>

        {/* Real markets available for this crop */}
        <div className="bg-white rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.08)] p-4">
          <p className="font-semibold text-gray-700 mb-3">🏪 उपलब्ध मंडियां / Available Markets</p>
          <div className="space-y-4">
            {(mandiPrices || [])
              .filter(m => m.cropName.toLowerCase() === cropKey)
              .sort((a, b) => (b.modalPrice || b.price) - (a.modalPrice || a.price))
              .map((m, idx) => (
                <div key={m.id || idx} className="py-3 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-800">{m.mandiHi || m.mandi || m.market}</h4>
                      <p className="text-xs text-gray-500">{new Date(m.date || m.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700 text-lg">₹{(m.modalPrice || m.price).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-gray-400">/{m.unitHi || m.unit || 'Quintal'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Min Price:</span>
                      <span className="font-medium">₹{m.minPrice || m.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Variety:</span>
                      <span className="font-medium">{m.variety || 'Common'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Price:</span>
                      <span className="font-medium">₹{m.maxPrice || m.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Grade:</span>
                      <span className="font-medium">{m.grade || 'FAQ'}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
