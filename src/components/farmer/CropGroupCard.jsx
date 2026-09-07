import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CropGroupCard({ group }) {
  const navigate = useNavigate();
  
  const prices = group.markets.map(m => m.modalPrice || m.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  return (
    <div
      onClick={() => navigate(`/farmer/trend/${encodeURIComponent(group.cropName.toLowerCase())}`)}
      className="bg-white rounded-2xl p-4 shadow-[0_1px_6px_rgba(0,0,0,0.08)] cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          {group.cropEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 truncate">{group.cropNameHi}</h2>
          <p className="text-sm text-gray-500 truncate">{group.cropName}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-500 mb-0.5">Best Modal Price</p>
          <p className="text-lg font-bold text-green-600">
            ₹{maxPrice.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">{group.markets.length}</span> Markets Available
        </div>
        <div className="text-sm text-gray-500">
          Range: <span className="font-medium text-gray-700">₹{minPrice.toLocaleString('en-IN')} – ₹{maxPrice.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
