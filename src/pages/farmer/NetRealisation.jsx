import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export default function NetRealisation() {
  const { lotId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // User input costs
  const [transportCost, setTransportCost] = useState(500); 
  const [storageCost, setStorageCost] = useState(0);

  const fetchNetRealisation = async () => {
    if (USE_MOCK) {
      // Generate synthetic mock data for net realisation
      setLoading(true);
      setTimeout(() => {
        const qty = 50;
        const mockData = {
          lot: { id: lotId, cropName: 'Wheat', quantity: qty, unit: 'Quintal' },
          costs: { transportCost, storageCost },
          mandiOptions: [
            { id: 'm1', type: 'mandi', name: 'Kanpur APMC', crop: 'Wheat', sellingPrice: 2200, quantity: qty, grossRealisation: 2200*qty, transportCost, storageCost, netRealisation: (2200*qty) - transportCost - storageCost },
            { id: 'm2', type: 'mandi', name: 'Unnao APMC', crop: 'Wheat', sellingPrice: 2150, quantity: qty, grossRealisation: 2150*qty, transportCost, storageCost, netRealisation: (2150*qty) - transportCost - storageCost },
          ],
          buyerOptions: [
            { id: 'o1', type: 'buyer', name: 'Ravi Traders', crop: 'Wheat', sellingPrice: 2250, quantity: qty, grossRealisation: 2250*qty, transportCost, storageCost, netRealisation: (2250*qty) - transportCost - storageCost }
          ]
        };
        const allOpts = [...mockData.mandiOptions, ...mockData.buyerOptions].sort((a,b) => b.netRealisation - a.netRealisation);
        mockData.bestOption = allOpts[0];
        setData(mockData);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Backend automatically applies these flat costs
      const res = await api.get(`/net-realisation/${lotId}?transportCost=${transportCost}&storageCost=${storageCost}`);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce refetch when costs change
  useEffect(() => {
    if (!lotId) return;
    const timeout = setTimeout(() => {
      fetchNetRealisation();
    }, 300);
    return () => clearTimeout(timeout);
  }, [lotId, transportCost, storageCost]);

  if (!lotId) {
    return (
      <Layout title="Net Realisation" showBack>
        <div className="p-4">Please select a lot to view net realisation.</div>
      </Layout>
    );
  }

  return (
    <Layout title="à¤¶à¥ à¤¦à¥ à¤§ à¤²à¤¾à¤­ (Net Realisation)" showBack>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Cost Inputs */}
        <Card className="bg-blue-50 border-blue-100 p-4">
          <h3 className="text-sm font-bold text-blue-800 mb-3 uppercase">à¤–à¤°à¥ à¤š à¤•à¤¾ à¤…à¤¨à¥ à¤®à¤¾à¤¨ (Estimated Costs)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Transport Cost (â‚¹ Total)
              </label>
              <input
                type="number"
                value={transportCost}
                onChange={(e) => setTransportCost(Number(e.target.value))}
                className="w-full rounded-lg border-gray-300 p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Storage Cost (â‚¹ Total)
              </label>
              <input
                type="number"
                value={storageCost}
                onChange={(e) => setStorageCost(Number(e.target.value))}
                className="w-full rounded-lg border-gray-300 p-2 text-sm"
              />
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">
            * Adjust costs to accurately compare your selling options.
          </p>
        </Card>

        {loading && !data ? <LoadingState /> : null}
        {error ? <ErrorState message={error.message} /> : null}

        {data && (
          <>
            {/* Lot Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Selected Crop</p>
              <div className="flex justify-between items-end mt-1">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{data.lot.cropName}</h2>
                  <p className="text-sm text-gray-600">Qty: {data.lot.quantity} {data.lot.unit}</p>
                </div>
              </div>
            </div>

            {/* Best Option Highlight */}
            {data.bestOption ? (
              <div className="bg-green-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">âœ¨</div>
                <h3 className="text-green-100 text-sm font-bold uppercase tracking-wide">Best Selling Option</h3>
                <h2 className="text-2xl font-bold mt-1">
                  {data.bestOption.name}
                  {data.bestOption.type === 'mandi' && <span className="text-sm font-normal ml-2 bg-green-500 px-2 py-0.5 rounded text-white">(Govt. Mandi)</span>}
                  {data.bestOption.type === 'buyer' && <span className="text-sm font-normal ml-2 bg-blue-500 px-2 py-0.5 rounded text-white">(Buyer Offer)</span>}
                </h2>
                
                <div className="mt-4 bg-white/10 rounded-xl p-3 grid grid-cols-2 gap-2 text-sm">
                  <div>Selling Price:</div>
                  <div className="font-bold text-right">â‚¹{data.bestOption.sellingPrice} /{data.lot.unit}</div>
                  
                  <div>Gross Realisation:</div>
                  <div className="font-bold text-right">â‚¹{data.bestOption.grossRealisation.toLocaleString()}</div>
                  
                  <div className="text-green-200 border-t border-green-500/50 pt-1 mt-1">Transport Cost:</div>
                  <div className="text-green-200 text-right border-t border-green-500/50 pt-1 mt-1">- â‚¹{data.bestOption.transportCost}</div>
                  
                  <div className="text-green-200">Storage Cost:</div>
                  <div className="text-green-200 text-right">- â‚¹{data.bestOption.storageCost}</div>
                  
                  <div className="font-bold text-lg border-t border-white/20 pt-2 mt-1">NET REALISATION:</div>
                  <div className="font-bold text-lg text-right border-t border-white/20 pt-2 mt-1">â‚¹{data.bestOption.netRealisation.toLocaleString()}</div>
                </div>
              </div>
            ) : (
              <EmptyState title="No Options Available" subtitle="There are no nearby mandis or buyer offers for this crop." />
            )}

            {/* Other Options */}
            {data.bestOption && (data.mandiOptions.length > 0 || data.buyerOptions.length > 0) && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase px-1">Other Options Available</h3>
                
                {[...data.buyerOptions, ...data.mandiOptions]
                  .filter(opt => opt.id !== data.bestOption.id)
                  .sort((a, b) => b.netRealisation - a.netRealisation)
                  .map((opt) => (
                    <Card key={opt.id + opt.type} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">
                            {opt.name}
                            <span className="text-[10px] uppercase font-bold text-gray-500 ml-2 bg-gray-100 px-1.5 py-0.5 rounded">
                              {opt.type}
                            </span>
                          </h4>
                          {opt.type === 'mandi' && opt.date && (
                            <p className="text-xs text-gray-400 mt-0.5">Govt Data: {new Date(opt.date).toLocaleDateString()}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1 font-medium">Price: â‚¹{opt.sellingPrice} /{data.lot.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-0.5">Net Realisation</p>
                          <p className="text-xl font-bold text-green-600">â‚¹{opt.netRealisation.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <div>Gross: <span className="font-medium text-gray-700">â‚¹{opt.grossRealisation}</span></div>
                        <div>Transport: <span className="font-medium text-red-500">-â‚¹{opt.transportCost}</span></div>
                        <div>Storage: <span className="font-medium text-red-500">-â‚¹{opt.storageCost}</span></div>
                      </div>
                    </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
