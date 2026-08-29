// CreateLot — form for farmers to list a new crop lot
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import { cropTypes, qualityGrades } from '../../data/mockLots';

// Today's date string in YYYY-MM-DD format (for the date input min attribute)
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function CreateLot() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 2-step form
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    cropType: '',
    quantity: '',
    unit: 'quintal',
    askingPrice: '',
    quality: '',
    location: '',
    description: '',
    availableFrom: '',
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // In real app: POST /api/lots with the full form object below
    // const payload = { ...form, createdAt: new Date().toISOString() };
    setSubmitted(true);
  }

  const selectedCrop = cropTypes.find((c) => c.value === form.cropType);

  if (submitted) {
    return (
      <Layout title="लॉट बनाएँ" showBack>
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">लॉट सफलतापूर्वक बनाया!</h2>
          <p className="text-gray-500 mb-1">Lot Created Successfully!</p>
          <p className="text-sm text-gray-500 mb-8 max-w-xs">
            आपका {selectedCrop?.labelHi || 'फसल'} लॉट बाज़ार में दिखने लगेगा और खरीदार आपसे संपर्क करेंगे।
          </p>
          <div className="flex gap-3 w-full max-w-xs">
            <Button variant="primary" fullWidth onClick={() => navigate('/farmer/my-lots')}>
              मेरे लॉट देखें
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setForm({ cropType: '', quantity: '', unit: 'quintal', askingPrice: '', quality: '', location: '', description: '', availableFrom: '' });
              }}
            >
              नया लॉट
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="नया लॉट बनाएँ / Create Lot" showBack>
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                  step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400',
                ].join(' ')}
              >
                {s}
              </div>
              <div className={`flex-1 h-1 rounded ${s < 2 ? (step > s ? 'bg-green-600' : 'bg-gray-200') : 'hidden'}`} />
            </div>
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
          {/* ── Step 1: Crop basics ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-lg font-semibold text-gray-800 mb-1">कौन सी फसल बेचनी है?</p>
                <p className="text-sm text-gray-500 mb-3">Which crop do you want to sell?</p>
                <div className="grid grid-cols-3 gap-2">
                  {cropTypes.map((crop) => (
                    <button
                      key={crop.value}
                      type="button"
                      onClick={() => update('cropType', crop.value)}
                      className={[
                        'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors cursor-pointer',
                        form.cropType === crop.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300',
                      ].join(' ')}
                    >
                      <span className="text-2xl">{crop.emoji}</span>
                      <span className="text-xs font-medium text-gray-700 text-center leading-tight">{crop.labelHi}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  मात्रा / Quantity (क्विंटल)
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => update('quantity', e.target.value)}
                  required
                  min="1"
                  placeholder="जैसे: 50"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  माँग मूल्य / Asking Price (₹/क्विंटल)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={form.askingPrice}
                    onChange={(e) => update('askingPrice', e.target.value)}
                    required
                    min="1"
                    placeholder="2250"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  गुणवत्ता / Quality Grade
                </label>
                <div className="space-y-2">
                  {qualityGrades.map((g) => (
                    <label
                      key={g.value}
                      className={[
                        'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors',
                        form.quality === g.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="quality"
                        value={g.value}
                        checked={form.quality === g.value}
                        onChange={() => update('quality', g.value)}
                        className="accent-green-600"
                      />
                      <span className="text-sm font-medium text-gray-700">{g.labelHi}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!form.cropType || !form.quantity || !form.askingPrice || !form.quality}
              >
                आगे बढ़ें →
              </Button>
            </div>
          )}

          {/* ── Step 2: Location & details ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-lg font-semibold text-gray-800 mb-1">और जानकारी दें</p>
                <p className="text-sm text-gray-500 mb-4">Add more details to attract buyers.</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📍 स्थान / Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  required
                  placeholder="जैसे: करनाल, हरियाणा"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base"
                />
              </div>

              {/* Available From — date picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📅 उपलब्ध तारीख / Available From
                </label>
                <input
                  type="date"
                  value={form.availableFrom}
                  onChange={(e) => update('availableFrom', e.target.value)}
                  min={todayStr()}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base"
                />
                <p className="text-xs text-gray-400 mt-1">खाली छोड़ने पर: तुरंत उपलब्ध / Leave empty: available now</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  विवरण / Description (वैकल्पिक)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={3}
                  placeholder="फसल के बारे में अधिक जानकारी... / More details about your crop..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-green-50 rounded-2xl p-4 space-y-2">
                <p className="font-semibold text-green-700 mb-2">✅ लॉट सारांश</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">फसल: </span>
                    <span className="font-medium">{selectedCrop?.emoji} {selectedCrop?.labelHi}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">मात्रा: </span>
                    <span className="font-medium">{form.quantity} क्विंटल</span>
                  </div>
                  <div>
                    <span className="text-gray-500">मूल्य: </span>
                    <span className="font-medium text-green-700">₹{Number(form.askingPrice).toLocaleString('en-IN')}/क्विं</span>
                  </div>
                  <div>
                    <span className="text-gray-500">कुल: </span>
                    <span className="font-medium">₹{(Number(form.quantity) * Number(form.askingPrice)).toLocaleString('en-IN')}</span>
                  </div>
                  {form.availableFrom && (
                    <div className="col-span-2">
                      <span className="text-gray-500">उपलब्ध: </span>
                      <span className="font-medium">
                        {new Date(form.availableFrom).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" fullWidth onClick={() => setStep(1)}>
                  ← वापस
                </Button>
                <Button type="submit" variant="primary" size="lg" fullWidth disabled={!form.location}>
                  लॉट डालें 🌾
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
