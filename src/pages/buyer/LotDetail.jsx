// LotDetail — full lot details with make-offer form
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { lots } from '../../data/mockLots';
import { mandiPrices } from '../../data/mockMandi';
import { formatRupees } from '../../utils/helpers';

export default function LotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lot = lots.find((l) => l.id === id);

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQty, setOfferQty] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [offerSent, setOfferSent] = useState(false);

  if (!lot) {
    return (
      <Layout title="लॉट विवरण" showBack>
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-gray-600 text-lg">यह लॉट नहीं मिला।</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>वापस जाएँ</Button>
        </div>
      </Layout>
    );
  }

  // Find mandi reference price for comparison
  const mandiRef = mandiPrices.find(
    (m) => m.cropName.toLowerCase() === lot.cropName.toLowerCase()
  );

  const priceDiff = mandiRef ? lot.askingPrice - mandiRef.price : null;
  const totalValue = lot.quantity * lot.askingPrice;

  function handleSubmitOffer(e) {
    e.preventDefault();
    // In real app: POST /api/offers
    setOfferSent(true);
    setShowOfferForm(false);
  }

  return (
    <Layout title={`${lot.cropNameHi} — विवरण`} showBack>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Offer sent success */}
        {offerSent && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-700">ऑफर भेज दिया गया!</p>
              <p className="text-xs text-gray-500">Offer sent! किसान जल्द जवाब देंगे।</p>
            </div>
            <button onClick={() => navigate('/buyer/offers')} className="ml-auto text-xs text-green-600 font-semibold underline">
              देखें →
            </button>
          </div>
        )}

        {/* Crop header */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
              {lot.cropEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-800">{lot.cropNameHi}</h2>
                <StatusBadge status={lot.status} />
              </div>
              <p className="text-gray-500 text-sm">{lot.cropName}</p>
              <p className="text-xs text-gray-400 mt-1">📍 {lot.locationHi || lot.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-gray-50 rounded-xl py-3 text-center">
              <p className="text-xs text-gray-500">मात्रा</p>
              <p className="font-bold text-gray-800">{lot.quantity}</p>
              <p className="text-[10px] text-gray-400">{lot.unitHi}</p>
            </div>
            <div className="bg-green-50 rounded-xl py-3 text-center">
              <p className="text-xs text-gray-500">माँग मूल्य</p>
              <p className="font-bold text-green-700">₹{lot.askingPrice.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-gray-400">/क्विंटल</p>
            </div>
            <div className="bg-gray-50 rounded-xl py-3 text-center">
              <p className="text-xs text-gray-500">कुल मूल्य</p>
              <p className="font-bold text-gray-800 text-sm">{formatRupees(totalValue)}</p>
            </div>
          </div>
        </Card>

        {/* Quality + Description */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <p className="font-semibold text-gray-700">📋 विवरण / Details</p>
            <Badge variant="green">{lot.qualityHi}</Badge>
          </div>
          <p className="text-sm text-gray-600">{lot.descriptionHi || lot.description}</p>
          {lot.offerCount > 0 && (
            <p className="text-xs text-orange-600 font-medium mt-2">
              🔥 {lot.offerCount} और खरीदार इस लॉट में रुचि रखते हैं!
            </p>
          )}
        </Card>

        {/* Mandi price comparison */}
        {mandiRef && (
          <Card>
            <p className="font-semibold text-gray-700 mb-3">📊 मंडी भाव तुलना</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">मंडी दाम</p>
                <p className="text-lg font-bold text-gray-800">₹{mandiRef.price.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center">
                <span className={`text-sm font-bold ${priceDiff > 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {priceDiff > 0 ? `+₹${priceDiff} महँगा` : `₹${Math.abs(priceDiff)} सस्ता`}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">किसान माँग</p>
                <p className="text-lg font-bold text-green-700">₹{lot.askingPrice.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Farmer info */}
        <Card>
          <p className="font-semibold text-gray-700 mb-3">👨‍🌾 किसान / Farmer</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">👨‍🌾</div>
            <div>
              <p className="font-semibold text-gray-800">{lot.farmerName}</p>
              <p className="text-xs text-gray-500">📍 {lot.location}</p>
              <p className="text-xs text-green-600 mt-0.5">✅ KisanSetu सदस्य</p>
            </div>
          </div>
        </Card>

        {/* Make Offer form */}
        {lot.status === 'active' && !offerSent && (
          <>
            {!showOfferForm ? (
              <Button variant="primary" size="lg" fullWidth icon="🤝" onClick={() => setShowOfferForm(true)}>
                ऑफर दें / Make an Offer
              </Button>
            ) : (
              <Card className="space-y-4">
                <p className="font-semibold text-gray-700">🤝 अपना ऑफर दें</p>
                <form onSubmit={handleSubmitOffer} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">आपका मूल्य (/क्विंटल)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        required min="1"
                        placeholder={lot.askingPrice}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">मात्रा (क्विंटल)</label>
                    <input
                      type="number"
                      value={offerQty}
                      onChange={(e) => setOfferQty(e.target.value)}
                      required min="1" max={lot.quantity}
                      placeholder={`अधिकतम ${lot.quantity}`}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">संदेश (वैकल्पिक)</label>
                    <textarea
                      value={offerMsg}
                      onChange={(e) => setOfferMsg(e.target.value)}
                      rows={2}
                      placeholder="किसान को कोई बात बताएँ..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm resize-none"
                    />
                  </div>
                  {offerPrice && offerQty && (
                    <div className="bg-green-50 rounded-xl px-4 py-2 text-sm">
                      <span className="text-gray-600">कुल राशि: </span>
                      <span className="font-bold text-green-700">
                        ₹{(Number(offerPrice) * Number(offerQty)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="md" fullWidth onClick={() => setShowOfferForm(false)}>रद्द करें</Button>
                    <Button type="submit" variant="primary" size="md" fullWidth>ऑफर भेजें</Button>
                  </div>
                </form>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
