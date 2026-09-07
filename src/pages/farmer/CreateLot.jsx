import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import { useCreateLot } from '../../hooks/useLots';
import { useMandi } from '../../hooks/useMandi';
import LoadingState from '../../components/common/LoadingState';

// Today's date string in YYYY-MM-DD format
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function CreateLot() {
  const navigate = useNavigate();
  const { data: mandiPrices, loading: mandiLoading } = useMandi();
  const { createLot, loading: creating, error } = useCreateLot();
  
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  
  const [form, setForm] = useState({
    cropName: '',
    district: '',
    market: '',
    quantity: '',
    unit: 'quintal',
    askingPrice: '',
    quality: '',
    location: '',
    description: '',
    availableFrom: '',
  });

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // Derived unique crops
  const uniqueCrops = useMemo(() => {
    if (!mandiPrices) return [];
    return [...new Set(mandiPrices.map(m => m.cropName))].sort();
  }, [mandiPrices]);

  // Derived unique districts for the selected crop
  const availableDistricts = useMemo(() => {
    if (!form.cropName || !mandiPrices) return [];
    return [...new Set(mandiPrices.filter(m => m.cropName === form.cropName).map(m => m.district))].sort();
  }, [mandiPrices, form.cropName]);

  // Derived markets for the selected crop and district
  const availableMarkets = useMemo(() => {
    if (!form.cropName || !form.district || !mandiPrices) return [];
    return mandiPrices
      .filter(m => m.cropName === form.cropName && m.district === form.district)
      .sort((a, b) => (b.modalPrice || b.price) - (a.modalPrice || a.price));
  }, [mandiPrices, form.cropName, form.district]);

  // Find the exact selected record
  const selectedMandiRecord = useMemo(() => {
    return availableMarkets.find(m => m.market === form.market) || null;
  }, [availableMarkets, form.market]);

  // Modal Price
  const modalPrice = selectedMandiRecord ? (selectedMandiRecord.modalPrice || selectedMandiRecord.price) : 0;
  
  // Available Grades (often 'FAQ' or specific grade in the record)
  const availableGrades = useMemo(() => {
    if (!selectedMandiRecord) return ['FAQ', 'Not specified'];
    const grade = selectedMandiRecord.grade;
    return grade && grade !== 'FAQ' ? [grade, 'FAQ', 'Not specified'] : ['FAQ', 'Not specified'];
  }, [selectedMandiRecord]);

  // Ensure default quality is set if empty but options available
  useEffect(() => {
    if (selectedMandiRecord && !form.quality && availableGrades.length > 0) {
      update('quality', availableGrades[0]);
    }
  }, [selectedMandiRecord, availableGrades, form.quality]);

  // Reset dependent fields when parent changes
  function handleCropChange(crop) {
    setForm(prev => ({ ...prev, cropName: crop, district: '', market: '', quality: '' }));
  }
  function handleDistrictChange(dist) {
    setForm(prev => ({ ...prev, district: dist, market: '', quality: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // Build payload matching backend Lot schema
      const payload = {
        ...form,
        askingPrice: form.askingPrice || modalPrice,
        // Backend validation requires cropName
      };
      await createLot(payload);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || err.response?.data?.message || 'Failed to create lot');
    }
  }

  if (mandiLoading) return <LoadingState />;

  if (submitted) {
    return (
      <Layout title="लॉट बनाएं" showBack>
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">लॉट सफलतापूर्वक बनाया!</h2>
          <p className="text-gray-500 mb-1">Lot Created Successfully!</p>
          <p className="text-sm text-gray-500 mb-8 max-w-xs">
            आपका {form.cropName} लॉट बाज़ार में दिखने लगेगा और खरीदार आपसे संपर्क करेंगे।
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
                setForm({ cropName: '', district: '', market: '', quantity: '', unit: 'quintal', askingPrice: '', quality: '', location: '', description: '', availableFrom: '' });
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
    <Layout title="नया लॉट बनाएं / Create Lot" showBack>
      <div className="max-w-lg mx-auto px-4 py-4 mb-10">
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
          {/* —— Step 1: Crop and Market Data —— */}
          {step === 1 && (
            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  फसल / Crop
                </label>
                <select
                  value={form.cropName}
                  onChange={(e) => handleCropChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white"
                  required
                >
                  <option value="">-- फसल चुनें / Select Crop --</option>
                  {uniqueCrops.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ज़िला / District
                </label>
                <select
                  value={form.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={!form.cropName}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white disabled:bg-gray-100"
                  required
                >
                  <option value="">-- ज़िला चुनें / Select District --</option>
                  {availableDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  मंडी / Market
                </label>
                <select
                  value={form.market}
                  onChange={(e) => update('market', e.target.value)}
                  disabled={!form.district}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white disabled:bg-gray-100"
                  required
                >
                  <option value="">-- मंडी चुनें / Select Market --</option>
                  {availableMarkets.map(m => (
                    <option key={m.market} value={m.market}>
                      {m.market} (₹{m.modalPrice || m.price}/Qtl)
                    </option>
                  ))}
                </select>
              </div>

              {selectedMandiRecord && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm text-blue-800 font-semibold mb-1">
                    Mandi Price (Modal): ₹{modalPrice} / Quintal
                  </p>
                  <p className="text-xs text-blue-600">
                    Variety: {selectedMandiRecord.variety} | Grade: {selectedMandiRecord.grade || 'FAQ'}
                  </p>
                </div>
              )}

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
                  placeholder="e.g. 50"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 text-base"
                />
              </div>

              {form.quantity && selectedMandiRecord && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-sm text-green-800 font-semibold">
                    Expected Amount: ₹{(Number(form.quantity) * modalPrice).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Based on {form.quantity} quintals × ₹{modalPrice}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!form.cropName || !form.district || !form.market || !form.quantity}
              >
                आगे बढ़ें →
              </Button>
            </div>
          )}

          {/* —— Step 2: Quality, Location & Details —— */}
          {step === 2 && (
            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  गुणवत्ता / Quality Grade
                </label>
                <select
                  value={form.quality}
                  onChange={(e) => update('quality', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white"
                  required
                >
                  <option value="">-- Select Grade --</option>
                  {availableGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  आपकी मांग / Your Asking Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={form.askingPrice}
                    onChange={(e) => update('askingPrice', e.target.value)}
                    min="1"
                    placeholder={`e.g. ${modalPrice}`}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 text-base"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave empty to use Mandi price.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📍 स्थान / Lot Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  required
                  placeholder="Where is the produce currently stored?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📅 उपलब्ध तारीख / Available From
                </label>
                <input
                  type="date"
                  value={form.availableFrom}
                  onChange={(e) => update('availableFrom', e.target.value)}
                  min={todayStr()}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  विवरण / Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={3}
                  placeholder="More details about your crop..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 text-base resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Crop:</span>
                  <span className="font-medium">{form.cropName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Market:</span>
                  <span className="font-medium">{form.market}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Expected:</span>
                  <span className="font-medium text-green-700">₹{(Number(form.quantity) * (Number(form.askingPrice) || modalPrice)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" fullWidth onClick={() => setStep(1)} disabled={creating}>
                  ← वापस
                </Button>
                <Button type="submit" variant="primary" size="lg" fullWidth disabled={!form.location || !form.quality || creating}>
                  {creating ? 'लॉट बना रहे हैं...' : 'लॉट डालें 🌾'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
