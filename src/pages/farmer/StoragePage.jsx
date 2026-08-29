// StoragePage — farmer-facing view of nearby storage and cold storage options
// Uses mock data from mockOrders.js — will come from GET /api/storage in the real app

import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { storageOptions } from '../../data/mockOrders';

// Storage type colour mapping
const typeColors = {
  Government: 'green',
  Private: 'blue',
};

export default function StoragePage() {
  return (
    <Layout title="भंडारण / Storage" showBack>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Demo data notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-2 text-xs text-yellow-800">
          <span className="text-base mt-0.5">📌</span>
          <span>
            नीचे दिखाए गए डेटा डेमो हैं। असली ऐप में आपके नज़दीकी गोदाम और कोल्ड स्टोरेज दिखेंगे।
            <br />
            <span className="italic">Demo data — real app will show nearby verified storage.</span>
          </span>
        </div>

        {/* Info banner */}
        <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-green-800">
          <span>🏭</span>
          <span>{storageOptions.length} भंडारण विकल्प उपलब्ध</span>
        </div>

        {/* Storage cards */}
        <div className="space-y-4">
          {storageOptions.map((s) => (
            <Card key={s.id} className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800">{s.nameHi}</h3>
                    <Badge variant={typeColors[s.type] || 'gray'}>
                      {s.type === 'Government' ? 'सरकारी' : 'प्राइवेट'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-green-700">
                    ₹{s.ratePerMonth}
                  </p>
                  <p className="text-[10px] text-gray-400">/क्विंटल/माह</p>
                </div>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-xl py-2.5">
                  <p className="text-[10px] text-gray-500">दूरी</p>
                  <p className="font-bold text-gray-800 text-sm">{s.distanceKm} km</p>
                </div>
                <div className="bg-green-50 rounded-xl py-2.5">
                  <p className="text-[10px] text-gray-500">खाली क्षमता</p>
                  <p className="font-bold text-green-700 text-sm">{s.availableCapacity}</p>
                </div>
                <div className="bg-gray-50 rounded-xl py-2.5">
                  <p className="text-[10px] text-gray-500">कुल क्षमता</p>
                  <p className="font-bold text-gray-800 text-sm">{s.capacity}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>📍</span>
                <span>{s.location}</span>
              </div>

              {/* Suitable crops */}
              <div>
                <p className="text-xs text-gray-500 mb-1.5">उपयुक्त फसलें / Suitable Crops</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.crops.map((crop) => (
                    <span
                      key={crop}
                      className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-full px-2.5 py-0.5 font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <p className="text-xs text-gray-500 mb-1.5">सुविधाएँ / Facilities</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.facilities.map((f) => (
                    <span
                      key={f}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-0.5 font-medium"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span>📞</span>
                  <span className="font-medium">{s.contact}</span>
                </div>
                <button
                  className="text-xs text-green-600 font-semibold hover:underline"
                  onClick={() => {
                    // In real app: open phone dialer or booking flow
                  }}
                >
                  संपर्क करें →
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom tip */}
        <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 border border-blue-100">
          💡 <strong>सलाह:</strong> भंडारण में रखने से आप बेहतर दाम का इंतज़ार कर सकते हैं।
          कोल्ड स्टोरेज में सब्ज़ियाँ और फल 2-4 सप्ताह तक सुरक्षित रहते हैं।
        </div>
      </div>
    </Layout>
  );
}
