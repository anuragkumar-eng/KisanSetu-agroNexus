// BuyerDetail — public buyer profile viewed by farmers
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { buyers } from '../../data/mockBuyers';

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="text-lg">
          {i < full ? '⭐' : hasHalf && i === full ? '🌟' : '☆'}
        </span>
      ))}
      <span className="text-sm font-bold text-gray-700 ml-1">{rating}</span>
    </div>
  );
}

export default function BuyerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const buyer = buyers.find((b) => b.id === id);

  if (!buyer) {
    return (
      <Layout title="खरीदार प्रोफाइल" showBack>
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-gray-600 text-lg">खरीदार नहीं मिला।</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>वापस जाएँ</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="खरीदार प्रोफाइल" showBack>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <Card className="text-center py-6 space-y-2">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-5xl mx-auto">
            {buyer.avatar}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{buyer.name}</h2>
          <p className="text-gray-500 text-sm">{buyer.company}</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {buyer.verified && <Badge variant="green">✅ सत्यापित</Badge>}
            <Badge variant="blue">📍 {buyer.location}</Badge>
            <Badge variant="gray">सदस्य: {buyer.memberSince}</Badge>
          </div>
          <div className="flex justify-center mt-1">
            <StarRating rating={buyer.rating} />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '🤝', value: buyer.totalTrades, label: 'कुल सौदे' },
            { emoji: '⭐', value: buyer.rating, label: 'रेटिंग' },
            { emoji: '📅', value: buyer.memberSince, label: 'सदस्यता' },
          ].map((s) => (
            <Card key={s.label} className="text-center py-3">
              <p className="text-xl">{s.emoji}</p>
              <p className="font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* About */}
        <Card>
          <p className="font-semibold text-gray-700 mb-2">ℹ️ परिचय</p>
          <p className="text-sm text-gray-600">{buyer.descriptionHi}</p>
        </Card>

        {/* Trading preferences */}
        <Card>
          <p className="font-semibold text-gray-700 mb-3">🌾 खरीद प्राथमिकताएँ</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <div>
                <span className="text-gray-500">फसलें: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {buyer.cropsHi.map((c) => (
                    <Badge key={c} variant="green">{c}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <p><span className="text-gray-500">मात्रा: </span><span className="font-medium">{buyer.minQuantity}–{buyer.maxQuantity} क्विंटल</span></p>
            </div>
            <div className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <p><span className="text-gray-500">गुणवत्ता: </span><span className="font-medium">{buyer.preferredQuality}</span></p>
            </div>
            <div className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <p><span className="text-gray-500">भुगतान: </span><span className="font-medium text-green-700">{buyer.paymentTermsHi}</span></p>
            </div>
          </div>
        </Card>

        {/* Reviews */}
        {buyer.reviews?.length > 0 && (
          <Card>
            <p className="font-semibold text-gray-700 mb-3">💬 किसानों की समीक्षाएँ</p>
            <div className="space-y-3">
              {buyer.reviews.map((r, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">👨‍🌾</span>
                    <p className="font-medium text-sm text-gray-800">{r.reviewer}</p>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: r.rating }, (_, j) => (
                        <span key={j} className="text-xs">⭐</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Trust note */}
        {!buyer.verified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
            ⚠️ यह खरीदार अभी सत्यापित नहीं है। ऑफर स्वीकार करते समय सावधान रहें।
          </div>
        )}

        {/* Back button */}
        <Button variant="outline" size="lg" fullWidth onClick={() => navigate(-1)}>
          ← वापस जाएँ
        </Button>
      </div>
    </Layout>
  );
}
