import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

import { searchLocation, getDrivingDistance } from '../../services/osm';
import { marketLocations, fallbackDistrictDistances } from '../../data/marketLocations';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Simple empty state component since it was missing in original imports
function EmptyState({ title, subtitle }) {
  return (
    <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <h3 className="font-bold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

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

  // Location State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingLoc, setSearchingLoc] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Distances State { mandiName: { value: number, type: 'osrm' | 'fallback' | 'missing' } }
  const [distances, setDistances] = useState({});
  const [calculatingDist, setCalculatingDist] = useState(false);

  const fetchNetRealisation = async () => {
    if (USE_MOCK) {
      setLoading(true);
      setTimeout(() => {
        const qty = 50;
        const mockData = {
          lot: { id: lotId, cropName: 'Wheat', quantity: qty, unit: 'Quintal' },
          costs: { transportCost, storageCost },
          mandiOptions: [
            { id: 'm1', type: 'mandi', name: 'Kanpur(Grain) APMC', crop: 'Wheat', sellingPrice: 2200, quantity: qty, grossRealisation: 2200*qty, transportCost, storageCost, netRealisation: (2200*qty) - transportCost - storageCost },
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
      const res = await api.get(`/net-realisation/${lotId}?transportCost=${transportCost}&storageCost=${storageCost}`);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lotId) return;
    const timeout = setTimeout(() => {
      fetchNetRealisation();
    }, 300);
    return () => clearTimeout(timeout);
  }, [lotId, transportCost, storageCost]);

  // Recalculate distances whenever user location or mandi data changes
  const lastCalculatedLocationRef = useRef(null);

  useEffect(() => {
    async function calcDistances() {
      if (!userLocation || !data || !data.mandiOptions) return;
      
      const locStr = `${userLocation.lat},${userLocation.lon}`;
      if (lastCalculatedLocationRef.current === locStr) return;
      lastCalculatedLocationRef.current = locStr;

      try {
        setCalculatingDist(true);
        const newDists = {};
        
        for (const opt of data.mandiOptions) {
          const marketInfo = marketLocations[opt.name];
          
          if (marketInfo && marketInfo.latitude !== 'NEEDS_CONFIG') {
            try {
              const dist = await getDrivingDistance(userLocation.lat, userLocation.lon, marketInfo.latitude, marketInfo.longitude);
              newDists[opt.name] = { value: dist, type: 'osrm' };
            } catch (err) {
              console.error(`OSRM route failed for ${opt.name}, using fallback.`, err);
              const fallback = fallbackDistrictDistances[marketInfo.district];
              newDists[opt.name] = fallback !== undefined 
                ? { value: fallback, type: 'fallback' } 
                : { value: null, type: 'missing' };
            }
          } else {
            // Needs config or no exact market match
            const district = marketInfo?.district;
            const fallback = fallbackDistrictDistances[district];
            newDists[opt.name] = fallback !== undefined 
              ? { value: fallback, type: 'fallback' } 
              : { value: null, type: 'missing' };
          }
        }
        
        setDistances(newDists);
        
        // --- Calculate PTL / FTL Transport Cost ---
        // Find distance to the "best" mandi or the closest mandi
        let bestDist = null;
        if (data.bestOption && data.bestOption.type === 'mandi' && newDists[data.bestOption.name] && newDists[data.bestOption.name].value !== null) {
          bestDist = newDists[data.bestOption.name].value;
        } else {
          // Find closest mandi
          let min = Infinity;
          for (const key in newDists) {
            if (newDists[key].value !== null && newDists[key].value < min) {
              min = newDists[key].value;
            }
          }
          if (min !== Infinity) bestDist = min;
        }

        if (bestDist !== null && data.lot && data.lot.quantity) {
          // PTL (Part Truck Load) vs FTL (Full Truck Load) logic
          // Heuristic: >= 40 quintals = FTL (cheaper per km)
          const isFTL = data.lot.quantity >= 40;
          const ratePerKmPerQuintal = isFTL ? 2.5 : 4.0;
          
          const calculatedCost = Math.round(bestDist * data.lot.quantity * ratePerKmPerQuintal);
          // Set a minimum threshold so it doesn't go unreasonably low for very short distances
          const finalCost = Math.max(500, calculatedCost);
          
          if (finalCost !== transportCost) {
            setTransportCost(finalCost);
          }
        }

      } catch (err) {
        console.error("Error during distance calculation:", err);
      } finally {
        setCalculatingDist(false);
      }
    }
    
    calcDistances();
  }, [userLocation, data, transportCost]);

  const handleSearchLocation = async () => {
    if (!searchQuery) return;
    try {
      setSearchingLoc(true);
      setSearchError(null);
      const res = await searchLocation(searchQuery);
      if (res.length === 0) {
        setSearchError('No locations found. Please try a different name.');
      }
      setSearchResults(res);
    } catch (err) {
      setSearchError(err.message || 'Unable to search location right now. Please try again.');
    } finally {
      setSearchingLoc(false);
    }
  };

  if (!lotId) {
    return (
      <Layout title="Net Realisation" showBack>
        <div className="p-4">Please select a lot to view net realisation.</div>
      </Layout>
    );
  }

  return (
    <Layout title="शुद्ध लाभ (Net Realisation)" showBack>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Location Search Phase */}
        <Card className="p-4 border-green-200">
          <h3 className="text-sm font-bold text-green-800 mb-3 uppercase flex items-center gap-2">
            📍 Your Location
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search village / town / city"
              className="flex-1 rounded-lg border-gray-300 p-2 text-sm focus:ring-green-500 focus:border-green-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()}
            />
            <Button variant="primary" onClick={handleSearchLocation} disabled={searchingLoc}>
              {searchingLoc ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchError && <p className="text-xs text-red-500 mt-2">{searchError}</p>}
          
          {searchResults.length > 0 && !userLocation && (
            <div className="mt-3 border rounded-lg overflow-hidden divide-y">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  className="w-full text-left p-3 text-sm hover:bg-green-50 active:bg-green-100 transition-colors"
                  onClick={() => {
                    setUserLocation(res);
                    setSearchQuery(res.name);
                    setSearchResults([]);
                  }}
                >
                  📍 {res.name}
                </button>
              ))}
            </div>
          )}

          {userLocation && searchResults.length === 0 && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded p-3 flex justify-between items-center">
              <div>
                <p className="text-xs text-green-800 font-semibold uppercase mb-0.5">Selected Location</p>
                <p className="text-sm text-green-900 line-clamp-1">{userLocation.name}</p>
              </div>
              <button 
                onClick={() => { setUserLocation(null); setSearchQuery(''); }}
                className="text-xs text-green-600 underline"
              >
                Change
              </button>
            </div>
          )}
        </Card>

        {/* Cost Inputs */}
        <Card className="bg-blue-50 border-blue-100 p-4">
          <h3 className="text-sm font-bold text-blue-800 mb-3 uppercase">खर्च का अनुमान (Estimated Costs)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Transport Cost (₹ Total)
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
                Storage Cost (₹ Total)
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
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">✨</div>
                <h3 className="text-green-100 text-sm font-bold uppercase tracking-wide">Best Selling Option</h3>
                <h2 className="text-2xl font-bold mt-1">
                  {data.bestOption.name}
                  {data.bestOption.type === 'mandi' && <span className="text-sm font-normal ml-2 bg-green-500 px-2 py-0.5 rounded text-white">(Govt. Mandi)</span>}
                  {data.bestOption.type === 'buyer' && <span className="text-sm font-normal ml-2 bg-blue-500 px-2 py-0.5 rounded text-white">(Buyer Offer)</span>}
                </h2>
                
                {data.bestOption.type === 'mandi' && userLocation && (
                  <p className="text-sm text-green-200 mt-1">
                    {calculatingDist ? 'Calculating distance...' : (distances[data.bestOption.name] && distances[data.bestOption.name].value !== null) ? (
                      `Distance: ${distances[data.bestOption.name].type === 'osrm' ? Number(distances[data.bestOption.name].value).toFixed(1) : distances[data.bestOption.name].value} km ${distances[data.bestOption.name].type === 'fallback' ? '(Estimated)' : ''}`
                    ) : 'Distance: Needs Config'}
                  </p>
                )}

                <div className="mt-4 bg-white/10 rounded-xl p-3 grid grid-cols-2 gap-2 text-sm">
                  <div>Selling Price:</div>
                  <div className="font-bold text-right">₹{data.bestOption.sellingPrice} /{data.lot.unit}</div>
                  
                  <div>Gross Realisation:</div>
                  <div className="font-bold text-right">₹{data.bestOption.grossRealisation.toLocaleString()}</div>
                  
                  <div className="text-green-200 border-t border-green-500/50 pt-1 mt-1">Transport Cost:</div>
                  <div className="text-green-200 text-right border-t border-green-500/50 pt-1 mt-1">- ₹{data.bestOption.transportCost}</div>
                  
                  <div className="text-green-200">Storage Cost:</div>
                  <div className="text-green-200 text-right">- ₹{data.bestOption.storageCost}</div>
                  
                  <div className="font-bold text-lg border-t border-white/20 pt-2 mt-1">NET REALISATION:</div>
                  <div className="font-bold text-lg text-right border-t border-white/20 pt-2 mt-1">₹{data.bestOption.netRealisation.toLocaleString()}</div>
                </div>
              </div>
            ) : (
              <EmptyState title="No Options Available" subtitle="There are no nearby mandis or buyer offers for this crop." />
            )}

            {/* AVAILABLE MANDIS SECTION (Requested Phase 4) */}
            {data.mandiOptions && data.mandiOptions.length > 0 && (
              <div className="space-y-3 mt-8">
                <h3 className="text-sm font-bold text-gray-700 uppercase px-1">Available Mandis</h3>
                
                {data.mandiOptions.map((opt) => (
                  <Card key={opt.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-800 text-base">{opt.name}</h4>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {marketLocations[opt.name]?.district || 'Unknown District'}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">Modal Price: ₹{opt.sellingPrice}/q</p>
                      </div>
                      <div className="text-right">
                        {userLocation ? (
                          <>
                            {calculatingDist ? (
                              <p className="text-xs text-gray-500 animate-pulse">Calculating...</p>
                            ) : (distances[opt.name] && distances[opt.name].value !== null) ? (
                              <div>
                                <p className="text-lg font-bold text-blue-600">
                                  {distances[opt.name].type === 'osrm' ? Number(distances[opt.name].value).toFixed(1) : distances[opt.name].value} km
                                </p>
                                {distances[opt.name].type === 'fallback' && (
                                  <p className="text-[10px] text-gray-400 uppercase">Estimated</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-red-400">Needs Config</p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 max-w-[100px] leading-tight">Search location to see distance</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Other Buyer Options */}
            {data.buyerOptions && data.buyerOptions.length > 0 && (
              <div className="space-y-3 mt-8">
                <h3 className="text-sm font-bold text-gray-700 uppercase px-1">Buyer Offers</h3>
                
                {data.buyerOptions
                  .filter(opt => opt.id !== data.bestOption?.id)
                  .map((opt) => (
                    <Card key={opt.id} className="p-4 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800 text-base">{opt.name}</h4>
                          <span className="text-[10px] uppercase font-bold text-white bg-blue-500 px-1.5 py-0.5 rounded">
                            Buyer Offer
                          </span>
                          <p className="text-sm text-gray-700 mt-1">Price: ₹{opt.sellingPrice} /{data.lot.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-0.5">Net Realisation</p>
                          <p className="text-xl font-bold text-blue-600">₹{opt.netRealisation.toLocaleString()}</p>
                        </div>
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
